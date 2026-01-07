import express from 'express';
import * as commentController from '../controllers/commentController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to view comments
router.get('/', commentController.getComments);

// Protected routes
router.post('/', auth, commentController.addComment);
router.delete('/:id', auth, commentController.deleteComment);
router.put('/:id', auth, commentController.updateComment);
router.put('/:id/like', auth, commentController.likeComment);
router.put('/:id/dislike', auth, commentController.dislikeComment);

export default router;
