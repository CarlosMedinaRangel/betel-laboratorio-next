"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Tipos para los datos que vienen de la API
type DashboardData = {
  lowStockProducts: Array<{
    _id: string;
    name: string;
    stock: number;
    minStock: number;
    category: string;
  }>;
  kpi: {
    totalExams: number;
    examsToday: number;
    activeCount: number;
    processCount: number;
    archivedCount: number;
  };
};

// Dashboard view with KPIs, alerts, and quick actions.
export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Protección de ruta
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Cargar datos reales
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/dashboard")
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((err) => console.error(err));
    }
  }, [status]);

  const handleNewExam = () => {
    router.push("/examenes");
  };

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center h-screen text-primary font-bold animate-pulse">Cargando Dashboard...</div>;
  }

  // Cálculos para el gráfico (Porcentajes para las barras)
  const totalForChart = (data?.kpi.activeCount || 0) + (data?.kpi.processCount || 0) + (data?.kpi.archivedCount || 0) || 1;
  const activePercent = Math.round(((data?.kpi.activeCount || 0) / totalForChart) * 100);
  const processPercent = Math.round(((data?.kpi.processCount || 0) / totalForChart) * 100);
  const archivedPercent = Math.round(((data?.kpi.archivedCount || 0) / totalForChart) * 100);

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#F9F7FA] font-display">
      
      {/* --- TOP HEADER --- */}
      <header className="h-20 bg-white border-b border-primary/5 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary/50 transition-all text-sm outline-none"
                />
            </div>
        </div>

        <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-primary/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">notifications</span>
                {/* Indicador de alerta si hay stock bajo */}
                {data && data.lowStockProducts.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button 
                onClick={handleNewExam}
                className="bg-primary hover:bg-[#8a239b] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
                <span className="material-symbols-outlined text-sm">add</span>
                Nuevo Examen
            </button>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
        
        {/* Título */}
        <div>
            <h2 className="text-2xl font-black text-slate-800">Vista General</h2>
            <p className="text-slate-500 text-sm mt-1">
              Resumen operativo para hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}.
            </p>
        </div>

        {/* 1. KPI CARDS (Métricas Reales) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tarjeta: Exámenes Totales */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                    <span className="p-2 rounded-lg material-symbols-outlined text-blue-600 bg-blue-50">medical_information</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-full text-blue-500 bg-blue-50">Total</span>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Exámenes Totales</p>
                <h3 className="text-3xl font-black mt-1 text-slate-800">{data?.kpi.totalExams || 0}</h3>
            </div>

            {/* Tarjeta: Stock Bajo */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                    <span className="p-2 rounded-lg material-symbols-outlined text-orange-600 bg-orange-50">inventory</span>
                    {data?.lowStockProducts.length ? (
                         <span className="text-xs font-bold px-2 py-1 rounded-full text-orange-600 bg-orange-100 animate-pulse">¡Atención!</span>
                    ) : (
                         <span className="text-xs font-bold px-2 py-1 rounded-full text-green-600 bg-green-100">OK</span>
                    )}
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Productos Stock Bajo</p>
                <h3 className="text-3xl font-black mt-1 text-slate-800">{data?.lowStockProducts.length || 0}</h3>
            </div>

            {/* Tarjeta: En Proceso */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                    <span className="p-2 rounded-lg material-symbols-outlined text-purple-600 bg-purple-50">hourglass_top</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-full text-purple-500 bg-purple-50">En curso</span>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">En Proceso</p>
                <h3 className="text-3xl font-black mt-1 text-slate-800">{data?.kpi.processCount || 0}</h3>
            </div>

            {/* Tarjeta: Hoy */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                    <span className="p-2 rounded-lg material-symbols-outlined text-green-600 bg-green-50">today</span>
                    <span className="text-xs font-bold px-2 py-1 rounded-full text-green-500 bg-green-50">Nuevo</span>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Creados Hoy</p>
                <h3 className="text-3xl font-black mt-1 text-slate-800">{data?.kpi.examsToday || 0}</h3>
            </div>
        </div>

        {/* 2. GRÁFICO Y ALERTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Gráfico de Barras: Estado de Exámenes */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="mb-8">
                    <h4 className="text-lg font-bold text-slate-800">Estado de Exámenes</h4>
                    <p className="text-sm text-slate-500">Distribución actual del flujo de trabajo</p>
                </div>
                
                {/* Diagrama de Barras Custom */}
                <div className="flex-1 flex items-end justify-around gap-4 h-64 pb-6 border-b border-slate-100 relative">
                   {/* Fondo de líneas */}
                   <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                      <div className="border-t border-dashed border-slate-200 w-full h-px"></div>
                      <div className="border-t border-dashed border-slate-200 w-full h-px"></div>
                      <div className="border-t border-dashed border-slate-200 w-full h-px"></div>
                      <div className="border-t border-dashed border-slate-200 w-full h-px"></div>
                   </div>

                   {/* Barra: En Proceso */}
                   <div className="flex flex-col items-center gap-2 group w-1/4 z-10">
                      <div className="text-sm font-bold text-slate-600 group-hover:scale-110 transition-transform">{data?.kpi.processCount}</div>
                      <div 
                        className="w-full bg-orange-400 rounded-t-xl hover:bg-orange-500 transition-all relative group-hover:shadow-lg shadow-orange-200"
                        style={{ height: `${Math.max(10, processPercent)}%`, minHeight: '2rem' }}
                      ></div>
                      <div className="text-xs font-bold text-slate-400 uppercase mt-2">En Proceso</div>
                   </div>

                   {/* Barra: Activos */}
                   <div className="flex flex-col items-center gap-2 group w-1/4 z-10">
                      <div className="text-sm font-bold text-slate-600 group-hover:scale-110 transition-transform">{data?.kpi.activeCount}</div>
                      <div 
                        className="w-full bg-green-500 rounded-t-xl hover:bg-green-600 transition-all relative group-hover:shadow-lg shadow-green-200"
                        style={{ height: `${Math.max(10, activePercent)}%`, minHeight: '2rem' }}
                      ></div>
                      <div className="text-xs font-bold text-slate-400 uppercase mt-2">Activos</div>
                   </div>

                   {/* Barra: Archivados */}
                   <div className="flex flex-col items-center gap-2 group w-1/4 z-10">
                      <div className="text-sm font-bold text-slate-600 group-hover:scale-110 transition-transform">{data?.kpi.archivedCount}</div>
                      <div 
                        className="w-full bg-slate-300 rounded-t-xl hover:bg-slate-400 transition-all relative group-hover:shadow-lg"
                        style={{ height: `${Math.max(10, archivedPercent)}%`, minHeight: '2rem' }}
                      ></div>
                      <div className="text-xs font-bold text-slate-400 uppercase mt-2">Archivados</div>
                   </div>
                </div>
            </div>

            {/* Lista Real de Stock Bajo */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-bold text-slate-800">Alertas de Stock</h4>
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">Crítico</span>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                    {data?.lowStockProducts.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 flex flex-col items-center">
                             <span className="material-symbols-outlined text-4xl mb-2 text-green-300">check_circle</span>
                             <p>Todo el inventario está bien.</p>
                        </div>
                    ) : (
                        data?.lowStockProducts.map((product) => (
                            <div key={product._id} className="flex items-center gap-4 p-3 rounded-xl bg-red-50 border border-red-100 group">
                                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-xl">warning</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold truncate text-slate-800">{product.name}</p>
                                    <p className="text-xs text-red-600 font-bold">
                                        Quedan: {product.stock} <span className="font-normal text-slate-500">(Mín: {product.minStock})</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {data?.lowStockProducts.length !== 0 && (
                    <button onClick={() => router.push("/productos")} className="w-full mt-6 py-3 border-2 border-dashed border-red-200 text-red-500 font-bold text-sm rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">inventory_2</span>
                        Gestionar Inventario
                    </button>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}