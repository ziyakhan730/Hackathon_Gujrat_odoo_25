import { motion } from "framer-motion";
import { Users, MapPin, Clock, Star, Plus, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Matches() {
  const matches = [
    {
      id: 1,
      title: "Evening Badminton Singles",
      sport: "Badminton",
      skillLevel: "Intermediate",
      date: "Today",
      time: "7:00 PM",
      venue: "SportZone Premium",
      location: "Bandra West",
      organizer: {
        name: "Arjun Patel",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        rating: 4.8
      },
      participants: 2,
      maxParticipants: 4,
      price: 400,
      tags: ["Competitive", "Regular"]
    },
    {
      id: 2,
      title: "Weekend Football Match",
      sport: "Football",
      skillLevel: "Beginner",
      date: "Tomorrow",
      time: "6:00 AM",
      venue: "Elite Football Arena",
      location: "Andheri East",
      organizer: {
        name: "Priya Sharma",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b67c?w=100",
        rating: 4.9
      },
      participants: 8,
      maxParticipants: 22,
      price: 150,
      tags: ["Casual", "Weekend"]
    },
    {
      id: 3,
      title: "Tennis Practice Session",
      sport: "Tennis",
      skillLevel: "Advanced",
      date: "Dec 15",
      time: "5:30 PM",
      venue: "Urban Tennis Club",
      location: "Powai",
      organizer: {
        name: "Rohit Kumar",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        rating: 4.7
      },
      participants: 3,
      maxParticipants: 6,
      price: 600,
      tags: ["Training", "Pro"]
    }
  ];

  const getSkillColor = (skill: string) => {
    switch (skill) {
      case 'Beginner': return 'bg-success/20 text-success border-success/20';
      case 'Intermediate': return 'bg-warning/20 text-warning border-warning/20';
      case 'Advanced': return 'bg-error/20 text-error border-error/20';
      default: return 'bg-muted/20 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="min-h-screen pt-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                Find <span className="bg-gradient-hero bg-clip-text text-transparent">Matches</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Join games in your area or create your own
              </p>
            </div>
            <Button variant="hero" size="lg" className="mt-4 md:mt-0">
              <Plus className="h-5 w-5 mr-2" />
              Create Match
            </Button>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Search matches..." 
                className="pl-10 glass-surface border-glass-border"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input 
                placeholder="Location" 
                className="pl-10 glass-surface border-glass-border"
              />
            </div>
            <Button variant="outline" className="glass-surface">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="glass-surface">Today</Badge>
            <Badge variant="secondary" className="glass-surface">This Week</Badge>
            <Badge variant="secondary" className="glass-surface">Beginner</Badge>
            <Badge variant="secondary" className="glass-surface">Intermediate</Badge>
            <Badge variant="secondary" className="glass-surface">Near Me</Badge>
          </div>
        </motion.div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="glass-card hover-lift border-0 h-full">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="bg-gradient-primary text-primary-foreground">
                      {match.sport}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getSkillColor(match.skillLevel)}
                    >
                      {match.skillLevel}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                    {match.title}
                  </h3>

                  {/* Date & Time */}
                  <div className="flex items-center text-muted-foreground text-sm mb-3">
                    <Clock className="h-4 w-4 mr-2" />
                    {match.date} at {match.time}
                  </div>

                  {/* Venue */}
                  <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    {match.venue}, {match.location}
                  </div>

                  {/* Organizer */}
                  <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-secondary/20">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={match.organizer.avatar} />
                      <AvatarFallback>{match.organizer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">
                        {match.organizer.name}
                      </p>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-warning mr-1" fill="currentColor" />
                        <span className="text-xs text-muted-foreground">
                          {match.organizer.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-accent" />
                      <span className="text-foreground font-medium">
                        {match.participants}/{match.maxParticipants}
                      </span>
                      <span className="text-muted-foreground ml-1">players</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-foreground">
                        ₹{match.price}
                      </span>
                      <span className="text-muted-foreground text-sm">/person</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {match.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button 
                    variant="hero" 
                    className="w-full group-hover:scale-105 transition-transform duration-300"
                    disabled={match.participants >= match.maxParticipants}
                  >
                    {match.participants >= match.maxParticipants ? 'Match Full' : 'Join Match'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" className="glass-surface">
            Load More Matches
          </Button>
        </motion.div>

        {/* Floating Action Button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="fixed bottom-8 right-8 z-40"
        >
          <Button 
            variant="hero" 
            size="icon" 
            className="w-14 h-14 rounded-full shadow-glow hover:scale-110"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}