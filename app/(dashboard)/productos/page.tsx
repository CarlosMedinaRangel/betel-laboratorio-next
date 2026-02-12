"use client"; // IMPORTANTE: Esto convierte el componente a Cliente
import ProductsTable from "./_componets/ProductsTable"; // Importamos la tabla de productos


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
    <div className="p-8 space-y-8">
      
      {/* Encabezado simple */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-primary/10 shadow-sm">
         <h2 className="text-2xl font-bold text-slate-800">Inventario</h2>
         <button className="bg-[#9727aa] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#9727aa]/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nuevo Producto
         </button>
      </div>

      {/* Grid Layout (Como lo tenías en tu HTML original) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Sección Izquierda: La Tabla (Ocupa 2 espacios) */}
        <div className="xl:col-span-2 space-y-4">
           <ProductsTable />
        </div>

        {/* Sección Derecha: (Ocupa 1 espacio - Opcional) */}
        {/* Aquí podrías poner filtros, resumen rápido o alertas */}
        <div className="space-y-4">
           <div className="bg-white p-6 rounded-xl border border-primary/10 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-4">Resumen Rápido</h3>
              <p className="text-sm text-slate-500">Aquí puedes poner tarjetas de stock bajo o filtros de búsqueda.</p>
           </div>
        </div>

      </div>
    </div>
  );
}