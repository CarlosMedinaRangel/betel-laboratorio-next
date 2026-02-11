"use client"; 
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  const { data: session, status } = useSession() as { data: SessionWithRole | null, status: string };
    const router = useRouter();
  return (
    <aside className="w-72 bg-white border-r border-primary/10 flex flex-col shrink-0 border-r border-[#9727aa]/10 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className=" items-center justify-center">
          
          <Image src="/logo.png" alt="Logo de Betel" width={70}height={50} className="mb-4 text-white" priority/>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Betel</h1>
          <p className="text-xs font-medium text-primary/60 uppercase tracking-widest">Laboratorio Clínico</p>
        </div>
      </div>

      <nav className="mt-6 px-4 flex-1 space-y-1">
        {/* Usamos Link en lugar de a */}
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 transition-all duration-200">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-medium">Dashboard</span>
        </Link>
        
        {/* Enlace a la nueva página que crearemos */}
        <Link href="/productos" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-200">
          <span className="material-symbols-outlined">inventory_2</span>
          <span className="font-medium">Productos</span>
        </Link>
        
        {/* ... resto de enlaces ... */}
      </nav>
      {/* ... footer del sidebar ... */}

      <div className="p-4 mt-auto border-t border-primary/10">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-primary/5">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">DR</div>
          <div className="flex-1 overflow-hidden">
          <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
          <p className="text-xs text-slate-500 truncate">{session?.user?.role}</p>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/login" })}  className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">logout</span>
          </button>
         </div>
      </div>
    </aside>
  );
}