import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Habit Tracker</Link>
      </div>

      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/habits">Habits</NavLink>
            <NavLink to="/archived">Archived</NavLink>
            <span className="user-pill">{user?.name}</span>
            <button className="secondary-button" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
