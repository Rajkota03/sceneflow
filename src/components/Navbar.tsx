
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/App';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import Logo from './Logo';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { session } = useAuth();
  
  const isHome = location.pathname === '/';
  const isDashboard = location.pathname === '/dashboard';
  const isEditor = location.pathname.includes('/editor');

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const userFullName = session?.user?.user_metadata?.first_name 
    ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name || ''}`
    : 'User';
  
  const userEmail = session?.user?.email || '';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${isEditor ? 'opacity-0 hover:opacity-100' : ''}`}>
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="md" />
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
              
              {session ? (
                <>
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
                          <User size={20} className="text-slate-500" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{userFullName}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {userEmail}
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
                </>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/sign-in" className="text-slate-600 hover:text-primary transition-colors">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link to="/sign-up">Get Started</Link>
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
            
            {session ? (
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
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
