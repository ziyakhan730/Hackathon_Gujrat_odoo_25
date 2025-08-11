import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PlayerLayout } from "@/components/layout/PlayerLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import FacilityDetail from "./pages/FacilityDetail";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PlayerDashboard from "./pages/PlayerDashboard";
import UserHome from "./pages/UserHome";
import Venues from "./pages/Venues";
import VenueDetail from "./pages/VenueDetail";
import CourtBooking from "./pages/CourtBooking";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LocationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <Layout>
                    <PublicRoute>
                      <Home />
                    </PublicRoute>
                  </Layout>
                } />
                <Route path="/explore" element={
                  <Layout>
                    <Explore />
                  </Layout>
                } />
                <Route path="/facility/:id" element={
                  <Layout>
                    <FacilityDetail />
                  </Layout>
                } />
                <Route path="/matches" element={
                  <Layout>
                    <Matches />
                  </Layout>
                } />
                <Route path="/profile" element={
                  <Layout>
                    <Profile />
                  </Layout>
                } />
                <Route path="/login" element={
                  <Layout>
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  </Layout>
                } />
                <Route path="/signup" element={
                  <Layout>
                    <PublicRoute>
                      <Signup />
                    </PublicRoute>
                  </Layout>
                } />
                
                {/* Owner Dashboard Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute requiredUserType="owner">
                      <Layout>
                      <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Player Dashboard Routes */}
                <Route 
                  path="/player" 
                  element={
                    <ProtectedRoute requiredUserType="player">
                      <PlayerLayout>
                        <PlayerDashboard />
                      </PlayerLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/player/venues" 
                  element={
                    <ProtectedRoute requiredUserType="player">
                      <PlayerLayout>
                        <Venues />
                      </PlayerLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/player/venues/:id" 
                  element={
                    <ProtectedRoute requiredUserType="player">
                      <PlayerLayout>
                        <VenueDetail />
                      </PlayerLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/player/venues/:id/book" 
                  element={
                    <ProtectedRoute requiredUserType="player">
                      <PlayerLayout>
                        <CourtBooking />
                      </PlayerLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/player/profile" 
                  element={
                    <ProtectedRoute requiredUserType="player">
                      <PlayerLayout>
                        <UserProfile />
                      </PlayerLayout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/player/bookings" 
                  element={
                    <ProtectedRoute requiredUserType="player">
                      <PlayerLayout>
                        <UserProfile />
                      </PlayerLayout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={
                  <Layout>
                    <NotFound />
                  </Layout>
                } />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );

export default App;
