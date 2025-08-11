import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Moon, Sun, Menu, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

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
          <Link to="/">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">Q</span>
              </div>
              <span className="font-display font-bold text-xl bg-gradient-hero bg-clip-text text-transparent">
                QuickCourt
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/explore" className="text-foreground hover:text-primary transition-colors">
              Explore
            </Link>
            <Link to="/matches" className="text-foreground hover:text-primary transition-colors">
              Matches
            </Link>
            <Link to="/profile" className="text-foreground hover:text-primary transition-colors">
              Profile
            </Link>
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

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center space-x-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero" size="sm">
                  <User className="h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>

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
              <Link to="/explore" className="text-foreground hover:text-primary transition-colors py-2">
                Explore Facilities
              </Link>
              <Link to="/matches" className="text-foreground hover:text-primary transition-colors py-2">
                Find Matches
              </Link>
              <Link to="/profile" className="text-foreground hover:text-primary transition-colors py-2">
                My Profile
              </Link>
              <div className="flex flex-col space-y-2 mt-4">
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero" className="w-full">
                    <User className="h-4 w-4" />
                    Sign Up
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
