import { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import CommentItem from './CommentItem';
import { toast } from 'react-hot-toast';

const CommentList = () => {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
    
    const socket = io('http://localhost:5000');
    
    socket.on('newComment', (comment) => {
        // If sorting is newest, prepend. Otherwise, refetch or insert appropriately.
        // For simplicity and to match requirements, if we are on page 1 and sorting by newest, prepend.
        // Or just refetch/update list.
        if (sort === 'newest' && page === 1) {
            setComments(prev => [comment, ...prev].slice(0, 10)); // Keep limit in check
        } else {
            // Optional: Show notification or refetch
            // fetchComments();
        }
    });

    socket.on('deleteComment', (id) => {
        setComments(prev => prev.filter(c => c._id !== id));
    });

    socket.on('updateComment', (updatedComment) => {
        setComments(prev => prev.map(c => c._id === updatedComment._id ? updatedComment : c));
    });

    return () => {
      socket.disconnect();
    };
  }, [page, sort]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/comments?page=${page}&sort=${sort}&limit=10`);
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
            <CommentItem key={comment._id} comment={comment} />
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
