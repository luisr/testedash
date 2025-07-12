import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, LogIn, Shield } from "lucide-react";
import beachParkLogo from "@assets/pngegg_1752264509099.png";
import ChangePasswordModal from "@/components/auth/change-password-modal";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import "@/styles/login-theme.css";

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
    <div className="min-h-screen beachpark-gradient-bg flex items-center justify-center p-4">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="beachpark-card p-1 rounded-full">
          <ThemeToggle />
        </div>
      </div>
      
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="beachpark-logo-container beachpark-hover-lift">
              <img src={beachParkLogo} alt="BeachPark Logo" className="w-16 h-16 object-contain" />
            </div>
          </div>
          <h1 className="text-4xl font-bold beachpark-text-gradient">Tô Sabendo</h1>
          <p className="text-white/80 dark:text-slate-300">Sistema de Gerenciamento de Projetos</p>
        </div>

        {/* Login Form */}
        <Card className="beachpark-card beachpark-shadow-elegant-xl backdrop-blur-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Fazer Login
            </CardTitle>
            <CardDescription className="text-center">
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

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="beachpark-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="beachpark-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
                className="beachpark-btn-primary w-full h-12"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Entrar
                  </div>
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                Credenciais de Demo:
              </h4>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <p>• Email: ana.lima@empresa.com</p>
                <p>• Senha: password123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Sistema de autenticação por colaborador
        </p>
      </div>
      
      {/* Change Password Modal */}
      {showChangePasswordModal && loggedInUser && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
          userId={loggedInUser.id}
          onPasswordChanged={handlePasswordChanged}
        />
      )}
    </div>
  );
}