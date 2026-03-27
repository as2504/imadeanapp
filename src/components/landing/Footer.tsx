import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="py-20 bg-white border-t border-black/[0.03]">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tighter">Showcase<span className="text-[#4285F4]">.</span></h3>
            <p className="text-sm text-black/40 font-medium max-w-xs">
              The premium platform for the next generation of builders.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-black/20">Product</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/")} className="text-sm font-semibold text-black/60 hover:text-[#4285F4] transition-colors">Home</button></li>
                <li><button onClick={() => navigate("/trending")} className="text-sm font-semibold text-black/60 hover:text-[#4285F4] transition-colors">Showcase</button></li>
                <li><button onClick={() => navigate("/publish")} className="text-sm font-semibold text-black/60 hover:text-[#4285F4] transition-colors">Publish</button></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-black/20">Legal</h4>
              <ul className="space-y-2">
                <li><button className="text-sm font-semibold text-black/60 hover:text-[#4285F4] transition-colors">Privacy</button></li>
                <li><button className="text-sm font-semibold text-black/60 hover:text-[#4285F4] transition-colors">Terms</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-black/[0.03] flex justify-between items-center">
          <p className="text-xs font-bold text-black/20 tracking-wider uppercase">© {year} Showcase. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="text-xs font-bold text-black/20 hover:text-black transition-colors uppercase tracking-widest">Twitter</button>
            <button className="text-xs font-bold text-black/20 hover:text-black transition-colors uppercase tracking-widest">GitHub</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
