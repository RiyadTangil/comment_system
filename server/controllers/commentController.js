const Comment = require('../models/Comment');

exports.getComments = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'newest', parentId, parentOnly } = req.query;
    
    let sortOptions = {};
    if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } 
    // Note: Sorting by array length (mostLiked/mostDisliked) requires aggregation
    
    let comments;
    let total;

    if (parentId) {
        comments = await Comment.find({ parentId })
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .populate('user', 'username');
        total = await Comment.countDocuments({ parentId });
    } else if (parentOnly === 'true' && (sort === 'mostLiked' || sort === 'mostDisliked')) {
        const sortField = sort === 'mostLiked' ? 'likesCount' : 'dislikesCount';
        const aggregatePipeline = [
            { $match: { parentId: null } },
            { $addFields: { likesCount: { $size: "$likes" }, dislikesCount: { $size: "$dislikes" } } },
            { $sort: { [sortField]: -1, createdAt: -1 } },
            { $skip: (page - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
            { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: { content: 1, parentId: 1, likes: 1, dislikes: 1, createdAt: 1, updatedAt: 1, 'user._id': 1, 'user.username': 1 } }
        ];
        comments = await Comment.aggregate(aggregatePipeline);
        total = await Comment.countDocuments({ parentId: null });
    } else if (parentOnly === 'true') {
        comments = await Comment.find({ parentId: null })
          .sort(sortOptions)
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .populate('user', 'username');
        total = await Comment.countDocuments({ parentId: null });
    } else if (sort === 'mostLiked' || sort === 'mostDisliked') {
        // Use aggregation for sorting by array size
        const sortField = sort === 'mostLiked' ? 'likesCount' : 'dislikesCount';
        
        const aggregatePipeline = [
            {
                $addFields: {
                    likesCount: { $size: "$likes" },
                    dislikesCount: { $size: "$dislikes" }
                }
            },
            { $sort: { [sortField]: -1, createdAt: -1 } },
            { $skip: (page - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
            // Populate user details
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
             // Project necessary fields to match standard find output structure
            {
                $project: {
                    content: 1,
                    parentId: 1,
                    likes: 1,
                    dislikes: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    'user._id': 1,
                    'user.username': 1
                }
            }
        ];

        comments = await Comment.aggregate(aggregatePipeline);
        
        // Count total for pagination (separate query as aggregation count is complex)
        total = await Comment.countDocuments();
        
    } else {
        // Standard find for newest
        comments = await Comment.find()
          .sort(sortOptions)
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .populate('user', 'username');
          
        total = await Comment.countDocuments();
    }

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalComments: total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;
    
    const newComment = new Comment({
      content,
      user: req.user.id,
      parentId: parentId || null
    });

    const savedComment = await newComment.save();
    const populatedComment = await savedComment.populate('user', 'username');

    // Emit real-time event
    const io = req.app.get('socketio');
    io.emit('newComment', populatedComment);

    res.json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user is authorized
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await comment.deleteOne();
    
    const io = req.app.get('socketio');
    io.emit('deleteComment', req.params.id);

    res.json({ msg: 'Comment removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        comment.content = content;
        await comment.save();

        const populatedComment = await comment.populate('user', 'username');
        
        const io = req.app.get('socketio');
        io.emit('updateComment', populatedComment);

        res.json(populatedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.likeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        // Check if already liked
        if (comment.likes.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Comment already liked' });
        }

        // Remove from dislikes if present
        if (comment.dislikes.includes(req.user.id)) {
            comment.dislikes.pull(req.user.id);
        }

        comment.likes.push(req.user.id);
        await comment.save();
        
        const populatedComment = await comment.populate('user', 'username');

        const io = req.app.get('socketio');
        io.emit('updateComment', populatedComment);

        res.json(populatedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.dislikeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        // Check if already disliked
        if (comment.dislikes.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Comment already disliked' });
        }

        // Remove from likes if present
        if (comment.likes.includes(req.user.id)) {
            comment.likes.pull(req.user.id);
        }

        comment.dislikes.push(req.user.id);
        await comment.save();

        const populatedComment = await comment.populate('user', 'username');

        const io = req.app.get('socketio');
        io.emit('updateComment', populatedComment);

        res.json(populatedComment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
