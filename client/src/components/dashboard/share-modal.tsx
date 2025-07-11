import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Share2 } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (data: { email: string; permission: string; notify: boolean }) => void;
}

export default function ShareModal({ isOpen, onClose, onShare }: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [notify, setNotify] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShare({ email, permission, notify });
    setEmail("");
    setPermission("view");
    setNotify(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Compartilhar Dashboard
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do usuário</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="permission">Nível de acesso</Label>
            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de acesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">Visualizar</SelectItem>
                <SelectItem value="edit">Editar</SelectItem>
                <SelectItem value="admin">Administrar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="notify"
              checked={notify}
              onCheckedChange={(checked) => setNotify(checked as boolean)}
            />
            <Label htmlFor="notify" className="text-sm">
              Enviar notificação por email
            </Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Compartilhar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
