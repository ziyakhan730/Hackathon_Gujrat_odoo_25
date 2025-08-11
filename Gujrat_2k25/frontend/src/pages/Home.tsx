import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Users, Star, ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-bg.jpg";

export default function Home() {
  const stats = [
    { icon: Users, label: "Active Players", value: "50K+" },
    { icon: Star, label: "Courts Available", value: "1,200+" },
    { icon: MapPin, label: "Cities", value: "25+" },
  ];

  const features = [
    {
      icon: Search,
      title: "Find Courts Instantly",
      description: "Search and book courts in your area with real-time availability",
      color: "from-primary to-primary-glow"
    },
    {
      icon: Calendar,
      title: "Smart Booking",
      description: "AI-powered scheduling that finds the perfect time slots for you",
      color: "from-accent to-accent-glow"
    },
    {
      icon: Users,
      title: "Join Matches",
      description: "Connect with players of your skill level for competitive games",
      color: "from-primary to-accent"
    }
  ];

  const sports = [
    { name: "Badminton", count: "400+ courts", emoji: "🏸" },
    { name: "Football", count: "300+ fields", emoji: "⚽" },
    { name: "Tennis", count: "250+ courts", emoji: "🎾" },
    { name: "Cricket", count: "200+ grounds", emoji: "🏏" },
    { name: "Basketball", count: "150+ courts", emoji: "🏀" },
    { name: "Table Tennis", count: "500+ tables", emoji: "🏓" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Sports courts" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80" />
          <div className="absolute inset-0 bg-gradient-hero opacity-20" />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-8 h-8 bg-gradient-primary rounded-full blur-sm opacity-60"
          />
          <motion.div
            animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
            className="absolute top-1/3 right-1/3 w-6 h-6 bg-gradient-accent rounded-full blur-sm opacity-40"
          />
          <motion.div
            animate={{ y: [0, -25, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-1/3 left-1/5 w-10 h-10 bg-gradient-primary rounded-full blur-sm opacity-30"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Book Courts.
              </span>
              <br />
              <span className="text-foreground">Play Instantly.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Find and book sports facilities in seconds. Join matches, meet players, 
              and elevate your game with India's fastest-growing sports community.
            </p>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-6 max-w-4xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input 
                    placeholder="Search sport or venue" 
                    className="pl-10 glass-surface border-glass-border focus:border-primary"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input 
                    placeholder="Location" 
                    className="pl-10 glass-surface border-glass-border focus:border-primary"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input 
                    placeholder="Date & Time" 
                    className="pl-10 glass-surface border-glass-border focus:border-primary"
                  />
                </div>
                <Button variant="hero" size="lg" className="w-full">
                  Find Courts
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-8 mt-16"
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-display font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              How <span className="bg-gradient-hero bg-clip-text text-transparent">QuickCourt</span> Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Three simple steps to get you on the court and playing with your community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="glass-card hover-lift border-0 h-full">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-display font-semibold mb-4 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Grid */}
      <section className="py-24 px-4 bg-gradient-surface">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Find Your <span className="bg-gradient-accent bg-clip-text text-transparent">Sport</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Thousands of venues across 25+ cities
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {sports.map((sport, index) => (
              <motion.div
                key={sport.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="glass-card p-6 text-center hover-glow cursor-pointer group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {sport.emoji}
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {sport.name}
                </h3>
                <p className="text-muted-foreground text-sm">{sport.count}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to <span className="bg-gradient-hero bg-clip-text text-transparent">Play?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of players who trust QuickCourt for their daily sports needs.
              Book your first session now!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl">
                <Zap className="h-5 w-5" />
                Book Now
              </Button>
              <Button variant="outline" size="xl">
                <Users className="h-5 w-5" />
                Find Players
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-glass-border">
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-success" />
                <p className="text-sm text-muted-foreground">Secure Payments</p>
              </div>
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-accent" />
                <p className="text-sm text-muted-foreground">Instant Booking</p>
              </div>
              <div className="text-center col-span-2 md:col-span-1">
                <Star className="h-6 w-6 mx-auto mb-2 text-warning" />
                <p className="text-sm text-muted-foreground">5-Star Experience</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}