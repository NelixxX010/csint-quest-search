import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ArrowLeft, User, Mail, Lock, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    await signUp(email, password, username);
    setLoading(false);
  };

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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-inter font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nom d'utilisateur *
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 bg-white border-border rounded-xl font-inter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-inter font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white border-border rounded-xl font-inter"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-inter font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Mot de passe *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white border-border rounded-xl font-inter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-inter font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirmer mot de passe *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmez votre mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 bg-white border-border rounded-xl font-inter"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 bg-gradient-primary hover:bg-primary-hover text-white rounded-xl font-inter font-semibold shadow-medium hover-lift mt-6 disabled:opacity-50"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {loading ? 'Inscription...' : 'S\'inscrire'}
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

        {/* Inscription active */}
        <div className="mt-6 p-4 bg-primary-light rounded-xl border border-primary/20">
          <p className="text-sm text-primary text-center font-inter">
            ✅ Inscription active avec Supabase
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;