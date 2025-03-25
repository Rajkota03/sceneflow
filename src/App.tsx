
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from './pages/Index';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import StructureEditor from './pages/StructureEditor';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { FormatProvider } from '@/lib/formatContext';
import { supabase } from './integrations/supabase/client';

// Create a new query client
const queryClient = new QueryClient();

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

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ session, setSession }}>
        <FormatProvider>
          <Router>
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
                path="/structure/:structureId" 
                element={
                  <ProtectedRoute>
                    <StructureEditor />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </FormatProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
