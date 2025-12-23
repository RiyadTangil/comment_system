import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const CommentItem = ({ comment }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = user && user.id === comment.user._id;
  const liked = comment.likes.includes(user?.id);
  const disliked = comment.dislikes.includes(user?.id);

  const handleLike = async () => {
    try {
      await axios.put(`http://localhost:5000/api/comments/${comment._id}/like`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Action failed');
    }
  };

  const handleDislike = async () => {
    try {
      await axios.put(`http://localhost:5000/api/comments/${comment._id}/dislike`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Action failed');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/comments/${comment._id}`);
        toast.success('Comment deleted');
      } catch (err) {
        toast.error(err.response?.data?.msg || 'Delete failed');
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/comments/${comment._id}`, { content: editContent });
      setIsEditing(false);
      toast.success('Comment updated');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Update failed');
    }
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <span className="username">{comment.user.username}</span>
        <span className="date">{new Date(comment.createdAt).toLocaleString()}</span>
      </div>
      
      {isEditing ? (
        <div className="edit-mode">
          <textarea 
            value={editContent} 
            onChange={(e) => setEditContent(e.target.value)} 
          />
          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="comment-content">{comment.content}</div>
      )}

      <div className="comment-actions">
        <button 
            onClick={handleLike} 
            className={liked ? 'active' : ''}
            disabled={!user}
        >
          Like ({comment.likes.length})
        </button>
        <button 
            onClick={handleDislike} 
            className={disliked ? 'active' : ''}
            disabled={!user}
        >
          Dislike ({comment.dislikes.length})
        </button>
        
        {isOwner && (
          <>
            <button onClick={() => setIsEditing(true)}>Edit</button>
            <button onClick={handleDelete}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
