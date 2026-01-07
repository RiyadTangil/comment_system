import * as commentService from '../services/commentService.js';

export const getComments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { comments, total } = await commentService.getComments(req.query);

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

export const addComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;
    const userId = req.user.id;

    const populatedComment = await commentService.addComment(userId, content, parentId);

    // Emit real-time event
    const io = req.app.get('socketio');
    io.emit('newComment', populatedComment);

    res.json(populatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    await commentService.deleteComment(req.params.id, req.user.id);

    const io = req.app.get('socketio');
    io.emit('deleteComment', req.params.id);

    res.json({ msg: 'Comment removed' });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const response = statusCode === 500 ? { error: err.message } : { msg: err.message };
    res.status(statusCode).json(response);
  }
};

export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const populatedComment = await commentService.updateComment(req.params.id, req.user.id, content);

    const io = req.app.get('socketio');
    io.emit('updateComment', populatedComment);

    res.json(populatedComment);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const response = statusCode === 500 ? { error: err.message } : { msg: err.message };
    res.status(statusCode).json(response);
  }
};

export const likeComment = async (req, res) => {
  try {
    const populatedComment = await commentService.likeComment(req.params.id, req.user.id);

    const io = req.app.get('socketio');
    io.emit('updateComment', populatedComment);

    res.json(populatedComment);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const response = statusCode === 500 ? { error: err.message } : { msg: err.message };
    res.status(statusCode).json(response);
  }
};

export const dislikeComment = async (req, res) => {
  try {
    const populatedComment = await commentService.dislikeComment(req.params.id, req.user.id);

    const io = req.app.get('socketio');
    io.emit('updateComment', populatedComment);

    res.json(populatedComment);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    const response = statusCode === 500 ? { error: err.message } : { msg: err.message };
    res.status(statusCode).json(response);
  }
};
