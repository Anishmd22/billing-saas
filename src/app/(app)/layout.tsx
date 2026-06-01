import AppShell from '@/components/layout/AppShell';
import KeyboardShortcuts from '@/components/layout/KeyboardShortcuts';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <KeyboardShortcuts />
      {children}
    </AppShell>
  );
}
