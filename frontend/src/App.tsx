import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FleetProvider } from "@/contexts/FleetContext";
import Layout from "@/components/Layout";
import HelpBot from "@/components/HelpBot";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import VehicleRegistry from "@/pages/VehicleRegistry";
import TripDispatcher from "@/pages/TripDispatcher";
import Maintenance from "@/pages/Maintenance";
import CompletedTrips from "@/pages/CompletedTrips";
import DriverProfiles from "@/pages/DriverProfiles";
import Analytics from "@/pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><VehicleRegistry /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><TripDispatcher /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/fuel" element={<ProtectedRoute><CompletedTrips /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><DriverProfiles /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {user && <HelpBot />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <FleetProvider>
            <AppRoutes />
          </FleetProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
