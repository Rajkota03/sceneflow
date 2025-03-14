
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  
  const isHome = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';
  const isEditor = location.pathname.includes('/editor');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
              
              <SignedIn>
                {!isDashboard && !isEditor && (
                  <Link to="/dashboard" className="text-slate-600 hover:text-primary transition-colors">Dashboard</Link>
                )}
                {!isEditor && isDashboard && (
                  <Link to="/dashboard" className="text-slate-600 hover:text-primary font-semibold transition-colors">My Projects</Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        {user?.profileImageUrl ? (
                          <img 
                            src={user.profileImageUrl} 
                            alt={user.fullName || 'User'} 
                            className="w-8 h-8 rounded-full object-cover" 
                          />
                        ) : (
                          <User size={20} className="text-slate-500" />
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.fullName || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-500 focus:text-red-500" 
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SignedIn>

              <SignedOut>
                <Button asChild variant="ghost">
                  <Link to="/sign-in" className="text-slate-600 hover:text-primary transition-colors">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/sign-up">Get Started</Link>
                </Button>
              </SignedOut>
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
            
            <SignedIn>
              {!isDashboard && !isEditor && (
                <Link 
                  to="/dashboard" 
                  className="text-slate-600 hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link 
                to="/profile" 
                className="text-slate-600 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Button 
                variant="ghost" 
                className="justify-start text-red-500 hover:text-red-600 hover:bg-red-50 py-2"
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut size={16} className="mr-2" />
                Log out
              </Button>
            </SignedIn>

            <SignedOut>
              <Link 
                to="/sign-in" 
                className="text-slate-600 hover:text-primary transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Button 
                asChild
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/sign-up">Get Started</Link>
              </Button>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
