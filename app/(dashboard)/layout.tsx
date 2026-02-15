import Sidebar from "../_components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden font-display bg-background-light">
      {/* Persistent sidebar with the main app layout. */}
      <Sidebar />

   
      {/* Scrollable content area for dashboard routes. */}
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        {children}
      </main>
    </div>
  );
}