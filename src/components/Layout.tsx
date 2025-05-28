
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex flex-col w-full font-sans">
      {!isHomePage && (
        <div className="w-full p-4 flex items-center sticky top-0 z-10 bg-[var(--app-bg)]">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-[var(--app-primary)]/20" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft />
          </Button>
        </div>
      )}
      <motion.div 
        className={`w-full ${isHomePage ? 'flex-grow flex items-center justify-center' : 'flex-1'} px-4 pb-8`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Layout;
