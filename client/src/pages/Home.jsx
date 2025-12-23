import { useAuth } from '../context/AuthContext';
import CommentList from '../components/CommentList';
import AddComment from '../components/AddComment';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="home-page">
      <div className="home-container">
        <header className="header">
          <h1 className="brand">Comment System</h1>
          <div className="user-info">
            <span className="welcome">Welcome, {user?.username}</span>
            <button onClick={logout} className="btn btn-danger">Logout</button>
          </div>
        </header>
        <div className="content">
          <AddComment />
          <CommentList />
        </div>
      </div>
    </div>
  );
};

export default Home;
