
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { Loader } from 'lucide-react';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    console.log("Index page mounting");
    
    // Simulate checking if everything is loaded
    const timer = setTimeout(() => {
      console.log("Index page fully loaded");
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-gray-600">Loading application...</p>
            </div>
          </div>
        ) : (
          <Hero />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
