
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--app-bg)] to-slate-900 text-white">
      {!isHomePage && (
        <div className="sticky top-0 z-50 bg-gradient-to-br from-[var(--app-bg)]/95 to-slate-900/95 backdrop-blur-sm border-b border-white/10 p-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </div>
      )}
      
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Layout;
