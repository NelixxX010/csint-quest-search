import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import Footer from "@/components/Footer";
import { useAnalytics } from "@/hooks/useAnalytics";
import express from "express";
import searchRouter from "./routes/search.js";

const Index = () => {
  useAnalytics(); // Track page visit
  
const app = express();

app.use("/api/search", searchRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API backend running on http://localhost:${PORT}`);
});

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <SearchSection />
      <Footer />
    </div>
  );
};

export default Index;
