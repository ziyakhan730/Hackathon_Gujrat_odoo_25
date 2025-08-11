import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="glass-surface border-t border-glass-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">Q</span>
              </div>
              <span className="font-display font-bold text-xl bg-gradient-hero bg-clip-text text-transparent">
                QuickCourt
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              Book sports facilities instantly. Play, compete, and connect with your local sports community.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="hover-glow">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-glow">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover-glow">
                <Facebook className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <a href="/explore" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Find Courts
              </a>
              <a href="/matches" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Join Matches
              </a>
              <a href="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                About Us
              </a>
              <a href="/help" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Help Center
              </a>
            </nav>
          </div>

          {/* Sports */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Sports</h3>
            <nav className="flex flex-col space-y-2">
              <a href="/sports/badminton" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Badminton
              </a>
              <a href="/sports/football" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Football
              </a>
              <a href="/sports/tennis" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Tennis
              </a>
              <a href="/sports/cricket" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Cricket
              </a>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4" />
                <span>hello@quickcourt.com</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-glass-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 QuickCourt. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}