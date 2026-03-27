import { useEffect, useState, useRef } from "react";
import { MousePointer2, User, Check } from "lucide-react";

const StoryAnimation = () => {
  const [sequence, setSequence] = useState(1);
  const [userCount, setUserCount] = useState(159);
  const [feedbackCount, setFeedbackCount] = useState(34);
  const [isHandVisible, setIsHandVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Timing Controller
  useEffect(() => {
    const runAnimation = async () => {
      // Sequence 1: Publish
      await new Promise(r => setTimeout(r, 1000));
      setIsHandVisible(true);
      await new Promise(r => setTimeout(r, 2500));
      setSequence(2);
      setIsHandVisible(false);

      // Sequence 2: Stats
      await new Promise(r => setTimeout(r, 1000));
      const userInterval = setInterval(() => {
        setUserCount(prev => (prev < 173 ? prev + 1 : prev));
      }, 100);
      const feedbackInterval = setInterval(() => {
        setFeedbackCount(prev => (prev < 45 ? prev + 1 : prev));
      }, 150);
      
      await new Promise(r => setTimeout(r, 3000));
      clearInterval(userInterval);
      clearInterval(feedbackInterval);
      setSequence(3);

      // Sequence 3: Feedback List
      await new Promise(r => setTimeout(r, 4000));
      setSequence(4);

      // Sequence 4: Growth
      await new Promise(r => setTimeout(r, 6000));
      // Loop back or stay? Let's reset for continuous loop
      setSequence(1);
      setUserCount(159);
      setFeedbackCount(34);
    };

    runAnimation();
  }, []);

  return (
    <section className="py-32 bg-white overflow-hidden flex flex-col items-center justify-center min-h-[800px]">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="relative w-full aspect-video bg-white border-[3px] border-black/5 rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
          
          {/* THE MONITOR SCREEN CONTENT */}
          <div className="absolute inset-0 p-8 flex items-center justify-center">
            
            {/* Sequence 1: Publish Button */}
            {sequence === 1 && (
              <div className="relative animate-in fade-in zoom-in duration-700">
                <button className="px-12 py-4 bg-[#0B64F4] text-white font-bold rounded-xl text-xl shadow-[0_10px_30px_-5px_rgba(11,100,244,0.4)] relative group">
                  Publish
                  {/* Explosion lines (hidden until click) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="absolute w-1 h-20 bg-[#0B64F4] rotate-0 translate-y-[-60px] animate-out fade-out slide-out-to-top-20 duration-500 delay-[1.8s] opacity-0 group-active:opacity-100" />
                    <div className="absolute w-1 h-20 bg-[#0B64F4] rotate-45 translate-x-[40px] translate-y-[-40px] animate-out fade-out duration-500 delay-[1.8s] opacity-0 group-active:opacity-100" />
                    <div className="absolute w-1 h-20 bg-[#0B64F4] rotate-90 translate-x-[60px] animate-out fade-out duration-500 delay-[1.8s] opacity-0 group-active:opacity-100" />
                    <div className="absolute w-1 h-20 bg-[#0B64F4] rotate-135 translate-x-[40px] translate-y-[40px] animate-out fade-out duration-500 delay-[1.8s] opacity-0 group-active:opacity-100" />
                    <div className="absolute w-1 h-20 bg-[#0B64F4] rotate-180 translate-y-[60px] animate-out fade-out duration-500 delay-[1.8s] opacity-0 group-active:opacity-100" />
                  </div>
                </button>
                
                {/* Digital Pointer */}
                <div className="absolute top-20 left-40 animate-[move-pointer_2s_ease-in-out_forwards] delay-500">
                  <MousePointer2 className="text-black fill-black" size={24} />
                </div>
              </div>
            )}

            {/* Sequence 2: Stats Counting */}
            {sequence === 2 && (
              <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b-2 border-black/5 pb-4">
                    <span className="text-2xl font-medium text-black/40">Users</span>
                    <span className="text-6xl font-black text-black tabular-nums">{userCount}</span>
                  </div>
                  <div className="flex justify-between items-end border-b-2 border-black/5 pb-4">
                    <span className="text-2xl font-medium text-black/40">Feedback</span>
                    <span className="text-6xl font-black text-black tabular-nums">{feedbackCount}</span>
                  </div>
                </div>
                
                <div className="flex justify-center pt-8">
                  <button className="px-8 py-3 rounded-full border-2 border-black/10 font-bold text-black/60 hover:text-[#0B64F4] hover:border-[#0B64F4] transition-all animate-in fade-in duration-1000 delay-1000">
                    see feedback
                  </button>
                </div>

                {/* Digital Pointer for Next Click */}
                <div className="absolute bottom-10 right-1/2 animate-[move-pointer-feedback_2s_ease-in-out_forwards] delay-[2.5s]">
                  <MousePointer2 className="text-black fill-black" size={24} />
                </div>
              </div>
            )}

            {/* Sequence 3: User List */}
            {sequence === 3 && (
              <div className="w-full max-w-lg space-y-4 animate-in fade-in duration-500">
                {[
                  { name: "@Sam", msg: "update #1" },
                  { name: "@John", msg: "update #2" },
                  { name: "@Roman", msg: "update #3" }
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-black/5 bg-white animate-in slide-in-from-bottom-8 duration-500"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0B64F4] flex items-center justify-center text-white">
                      <User size={20} />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-black">{item.name}</span>
                      <span className="mx-2 text-black/20">—</span>
                      <span className="text-black/60">{item.msg}</span>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-center pt-10">
                  <button className="px-10 py-4 bg-black text-white font-black rounded-2xl hover:bg-[#0B64F4] transition-all animate-in fade-in duration-700 delay-1000 relative overflow-hidden group">
                    <span className="relative z-10">Implement</span>
                    <div className="absolute inset-0 bg-[#0B64F4] translate-y-full group-active:translate-y-0 transition-transform duration-300" />
                  </button>
                </div>

                {/* Digital Pointer for Implement Click */}
                <div className="absolute bottom-4 right-1/3 animate-[move-pointer-implement_2s_ease-in-out_forwards] delay-[2.5s]">
                  <MousePointer2 className="text-black fill-black" size={24} />
                </div>
              </div>
            )}

            {/* Sequence 4: Growth Dashboard */}
            {sequence === 4 && (
              <div className="w-full h-full flex flex-col animate-in fade-in zoom-in-95 duration-1000">
                {/* Header */}
                <div className="flex items-center gap-3 mb-12">
                  <div className="w-12 h-12 rounded-2xl border-2 border-[#0B64F4] flex items-center justify-center">
                    <div className="w-6 h-6 rounded-lg bg-[#0B64F4]/20" />
                  </div>
                  <span className="text-2xl font-black tracking-tighter italic">MyApp</span>
                </div>

                {/* Graph */}
                <div className="flex-1 relative">
                  {/* Axes */}
                  <div className="absolute left-0 bottom-0 w-full h-0.5 bg-black/5" />
                  <div className="absolute left-0 bottom-0 w-0.5 h-full bg-black/5" />
                  
                  {/* Growth Line SVG */}
                  <svg className="w-full h-full relative z-10 overflow-visible" viewBox="0 0 800 400">
                    <path 
                      d="M 0 400 Q 200 380, 400 250 T 800 50" 
                      fill="none" 
                      stroke="#0B64F4" 
                      strokeWidth="6" 
                      strokeLinecap="round"
                      className="animate-[draw-line_4s_ease-out_forwards] delay-500"
                      style={{ strokeDasharray: 1200, strokeDashoffset: 1200 }}
                    />
                    {/* Pulsing end point */}
                    <circle 
                      cx="800" cy="50" r="8" 
                      fill="#0B64F4" 
                      className="animate-in fade-in zoom-in duration-500 delay-[4s]"
                    />
                  </svg>
                </div>
              </div>
            )}

          </div>

          {/* PHYSICAL ELEMENTS (External to monitor) */}
          
          {/* Hand with Mouse */}
          <div 
            className={`absolute bottom-[-100px] right-[-50px] transition-all duration-1000 ease-in-out ${
              isHandVisible ? "translate-y-[-120px] translate-x-[-150px]" : "translate-y-0 translate-x-0"
            }`}
          >
            {/* Simple outline hand and mouse */}
            <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Arm/Hand Outline */}
              <path d="M280 280C250 220 220 180 180 160C140 140 100 150 80 180" stroke="black" strokeWidth="2" strokeLinecap="round" />
              {/* Mouse Outline */}
              <rect x="60" y="140" width="60" height="100" rx="30" stroke="black" strokeWidth="2" />
              <line x1="90" y1="140" x2="90" y2="170" stroke="black" strokeWidth="2" />
            </svg>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes move-pointer {
          0% { transform: translate(200px, 200px); }
          70% { transform: translate(0, 0); }
          85% { transform: translate(0, 0) scale(0.8); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes move-pointer-feedback {
          0% { transform: translate(100px, 100px); opacity: 0; }
          20% { opacity: 1; }
          70% { transform: translate(0, 0); }
          85% { transform: translate(0, 0) scale(0.8); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes move-pointer-implement {
          0% { transform: translate(-100px, 50px); opacity: 0; }
          20% { opacity: 1; }
          70% { transform: translate(0, 0); }
          85% { transform: translate(0, 0) scale(0.8); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes draw-line {
          to { stroke-dashoffset: 0; }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </section>
  );
};

export default StoryAnimation;
