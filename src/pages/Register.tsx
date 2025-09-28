import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-primary hover:text-primary-hover transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl shadow-large">
              <Search className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-poppins font-bold text-foreground">Inscription</h1>
          <p className="text-muted-foreground font-inter mt-2">Rejoignez CSint Search aujourd'hui</p>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xlarge border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-poppins font-semibold text-center">Créer un compte</CardTitle>
            <CardDescription className="text-center font-inter">
              Remplissez les informations ci-dessous pour vous inscrire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-inter font-medium">Nom d'utilisateur *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Votre nom d'utilisateur"
                  required
                  className="h-12 bg-white border-border rounded-xl font-inter"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-inter font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  required
                  className="h-12 bg-white border-border rounded-xl font-inter"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-inter font-medium">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  required
                  className="h-12 bg-white border-border rounded-xl font-inter"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-inter font-medium">Confirmer mot de passe *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  required
                  className="h-12 bg-white border-border rounded-xl font-inter"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-primary hover:bg-primary-hover text-white rounded-xl font-inter font-semibold shadow-medium hover-lift mt-6"
              >
                S'inscrire
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground font-inter">
                Déjà un compte ?{" "}
                <Link to="/login" className="text-primary hover:text-primary-hover font-medium transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Note about authentication */}
        <div className="mt-6 p-4 bg-primary-light rounded-xl border border-primary/20">
          <p className="text-sm text-primary text-center font-inter">
            💡 Cette page sera fonctionnelle une fois Supabase connecté
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;