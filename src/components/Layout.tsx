
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] flex flex-col items-center w-full font-sans">
      <div className="w-full max-w-3xl p-4 flex-grow"> {/* Increased max-width slightly */}
        {children}
      </div>
    </div>
  );
};

export default Layout;
