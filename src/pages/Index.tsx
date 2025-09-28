import Header from "@/components/Header";
import SearchSection from "@/components/SearchSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <SearchSection />
      <Footer />
    </div>
  );
};

export default Index;
