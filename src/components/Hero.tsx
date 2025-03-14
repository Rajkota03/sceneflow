
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PenLine, BookOpen, Save } from 'lucide-react';

const Hero = () => {
  return (
    <section className="min-h-screen hero-gradient pt-20 flex flex-col justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] -z-10"></div>
      
      <div className="container mx-auto px-4 py-16 flex flex-col items-center">
        <div className="text-center max-w-5xl mx-auto mb-12 animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-slate-900 mb-6 tracking-tight text-balance">
            Write your screenplay with elegance and precision
          </h1>
          <p className="text-xl text-slate-600 mb-8 mx-auto max-w-3xl text-balance">
            Scene Flow is a professional screenwriting tool that formats your script as you write, allowing you to focus on what matters most—your story.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 font-medium text-lg">
              <Link to="/dashboard">Start Writing</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 font-medium text-lg">
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
        
        <div className="relative w-full max-w-4xl mx-auto mt-8 animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
          <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
            <div className="bg-slate-800 p-3 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-center flex-1 text-white font-medium text-sm">Summer Days.fountain</div>
            </div>
            <div className="p-6 bg-editor-paper">
              <div className="font-mono text-sm md:text-base">
                <div className="scene-heading">INT. COFFEE SHOP - DAY</div>
                <div className="action">SARAH, 30s, stares out the window as rain trickles down the glass. She takes a sip of her coffee and sighs.</div>
                <div className="character">SARAH</div>
                <div className="dialogue">Another beautiful summer day.</div>
                <div className="action">The door CHIMES. MARK, 40s, enters, shaking water from his umbrella. He spots Sarah and approaches.</div>
                <div className="character">MARK</div>
                <div className="parenthetical">(smiling)</div>
                <div className="dialogue">Some people just love complaining about the weather.</div>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-6 -right-6 -z-10 w-full h-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl transform rotate-3"></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16" id="features">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-slate-900 animate-fade-in opacity-0" style={{ animationDelay: '0.5s' }}>Craft your story with powerful tools</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto animate-fade-in opacity-0" style={{ animationDelay: '0.6s' }}>Everything you need to write professional screenplays, all in one place.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-xl animate-fade-in opacity-0" style={{ animationDelay: '0.7s' }}>
            <div className="mb-4 text-primary">
              <PenLine size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2 text-slate-900">Auto-Formatting</h3>
            <p className="text-slate-600">Automatically formats your screenplay to industry standards as you type, so you can focus on writing.</p>
          </div>
          
          <div className="glass-card p-8 rounded-xl animate-fade-in opacity-0" style={{ animationDelay: '0.8s' }}>
            <div className="mb-4 text-primary">
              <Save size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2 text-slate-900">Auto-Save</h3>
            <p className="text-slate-600">Never lose your work with automatic saving. Your screenplay is saved as you write, giving you peace of mind.</p>
          </div>
          
          <div className="glass-card p-8 rounded-xl animate-fade-in opacity-0" style={{ animationDelay: '0.9s' }}>
            <div className="mb-4 text-primary">
              <BookOpen size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2 text-slate-900">Script Analysis</h3>
            <p className="text-slate-600">Generate detailed reports about your screenplay, including character dialogue count and scene breakdowns.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
