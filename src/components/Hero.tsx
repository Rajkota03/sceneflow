
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/App';
import { motion } from 'framer-motion';

const Hero = () => {
  const { session } = useAuth();

  return (
    <div className="py-24 md:py-32 lg:py-40 bg-gradient-to-b from-slate-50 via-slate-100/60 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
              Craft Your Story, Perfect Your Screenplay
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              SceneFlow helps screenwriters bring their visions to life with intuitive
              screenplay formatting, structure tools, and a streamlined writing experience.
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {!session ? (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg">
                  <Link to="/sign-up" className="text-base">
                    Start Writing Now
                    <ArrowRight size={18} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-slate-300 hover:bg-slate-50">
                  <Link to="/sign-in" className="text-base">
                    Sign In
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="w-full sm:w-auto shadow-lg bg-primary hover:bg-primary/90">
                <Link to="/dashboard" className="text-base">
                  Go to Dashboard
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
            )}
          </motion.div>
          
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <div className="relative mx-auto max-w-4xl rounded-lg overflow-hidden shadow-[0_20px_80px_-15px_rgba(0,0,0,0.25)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 to-transparent pointer-events-none"></div>
              <img 
                src="/placeholder.svg" 
                alt="SceneFlow Editor Preview" 
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
