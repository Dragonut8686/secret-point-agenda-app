
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SchedulePage from "./pages/SchedulePage";
import QuestionsPage from "./pages/QuestionsPage";
import QuestionsListPage from "./pages/QuestionsListPage";
import VotePage from "./pages/VotePage";
import HotelServicesPage from "./pages/HotelServicesPage";
import HotelMapPage from "./pages/HotelMapPage";
import ContactsPage from "./pages/ContactsPage";
import GratitudePage from "./pages/GratitudePage";
import GratitudesListPage from "./pages/GratitudesListPage";
import NotFound from "./pages/NotFound";

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/questions-list" element={<QuestionsListPage />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/hotel-services" element={<HotelServicesPage />} />
        <Route path="/hotel-map" element={<HotelMapPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/gratitude" element={<GratitudePage />} />
        <Route path="/gratitudes-list" element={<GratitudesListPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const queryClient = new QueryClient();

const App = () => {
  // Move the useEffect directly into the App component
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;
    if (!user) return;
    const telegram_id = user.id.toString();
    const full_name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
    const username = user.username ?? null;

    const register = async () => {
      const { data: existing } = await supabase
        .from("participants")
        .select("id")
        .eq("telegram_id", telegram_id)
        .maybeSingle();
      if (!existing) {
        await supabase.from("participants").insert({
          telegram_id,
          full_name,
          username,
        });
        console.log("✅ Участник зарегистрирован:", full_name);
      } else {
        console.log("✅ Участник уже есть:", full_name);
      }
    };

    register();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <SonnerToaster />
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
