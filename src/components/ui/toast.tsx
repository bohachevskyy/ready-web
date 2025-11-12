import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-lg bg-foreground px-6 py-3 text-background shadow-lg transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <p className="font-medium">{message}</p>
    </div>
  );
}
