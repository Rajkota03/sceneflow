
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/App';
import Logo from './Logo';
import { Button } from './ui/button';

const PublicNavbar: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  const handleDashboardClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      navigate('/sign-in', { state: { returnTo: '/dashboard' } });
    }
  };
  
  return (
    <nav className="fixed w-full bg-white z-10 border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
        </Link>
        
        <div className="flex items-center gap-4">
          {session ? (
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/sign-up">
                <Button>Get Started</Button>
              </Link>
              <Link to="/dashboard" onClick={handleDashboardClick}>
                <Button variant="outline">Dashboard</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
