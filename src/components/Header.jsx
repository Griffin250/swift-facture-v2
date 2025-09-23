import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Menu, X } from 'lucide-react';

const Header = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', to: '/' },
     { label: 'About', to: '/about' },
   { label: 'Receipt', to: '/receipt' },
      { label: 'Invoice', to: '/invoice' },
    { label: 'Help', to: '/help' },
  
  ];
  const location = useLocation();

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <header className="glass-card sticky top-0 z-50 px-4 py-3 animate-fade-in bg-gray-100">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl md:text-2xl font-bold gradient-text">PayFlow</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden md:block">Professional Invoice & Receipt Generator</p>
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-4">
          {navItems.map((item) => (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`text-sm font-medium px-3 py-2 rounded-md transition-smooth ${isActive(item.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center space-x-3">
            <button onClick={() => navigate('/premium')} className="px-3 py-2 rounded-md border border-border/50 text-sm gradient-text font-bold">Premium</button>
            <button onClick={() => navigate('/account')} className="px-3 py-2 rounded-md border border-border/70 text-sm gradient-text font-bold">Account</button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted/50"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="md:hidden bg-background/80 border-t border-border/20">
          <div className="container mx-auto px-4 py-3 flex flex-col">
            {navItems.map((item) => (
              <button
                key={item.to}
                onClick={() => {
                  navigate(item.to);
                  setOpen(false);
                }}
                className={`text-left w-full px-3 py-2 rounded-md text-sm ${isActive(item.to) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/30'}`}
              >
                {item.label}
              </button>
            ))}
            <div className="mt-2 flex gap-2">
              <button onClick={() => { navigate('/premium'); setOpen(false); }} className="flex-1 px-3 py-2 rounded-md border text-sm">Premium</button>
              <button onClick={() => { navigate('/account'); setOpen(false); }} className="flex-1 px-3 py-2 rounded-md bg-accent/10 text-accent-foreground text-sm">My Account</button>
            </div>
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Ready to generate</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;