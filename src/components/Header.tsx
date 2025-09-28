import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-xl shadow-medium">
              <Search className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-poppins font-bold text-foreground">
              CSint Search
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="/" 
              className="text-foreground hover:text-primary transition-colors duration-200 font-inter font-medium"
            >
              Accueil
            </a>
            <a 
              href="/login" 
              className="text-foreground hover:text-primary transition-colors duration-200 font-inter font-medium"
            >
              Connexion
            </a>
            <Button 
              variant="default" 
              size="sm"
              className="bg-gradient-primary hover:bg-primary-hover shadow-medium hover-lift"
            >
              Inscription
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;