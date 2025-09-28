import { Button } from "@/components/ui/button";
import { Search, LogOut, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();

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
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-inter font-medium">
              Accueil
            </Link>
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-foreground font-inter text-sm">
                  Bonjour, {user.email}
                </span>
                {isAdmin && (
                  <Link to="/dashboard">
                    <Button variant="outline" className="font-inter font-medium rounded-xl hover-lift">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button 
                  onClick={signOut}
                  variant="outline" 
                  className="font-inter font-medium rounded-xl hover-lift"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-foreground hover:text-primary transition-colors font-inter font-medium">
                  Connexion
                </Link>
                <Link to="/register">
                  <Button variant="default" className="bg-gradient-primary hover:bg-primary-hover text-white font-inter font-medium rounded-xl shadow-medium hover-lift">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
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