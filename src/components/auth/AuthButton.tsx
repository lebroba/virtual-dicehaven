
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AuthButton: React.FC = () => {
  const { user, profile, signOut, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleLogin = () => {
    setShowLoginModal(true);
    setShowSignupModal(false);
  };

  const handleSignup = () => {
    setShowSignupModal(true);
    setShowLoginModal(false);
  };

  if (loading) {
    return (
      <Button variant="ghost" disabled>
        <span className="animate-pulse">Authenticating...</span>
      </Button>
    );
  }

  if (user && profile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 pulse-glow">
            <User className="h-4 w-4" />
            <span className="font-mono text-xs">{profile.username}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 glass-panel" align="end">
          <DropdownMenuLabel className="font-mono text-xs">OPERATOR PROFILE</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="font-mono text-xs cursor-pointer">
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem className="font-mono text-xs cursor-pointer">
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="font-mono text-xs text-destructive focus:text-destructive cursor-pointer"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogin}
          className="font-mono text-xs hover:text-primary/90"
        >
          <LogIn className="mr-2 h-4 w-4" />
          LOGIN
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignup}
          className="font-mono text-xs border-primary/30 hover:bg-primary/10"
        >
          REGISTER
        </Button>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignUp={handleSignup}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={handleLogin}
      />
    </>
  );
};

export default AuthButton;
