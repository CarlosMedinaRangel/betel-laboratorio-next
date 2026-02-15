"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation"; 
import Image from "next/image";

type UserWithRole = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

type SessionWithRole = {
  user?: UserWithRole;
};

export default function Sidebar() {
  const { data: session } = useSession() as { data: SessionWithRole | null, status: string };
  const pathname = usePathname(); 

  // Navigation items used to render the sidebar menu.
  const menuItems = [
    { name: "Dashboard", href: "/", icon: "dashboard" }, 
    { name: "Productos", href: "/productos", icon: "inventory_2" },
    { name: "Examenes", href: "/examenes", icon: "group" },
  
  ];

  return (
    <aside className="w-72 bg-white flex flex-col shrink-0 border-r border-[#9727aa]/10 z-20 h-screen">
      {/* HEADER DEL SIDEBAR */}
      <div className="p-6 flex items-center gap-3">
        <div className="items-center justify-center">
          <Image 
            src="/logo.png" 
            alt="Logo de Betel" 
            width={70} 
            height={50} 
            className="mb-4" 
            priority
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#9727aa]">Betel</h1>
          <p className="text-xs font-medium text-[#9727aa]/60 uppercase tracking-widest">Laboratorio Clínico</p>
        </div>
      </div>

      {/* NAVEGACIÓN DINÁMICA */}
      <nav className="mt-6 px-4 flex-1 space-y-1">
        {menuItems.map((item) => {
          // Active state matches exact dashboard or nested routes.
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[#9727aa] text-white shadow-lg shadow-[#9727aa]/30" 
                  : "text-slate-600 hover:bg-[#9727aa]/10 hover:text-[#9727aa]" 
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER DEL USUARIO */}
      <div className="p-4 mt-auto border-t border-[#9727aa]/10">
        {/* Session preview and sign out action. */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#9727aa]/5">
          <div className="w-10 h-10 rounded-full bg-[#9727aa]/20 flex items-center justify-center text-[#9727aa] font-bold">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate text-slate-700">{session?.user?.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{session?.user?.role || "Usuario"}</p>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })} 
            className="text-slate-400 hover:text-red-500 transition-colors p-1"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}