import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/monday-button";
import { Input } from "@/components/ui/monday-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/monday-card";
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
          setLocation("/dashboard");
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
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center" style={{ padding: 'var(--space-lg)' }}>
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <div className="w-full" style={{ maxWidth: '400px' }}>
        {/* Logo/Header */}
        <div className="text-center space-y-md mb-xl">
          <div className="flex justify-center">
            <img src={beachParkLogo} alt="BeachPark Logo" className="w-16 h-16 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold brand-primary mb-xs">
              Tô Sabendo
            </h1>
            <p className="text-secondary">Sistema de Gerenciamento de Projetos</p>
          </div>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Fazer Login
            </CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar seus projetos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-lg">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="input-group">
                <label htmlFor="email" className="input-label">Email</label>
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
                <label htmlFor="password" className="input-label">Senha</label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-tertiary hover:text-primary transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-tertiary pt-md">
                <p className="flex items-center justify-center gap-xs">
                  <Shield className="w-4 h-4" />
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