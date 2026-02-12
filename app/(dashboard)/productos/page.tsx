"use client"; 
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // 1. Agregamos useState

// Importamos tus componentes (Asegúrate de que la ruta sea correcta)
// Nota: Usé "_componets" porque así lo tenías en tu código, 
// pero revisa si la carpeta se llama "_components" o "_componets".
import ProductsTable from "./_componets/ProductsTable"; 
import CreateProductModal from "./_componets/CreateProductModal"; // 2. Importamos el Modal nuevo

export default function ProductosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // 3. Estados nuevos para manejar el Modal y la recarga de la tabla
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Redirección si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // 4. Función mágica: Cuando se crea un producto, actualizamos la tabla
  const handleProductCreated = () => {
    setRefreshKey((prev) => prev + 1); // Cambiar esto obliga a la tabla a recargar
    setIsModalOpen(false); // Cerramos el modal
  };

  return (
    <div className="p-8 space-y-8">
      
      {/* Encabezado simple */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-primary/10 shadow-sm">
         <h2 className="text-2xl font-bold text-slate-800">Inventario</h2>
         
         {/* 5. Conectamos el botón al estado */}
         <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#9727aa] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#9727aa]/90 transition-colors flex items-center gap-2"
         >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nuevo Producto
         </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Sección Izquierda: La Tabla */}
        <div className="xl:col-span-2 space-y-4">
           {/* 6. Pasamos la 'key'. Cada vez que refreshKey cambie, la tabla se recarga sola */}
           <ProductsTable key={refreshKey} />
        </div>

        {/* Sección Derecha */}
        <div className="space-y-4">
           <div className="bg-white p-6 rounded-xl border border-primary/10 shadow-sm">
              <h3 className="font-bold text-slate-700 mb-4">Resumen Rápido</h3>
              <p className="text-sm text-slate-500">Aquí puedes poner tarjetas de stock bajo o filtros de búsqueda.</p>
           </div>
        </div>

      </div>

      {/* 7. Renderizamos el Modal (invisible hasta que isModalOpen sea true) */}
      <CreateProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onProductCreated={handleProductCreated}
      />

    </div>
  );
}