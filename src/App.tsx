import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TermsConditions from "./pages/TermsConditions";
import Culture from "./pages/Culture";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import ContentPage from "./pages/ContentPage";
import InitiativesPage from "./pages/InitiativesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/culture" element={<Culture />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/community/csr" element={<InitiativesPage type="csr" />} />
          <Route path="/community/non-csr" element={<InitiativesPage type="non-csr" />} />
          <Route path="/press-release" element={<ContentPage title="Press Release" category="press" description="Making an Impact: Velrona Group’s Commitment to Create a Better World Together" />} />
          <Route path="/investors" element={<ContentPage title="Investors" category="investors" />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
