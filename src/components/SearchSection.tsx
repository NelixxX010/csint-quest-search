import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useToast } from "@/hooks/use-toast";

const SearchSection = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { trackSearch } = useAnalytics();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Recherche vide",
        description: "Veuillez saisir un terme de recherche",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate search results
    setTimeout(() => {
      const mockResults = [
        `Résultat pour "${query}" - Site officiel`,
        `${query} - Wikipedia`,
        `Guide complet sur ${query}`,
        `${query} - Actualités récentes`,
        `Forum de discussion sur ${query}`
      ];
      
      setResults(mockResults);
      setIsSearching(false);
      
      // Track the search
      trackSearch(query, mockResults.length);
      
      toast({
        title: "Recherche terminée",
        description: `${mockResults.length} résultats trouvés`,
      });
    }, 1500);
  };

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
        <form onSubmit={handleSearch} className="w-full max-w-2xl flex gap-3 fade-in-delay">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Rechercher sur CSint..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-14 pl-12 pr-4 text-base font-inter border-2 border-white/20 rounded-2xl bg-white/90 backdrop-blur-sm shadow-large focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          </div>
          <Button 
            type="submit"
            size="lg"
            disabled={isSearching}
            className="h-14 px-8 bg-gradient-primary hover:bg-primary-hover text-white font-inter font-semibold rounded-2xl shadow-large hover-lift transition-all duration-300 disabled:opacity-70"
          >
            <Search className="w-5 h-5 mr-2" />
            {isSearching ? 'Recherche...' : 'Rechercher'}
          </Button>
        </form>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="w-full max-w-2xl mt-8 fade-in">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xlarge p-6 border border-white/20">
              <h3 className="text-lg font-poppins font-semibold text-foreground mb-4">
                Résultats de recherche ({results.length})
              </h3>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="p-3 hover:bg-primary/5 rounded-xl transition-colors cursor-pointer">
                    <p className="text-primary hover:text-primary-hover font-inter font-medium">
                      {result}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Description du résultat de recherche pour "{query}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isSearching && (
          <div className="w-full max-w-2xl mt-8 fade-in">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xlarge p-8 border border-white/20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground font-inter">Recherche en cours...</p>
            </div>
          </div>
        )}

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