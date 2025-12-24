import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AddComment = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await axios.post('/api/comments', { content });
      setContent('');
      toast.success('Comment posted');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to post comment');
    }
    setLoading(false);
  };

  return (
    <div className="add-comment">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          required
        />
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
};

export default AddComment;
