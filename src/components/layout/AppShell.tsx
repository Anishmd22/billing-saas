import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full overflow-hidden">
      <div className="no-print">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="no-print">
          <TopBar />
        </div>
        <main className="flex-1 overflow-auto bg-[var(--color-surface-secondary)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
