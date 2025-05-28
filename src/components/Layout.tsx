
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
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex flex-col items-center w-full font-sans">
      {!isHomePage && (
        <div className="w-full p-4 flex items-center">
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
        className="w-full flex-grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Layout;
