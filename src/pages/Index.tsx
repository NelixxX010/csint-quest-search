import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import Footer from "@/components/Footer";
import { useAnalytics } from "@/hooks/useAnalytics";

const Index = () => {
  useAnalytics(); // Track page visit


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <SearchSection />
      <Footer />
    </div>
  );
};

export default Index;
