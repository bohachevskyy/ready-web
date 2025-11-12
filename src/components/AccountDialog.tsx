import { type MouseEvent } from 'react';
import { AccountSettingsForm } from './AccountSettingsForm';

interface AccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AccountDialog({ open, onClose }: AccountDialogProps) {
  if (!open) {
    return null;
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onClick={handleOverlayClick}
    >
      <div role="dialog" aria-modal="true">
        <AccountSettingsForm onClose={onClose} resetKey="dialog" />
      </div>
    </div>
  );
}
