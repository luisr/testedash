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
    <div className="login-container">
      {/* Theme Toggle - Top Right */}
      <div className="fixed top-4 right-4 z-50">
        <div className="card p-2 rounded-full shadow-md">
          <ThemeToggle />
        </div>
      </div>
      
      <div className="login-card">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="hover-lift">
              <img src={beachParkLogo} alt="BeachPark Logo" className="w-20 h-20 object-contain" />
            </div>
          </div>
          <h1 className="login-title">
            Tô Sabendo
          </h1>
          <p className="login-subtitle">Sistema de Gerenciamento de Projetos</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="login-form-group">
            <label htmlFor="email" className="login-label">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">Senha</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="login-form-group">
            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
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
            </button>
          </div>

          <div className="login-footer">
            <p>
              <Shield className="inline w-4 h-4 mr-1" />
              Sistema seguro e protegido
            </p>
          </div>
        </form>
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