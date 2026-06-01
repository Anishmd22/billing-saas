'use client';

import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(val) => onOpenChange(val)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40 backdrop-blur-[2px]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl shadow-xl p-6 outline-none">
          <div className="flex items-start justify-between mb-3">
            <Dialog.Title className="text-base font-semibold text-[var(--color-text)]">
              {title}
            </Dialog.Title>
            <Dialog.Close
              disabled={isLoading}
              className="flex items-center justify-center size-6 rounded-md text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] transition-colors -mt-0.5 -mr-0.5 disabled:pointer-events-none"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-sm text-[var(--color-muted)] mb-6 leading-relaxed">
            {description}
          </Dialog.Description>

          <div className="flex justify-end gap-2">
            <Dialog.Close
              disabled={isLoading}
              className="h-8 px-3 text-sm font-medium border border-[var(--color-border)] rounded-lg bg-white hover:bg-[var(--color-surface-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </Dialog.Close>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'h-8 px-3 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                variant === 'danger'
                  ? 'bg-[var(--color-danger)] hover:bg-red-700'
                  : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]'
              )}
            >
              {isLoading ? 'Processing…' : confirmLabel}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
