
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner"; // Renamed to avoid conflict
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // Import the Layout component

import HomePage from "./pages/HomePage";
import SchedulePage from "./pages/SchedulePage";
import QuestionsPage from "./pages/QuestionsPage";
import VotePage from "./pages/VotePage";
import HotelServicesPage from "./pages/HotelServicesPage";
import HotelMapPage from "./pages/HotelMapPage";
import ContactsPage from "./pages/ContactsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <SonnerToaster /> {/* Use the renamed import */}
      <BrowserRouter>
        <Layout> {/* Wrap Routes with Layout */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/vote" element={<VotePage />} />
            <Route path="/hotel-services" element={<HotelServicesPage />} />
            <Route path="/hotel-map" element={<HotelMapPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
