import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";
import beachParkLogo from "@assets/pngegg_1752264509099.png";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center dashboard-container">
      <Card className="w-full max-w-md mx-4 shadow-elegant">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white p-2">
              <img src={beachParkLogo} alt="BeachPark Logo" className="w-12 h-12 object-contain" />
            </div>
          </div>
          
          <div className="flex items-center justify-center mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-foreground">404</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">Página não encontrada</h2>
          
          <p className="text-sm text-muted-foreground mb-6">
            A página que você está procurando não existe ou foi movida.
          </p>
          
          <Link href="/">
            <Button className="flex items-center gap-2 w-full">
              <Home className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
