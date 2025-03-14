
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'
import { ClerkProvider } from '@clerk/clerk-react'

// Get the publishable key, but provide a fallback for development
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_dummy-key-for-development';

// Wrap with ClerkProvider for authentication
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
  </React.StrictMode>,
)
