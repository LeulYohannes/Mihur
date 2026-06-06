import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Explore', to: '/' },
  { label: 'Categories', to: '/categories' },
  { label: 'My Learning', to: '/my-learning' },
  { label: 'Questionnaire', to: '/questionnaire' },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="navbar fixed top-0 left-0 right-0 z-50">
      <div className="layout-container flex items-center justify-between gap-6">
      <Link to="/" className="flex items-center gap-2 text-primary font-playfair headline-md">
  <GraduationCap className="w-7 h-7 text-primary" />
  <span>Mihur</span>
</Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/auth" className="nav-link">
                Sign in
              </Link>
              <Link to="/auth" className="btn-primary">
                Get Started
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-secondary hidden md:block text-sm">
                {user.email}
              </span>
              <button type="button" onClick={handleSignOut} className="btn-secondary">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;