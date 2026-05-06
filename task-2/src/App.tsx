import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Explore from "./pages/Explore.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import HostDashboard from "./pages/HostDashboard.tsx";
import CreateEvent from "./pages/CreateEvent.tsx";
import Tickets from "./pages/Tickets.tsx";
import HostPage from "./pages/HostPage.tsx";
import HostProfile from "./pages/HostProfile.tsx";
import HostMembers from "./pages/HostMembers.tsx";
import InviteAccept from "./pages/InviteAccept.tsx";
import CheckIn from "./pages/CheckIn.tsx";
import EventCheckIn from "./pages/EventCheckIn.tsx";
import MyEvents from "./pages/MyEvents.tsx";
import HostModeration from "./pages/HostModeration.tsx";
import { HostRoute } from "./components/HostRoute";
import { CheckerRoute } from "./components/CheckerRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/e/:slug" element={<EventDetail />} />
            <Route path="/h/:slug" element={<HostPage />} />
            <Route path="/host" element={<HostDashboard />} />
            <Route path="/host/events/new" element={<HostRoute><CreateEvent /></HostRoute>} />
            <Route path="/host/events/:slug/edit" element={<HostRoute><CreateEvent /></HostRoute>} />
            <Route path="/host/profile" element={<HostRoute><HostProfile /></HostRoute>} />
            <Route path="/host/members" element={<HostRoute><HostMembers /></HostRoute>} />
            <Route path="/host/moderation" element={<HostRoute><HostModeration /></HostRoute>} />
            <Route path="/host/check-in" element={<CheckerRoute><CheckIn /></CheckerRoute>} />
            <Route path="/host/check-in/:slug" element={<CheckerRoute><EventCheckIn /></CheckerRoute>} />
            <Route path="/invite/:token" element={<InviteAccept />} />
            <Route path="/my-events" element={<CheckerRoute><MyEvents /></CheckerRoute>} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
