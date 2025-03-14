
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

const Hero = () => {
  return (
    <div className="py-24 md:py-32 lg:py-40 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 mb-6">
            Craft Your Story, Perfect Your Screenplay
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            SceneFlow helps screenwriters bring their visions to life with intuitive
            screenplay formatting, structure tools, and a streamlined writing experience.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <SignedOut>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/sign-up" className="text-base">
                  Start Writing Now
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/sign-in" className="text-base">
                  Sign In
                </Link>
              </Button>
            </SignedOut>
            
            <SignedIn>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/dashboard" className="text-base">
                  Go to Dashboard
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
            </SignedIn>
          </div>
          
          <div className="mt-16">
            <div className="relative mx-auto max-w-4xl rounded-lg shadow-2xl overflow-hidden">
              <img 
                src="/placeholder.svg" 
                alt="SceneFlow Editor Preview" 
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
