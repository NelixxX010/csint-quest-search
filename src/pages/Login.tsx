import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ArrowLeft, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ReCaptcha } from "@/components/ReCaptcha";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaToken) {
      toast({
        title: "CAPTCHA requis",
        description: "Veuillez compléter la vérification anti-robot",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      // Success handled by auth context
      if (email === 'admin@csint.com') {
        // Admin credentials - redirect to dashboard
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
    
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
          <h1 className="text-3xl font-poppins font-bold text-foreground">Connexion</h1>
          <p className="text-muted-foreground font-inter mt-2">Accédez à votre compte CSint Search</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xlarge border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-poppins font-semibold text-center">Se connecter</CardTitle>
            <CardDescription className="text-center font-inter">
              Entrez vos identifiants pour accéder à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-inter font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@csint.com (identifiants admin)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-white border-border rounded-xl font-inter"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-inter font-medium">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin123 (mot de passe admin)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-white border-border rounded-xl font-inter"
                />
              </div>

              {/* CAPTCHA Section */}
              <div className="space-y-3 p-4 bg-muted rounded-xl border border-border">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <Label className="text-sm font-inter font-medium">Vérification anti-robot *</Label>
                </div>
                <div className="bg-white p-4 rounded-lg border border-border">
                  <ReCaptcha 
                    onVerify={setCaptchaToken}
                    onError={() => setCaptchaToken(null)}
                  />
                  <p className="text-xs text-muted-foreground mt-2 font-inter text-center">
                    reCAPTCHA Google actif
                  </p>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !captchaToken}
                className="w-full h-12 bg-gradient-primary hover:bg-primary-hover text-white rounded-xl font-inter font-semibold shadow-medium hover-lift mt-6 disabled:opacity-50"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground font-inter">
                Pas encore de compte ?{" "}
                <Link to="/register" className="text-primary hover:text-primary-hover font-medium transition-colors">
                  S'inscrire
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Admin credentials info */}
        <div className="mt-6 p-4 bg-primary-light rounded-xl border border-primary/20">
          <p className="text-sm text-primary text-center font-inter">
            🔑 Identifiants admin : admin@csint.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;