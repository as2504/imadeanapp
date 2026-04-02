import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="py-20 bg-card border-t border-border/40">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tighter text-foreground uppercase"><span className="text-primary">I</span>MAA</h3>
            <p className="text-sm text-muted-foreground font-medium max-w-xs">
              The premium platform for the next generation of builders.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Product</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate("/")} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Home</button></li>
                <li><button onClick={() => navigate("/trending")} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">imadeanapp</button></li>
                <li><button onClick={() => navigate("/publish")} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Publish</button></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Legal</h4>
              <ul className="space-y-2">
                <li><button className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Privacy</button></li>
                <li><button className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Terms</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border/40 flex justify-between items-center">
          <p className="text-xs font-bold text-muted-foreground/40 tracking-wider uppercase">© {year} imadeanapp. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button className="text-xs font-bold text-muted-foreground/40 hover:text-foreground transition-colors uppercase tracking-widest">Twitter</button>
            <button className="text-xs font-bold text-muted-foreground/40 hover:text-foreground transition-colors uppercase tracking-widest">GitHub</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
