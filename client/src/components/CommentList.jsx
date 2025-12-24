import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import CommentItem from './CommentItem';
import { toast } from 'react-hot-toast';
import { SOCKET_URL } from '../utils/config';

const CommentList = () => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    fetchComments();
  }, [page, sort]);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('newComment', (comment) => {
      if (comment.parentId) return;
      if (sort === 'newest' && page === 1) {
        setComments(prev => [comment, ...prev].slice(0, 10));
      }
    });
    socketRef.current.on('deleteComment', (id) => {
      setComments(prev => prev.filter(c => c._id !== id));
    });
    socketRef.current.on('updateComment', (updatedComment) => {
      if (updatedComment.parentId) return;
      setComments(prev => prev.map(c => c._id === updatedComment._id ? updatedComment : c));
    });
    return () => {
      socketRef.current && socketRef.current.disconnect();
    };
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/comments?parentOnly=true&page=${page}&sort=${sort}&limit=10`);
      setComments(res.data.comments);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error('Failed to load comments');
    }
    setLoading(false);
  };

  return (
    <div className="comment-list-container">
      <div className="controls">
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="mostLiked">Most Liked</option>
          <option value="mostDisliked">Most Disliked</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} socket={socketRef.current} />
          ))}
        </div>
      )}

      <div className="pagination">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button 
          disabled={page === totalPages} 
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CommentList;
