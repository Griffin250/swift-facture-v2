import { } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black/90 border-t border-border/30 mt-12">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
        <div className="mb-3 md:mb-0 font-bold" >
          <strong>PayFlow</strong> — Professional invoices & Receipts
        </div>
        <div className="flex space-x-4 items-center">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/template" className="hover:text-foreground">Templates</Link>
          <Link to="/receipt" className="hover:text-foreground">Receipt</Link>
          <a href="#" className="hover:text-foreground">Privacy</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
