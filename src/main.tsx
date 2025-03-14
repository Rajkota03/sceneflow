import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'
import { ClerkProvider } from '@clerk/clerk-react'

// Get the publishable key, but provide a fallback for development
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Conditionally use ClerkProvider only if a valid key is available
const Root = () => {
  // If no valid key is available, render the app without Clerk authentication
  if (!publishableKey || publishableKey === 'pk_test_dummy-key-for-development') {
    console.warn('No valid Clerk publishable key found. Authentication features will be disabled.');
    return <App />;
  }

  // Otherwise, use ClerkProvider with the valid key
  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "shadow-md rounded-lg",
          formButtonPrimary: "bg-primary hover:bg-primary/90"
        }
      }}
    >
      <App />
    </ClerkProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
