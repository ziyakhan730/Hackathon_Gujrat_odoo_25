import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Moon, Sun, Menu, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true); // Default to dark mode for Gen-Z aesthetic

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light');
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass-surface border-b border-glass-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">Q</span>
            </div>
            <span className="font-display font-bold text-xl bg-gradient-hero bg-clip-text text-transparent">
              QuickCourt
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/explore" className="text-foreground hover:text-primary transition-colors">
              Explore
            </a>
            <a href="/matches" className="text-foreground hover:text-primary transition-colors">
              Matches
            </a>
            <a href="/profile" className="text-foreground hover:text-primary transition-colors">
              Profile
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Location */}
            <Button variant="glass" size="sm" className="hidden sm:flex">
              <MapPin className="h-4 w-4" />
              Mumbai
            </Button>

            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="hover-glow"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* User Menu */}
            <Button variant="hero" size="sm" className="hidden sm:flex">
              <User className="h-4 w-4" />
              Sign In
            </Button>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-glass-border"
          >
            <nav className="flex flex-col space-y-4">
              <a href="/explore" className="text-foreground hover:text-primary transition-colors py-2">
                Explore Facilities
              </a>
              <a href="/matches" className="text-foreground hover:text-primary transition-colors py-2">
                Find Matches
              </a>
              <a href="/profile" className="text-foreground hover:text-primary transition-colors py-2">
                My Profile
              </a>
              <Button variant="hero" className="mt-4">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}