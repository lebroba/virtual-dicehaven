
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail } from 'lucide-react';
import TerminalText from '@/components/TerminalText';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      onClose();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-mono tracking-tight text-center">ACCESS AUTHENTICATION</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            <TerminalText delay={0} className="text-xs" />
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-xs">OPERATOR ID</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 font-mono bg-background/50 border-primary/30 placeholder:text-muted-foreground/50"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="font-mono text-xs">SECURITY CLEARANCE</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 font-mono bg-background/50 border-primary/30 placeholder:text-muted-foreground/50"
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full hover-glow font-mono tracking-wide"
            disabled={isLoading}
          >
            {isLoading ? "AUTHENTICATING..." : "ACCESS SYSTEM"}
          </Button>
          
          <div className="text-center">
            <Button 
              variant="link" 
              type="button" 
              onClick={onSwitchToSignUp}
              className="text-xs text-primary/80 hover:text-primary font-mono"
            >
              REQUEST ACCESS CREDENTIALS
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
