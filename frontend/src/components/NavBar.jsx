import { Link } from 'react-router-dom';
import Logout from './Logout';
import { AuthContext } from '../AuthContext';
import { useContext } from 'react';
import '../NavBar.css';

function NavBar() {
  const { user } = useContext(AuthContext);

  return (
    <header className="navbar-container">
      <nav className="navbar">
        <Link to="/" className="navbar-logo-link">
          <img 
            src="/Vailor.png"
            alt="Vailor Logo" 
            className="navbar-logo"
          />
        </Link>

        <div className="navbar-links">

        {user && (
            <Link to="/bag">
              <img 
                src="/Bag.png"
                alt="Bag" 
                className="bag-logo"
          />
            </Link>
          )}

          {user && (
            <Link to="/profile">
              <button className='profile-btn'>Profile</button>
            </Link>
          )}
          {!user && (
            <Link to="/signup">
              <button className='signup-btn'>SignUp</button>
            </Link>
          )}
          {!user && (
            <Link to="/login">
              <button className='login-btn'>Login</button>
            </Link>
          )}
          {user && <Logout />}
        </div>
      </nav>
    </header>
  );
}

export default NavBar;