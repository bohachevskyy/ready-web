import { Home, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface NavigationBarProps {
  onHomeClick: () => void;
  onLogout: () => void;
}

export function NavigationBar({ onHomeClick, onLogout }: NavigationBarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Button variant="ghost" size="sm" onClick={onHomeClick} className="gap-2 hover:bg-primary/10">
          <Home className="h-5 w-5" />
          <span className="font-medium">Home</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="gap-2 hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </div>
    </nav>
  );
}
