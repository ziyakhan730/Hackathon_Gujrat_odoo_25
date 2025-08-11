import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayerSidebar } from './PlayerSidebar';

interface PlayerLayoutProps {
  children: React.ReactNode;
}

export function PlayerLayout({ children }: PlayerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar - Always visible on desktop, conditional on mobile */}
      <div className="hidden lg:block">
        <PlayerSidebar isOpen={true} onToggle={toggleSidebar} />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <PlayerSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-80">
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Q</span>
              </div>
              <span className="font-display font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuickCourt
              </span>
            </div>
            
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
} 