import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button-new";
import { Input } from "@/components/ui/input-new";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card-new";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, Shield } from "lucide-react";
import beachParkLogo from "@assets/pngegg_1752264509099.png";
import ChangePasswordModal from "@/components/auth/change-password-modal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("authUser", JSON.stringify(data.user));
        
        // Check if user must change password
        if (data.mustChangePassword) {
          setLoggedInUser(data.user);
          setShowChangePasswordModal(true);
        } else {
          setLocation("/admin-dashboard");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Credenciais inválidas");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChanged = () => {
    setShowChangePasswordModal(false);
    setLocation("/admin-dashboard");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="card p-2 rounded-full shadow-md">
          <ThemeToggle />
        </div>
      </div>
      
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="hover-lift">
              <img src={beachParkLogo} alt="BeachPark Logo" className="w-16 h-16 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary" style={{ background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tô Sabendo
          </h1>
          <p className="text-secondary">Sistema de Gerenciamento de Projetos</p>
        </div>

        {/* Login Form */}
        <Card className="glass shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-center text-primary">
              Fazer Login
            </CardTitle>
            <CardDescription className="text-center text-secondary">
              Entre com suas credenciais para acessar seus projetos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="input-group">
                <Label htmlFor="email" className="input-label">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <Label htmlFor="password" className="input-label">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full hover-lift"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-secondary">
                <p>
                  <Shield className="inline w-4 h-4 mr-1" />
                  Sistema seguro e protegido
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          onPasswordChanged={handlePasswordChanged}
          user={loggedInUser}
        />
      )}
    </div>
  );
}