const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/authMiddleware');

// Public route to view comments
router.get('/', commentController.getComments);

// Protected routes
router.post('/', auth, commentController.addComment);
router.delete('/:id', auth, commentController.deleteComment);
router.put('/:id', auth, commentController.updateComment);
router.put('/:id/like', auth, commentController.likeComment);
router.put('/:id/dislike', auth, commentController.dislikeComment);

module.exports = router;
