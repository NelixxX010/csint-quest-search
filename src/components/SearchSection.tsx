import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SearchSection = () => {
  return (
    <section className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center fade-in">
        {/* Main Logo & Title */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-3xl shadow-xlarge">
              <Search className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-poppins font-bold text-foreground mb-4">
            CSint Search
          </h1>
          <p className="text-xl text-muted-foreground font-inter max-w-md mx-auto">
            Un moteur de recherche stylé, rapide et moderne.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="flex items-center bg-white rounded-2xl shadow-large border border-border hover:shadow-xlarge transition-shadow duration-300 p-2">
            <Input
              type="text"
              placeholder="Rechercher sur CSint..."
              className="flex-1 border-0 bg-transparent text-lg font-inter placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-4"
            />
            <Button 
              size="lg"
              className="bg-gradient-primary hover:bg-primary-hover text-white rounded-xl shadow-medium search-btn-hover font-inter font-semibold px-8"
            >
              <Search className="w-5 h-5 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-3">
          {["Actualités", "Images", "Vidéos", "Cartes"].map((link) => (
            <Button
              key={link}
              variant="outline"
              size="sm"
              className="rounded-full border-border hover:bg-primary-light hover:border-primary hover:text-primary transition-all duration-200 font-inter"
            >
              {link}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SearchSection;