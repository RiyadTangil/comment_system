import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CommentItem from './CommentItem';

const ReplyList = ({ parentId, socket, show }) => {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState('');

  const fetchReplies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/comments?parentId=${parentId}&sort=newest&limit=50`);
      setReplies(res.data.comments);
    } catch (err) {
      toast.error('Failed to load replies');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!show) return;
    fetchReplies();
  }, [show, parentId]);

  useEffect(() => {
    if (!socket) return;
    const onNew = (comment) => {
      if (comment.parentId === parentId) {
        setReplies(prev => [comment, ...prev]);
      }
    };
    const onDelete = (id) => {
      setReplies(prev => prev.filter(c => c._id !== id));
    };
    const onUpdate = (updated) => {
      if (updated.parentId === parentId) {
        setReplies(prev => prev.map(c => c._id === updated._id ? updated : c));
      }
    };
    socket.on('newComment', onNew);
    socket.on('deleteComment', onDelete);
    socket.on('updateComment', onUpdate);
    return () => {
      socket.off('newComment', onNew);
      socket.off('deleteComment', onDelete);
      socket.off('updateComment', onUpdate);
    };
  }, [socket, parentId, show]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await axios.post('/api/comments', { content: replyText, parentId });
      setReplyText('');
      toast.success('Reply posted');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to post reply');
    }
  };

  if (!show) return null;

  return (
    <div className="replies">
      <form onSubmit={handleReplySubmit} className="reply-form">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write a reply..."
          required
        />
        <button type="submit" className="btn btn-primary">Reply</button>
      </form>
      {loading ? (
        <p className="muted">Loading replies...</p>
      ) : (
        <div className="reply-list">
          {replies.map(r => (
            <CommentItem key={r._id} comment={r} socket={socket} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyList;
