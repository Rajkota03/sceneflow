
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { currentUser } from '../lib/mockData';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';
  const isEditor = location.pathname.includes('/editor');

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isEditor ? 'opacity-0 hover:opacity-100' : ''}`}>
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-serif font-bold text-slate-900 flex items-center space-x-2">
              <span className="text-primary">Scene</span>
              <span>Flow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-6 items-center">
              {isHome && (
                <>
                  <a href="#features" className="text-slate-600 hover:text-primary transition-colors">Features</a>
                  <a href="#about" className="text-slate-600 hover:text-primary transition-colors">About</a>
                </>
              )}
              
              {currentUser ? (
                <>
                  {!isDashboard && !isEditor && (
                    <Link to="/dashboard" className="text-slate-600 hover:text-primary transition-colors">Dashboard</Link>
                  )}
                  {!isEditor && isDashboard && (
                    <Link to="/dashboard" className="text-slate-600 hover:text-primary font-semibold transition-colors">My Projects</Link>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">{currentUser.name}</span>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <User size={20} className="text-slate-500" />
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/dashboard" className="text-slate-600 hover:text-primary transition-colors">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/dashboard">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-700 hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg p-4 animate-slide-in-right">
          <div className="flex flex-col space-y-4">
            {isHome && (
              <>
                <a 
                  href="#features" 
                  className="text-slate-600 hover:text-primary transition-colors py-2" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#about" 
                  className="text-slate-600 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </a>
              </>
            )}
            
            {currentUser ? (
              <>
                {!isDashboard && !isEditor && (
                  <Link 
                    to="/dashboard" 
                    className="text-slate-600 hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                <div className="flex items-center space-x-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <User size={20} className="text-slate-500" />
                    )}
                  </div>
                  <span className="text-sm text-slate-600">{currentUser.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-slate-600 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Button 
                  asChild
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link to="/dashboard">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
