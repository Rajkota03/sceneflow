
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Session } from '@supabase/supabase-js';

import Index from './pages/Index';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import PublicNavbar from './components/PublicNavbar';
import Footer from './components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { FormatProvider } from '@/lib/formatContext';
import StructureEditorPage from './pages/StructureEditor';

// Safely get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create the client if we have the required configuration
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface AuthContextProps {
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  setSession: () => {}
});

export const useAuth = () => useContext(AuthContext);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  return session ? children : <Navigate to="/sign-in" />;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  useEffect(() => {
    async function initializeAuth() {
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          setSession(data.session);
          
          // Set up auth state change listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
              setSession(session);
            }
          );
          
          return () => {
            subscription.unsubscribe();
          };
        } else {
          console.warn('Supabase client not initialized. Missing environment variables.');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setInitializing(false);
      }
    }
    
    initializeAuth();
  }, []);

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading application...</p>
      </div>
    );
  }

  // If supabase is not initialized, show a helpful message
  if (!supabase) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
        <p className="text-lg mb-4">
          Missing Supabase configuration. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY 
          environment variables are set.
        </p>
        <p className="text-md">
          Check your .env file or environment configuration.
        </p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ session, setSession }}>
      <FormatProvider>
        <Router>
          <PublicNavbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sign-in/*" element={<SignIn />} />
            <Route path="/sign-up/*" element={<SignUp />} />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/editor/:projectId" 
              element={
                <ProtectedRoute>
                  <Editor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/structure/:structureId" 
              element={
                <ProtectedRoute>
                  <StructureEditorPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </Router>
        <Toaster />
      </FormatProvider>
    </AuthContext.Provider>
  );
}

export default App;
