"use client"; // IMPORTANTE: Esto convierte el componente a Cliente

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProductosPage() {

const { data: session, status } = useSession();
  const router = useRouter();
    useEffect(() => {
      if (status === "unauthenticated") {
        router.push("/login");
      }
    }, [status, router]);
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Inventario de Productos</h1>
        <p className="text-slate-500">Gestión de reactivos e insumos.</p>
      </header>

      {/* Contenido blanco estilo tarjeta */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5">
        <p>Aquí irá tu tabla de productos...</p>
      </div>
    </div>
  );
}