import Comment from '../models/Comment.js';

export const getComments = async ({ page = 1, limit = 10, sort = 'newest', parentId, parentOnly }) => {
  let sortOptions = {};
  if (sort === 'newest') {
    sortOptions = { createdAt: -1 };
  }

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
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
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
    total = await Comment.countDocuments();
  } else {
    comments = await Comment.find()
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'username');

    total = await Comment.countDocuments();
  }

  return { comments, total };
};

export const addComment = async (userId, content, parentId) => {
  const newComment = new Comment({
    content,
    user: userId,
    parentId: parentId || null
  });

  const savedComment = await newComment.save();
  const populatedComment = await savedComment.populate('user', 'username');
  return populatedComment;
};

export const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  if (comment.user.toString() !== userId) {
    const error = new Error('User not authorized');
    error.statusCode = 401;
    throw error;
  }

  await comment.deleteOne();
  return true;
};

export const updateComment = async (commentId, userId, content) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  if (comment.user.toString() !== userId) {
    const error = new Error('User not authorized');
    error.statusCode = 401;
    throw error;
  }

  comment.content = content;
  await comment.save();

  const populatedComment = await comment.populate('user', 'username');
  return populatedComment;
};

export const likeComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  if (comment.likes.includes(userId)) {
    const error = new Error('Comment already liked');
    error.statusCode = 400;
    throw error;
  }

  if (comment.dislikes.includes(userId)) {
    comment.dislikes.pull(userId);
  }

  comment.likes.push(userId);
  await comment.save();

  const populatedComment = await comment.populate('user', 'username');
  return populatedComment;
};

export const dislikeComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    const error = new Error('Comment not found');
    error.statusCode = 404;
    throw error;
  }

  if (comment.dislikes.includes(userId)) {
    const error = new Error('Comment already disliked');
    error.statusCode = 400;
    throw error;
  }

  if (comment.likes.includes(userId)) {
    comment.likes.pull(userId);
  }

  comment.dislikes.push(userId);
  await comment.save();

  const populatedComment = await comment.populate('user', 'username');
  return populatedComment;
};
