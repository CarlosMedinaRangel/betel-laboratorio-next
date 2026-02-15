"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ExamWorkbench from "./_components/ExamWorkbench"; 
import EditExam from "./_components/EditExam"; 

// Tipo de dato para el examen (frontend)
type ExamSummary = {
  code: string;
  name: string;
  category: string;
  price: number;
  status: string;
};

// Exams catalog with create/edit flows and search.
export default function ExamenesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Estados de interfaz
  const [showWorkbench, setShowWorkbench] = useState(false); 
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados de datos (Backend)
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);

  // Redirección si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Cargar exámenes al montar o buscar
  useEffect(() => {
     if(status === "authenticated") {
        fetchExams();
     }
  }, [status, searchTerm]);

  // Función para pedir datos a la API
  const fetchExams = async () => {
     setIsLoadingExams(true);
     try {
       const res = await fetch(`/api/examenes?search=${searchTerm}&t=${Date.now()}`);
       if (!res.ok) throw new Error(`Error ${res.status}`);
       const data = await res.json();
       setExams(data);
     } catch (error) {
       console.error("Error cargando exámenes:", error);
       setExams([]); 
     } finally {
       setIsLoadingExams(false);
     }
  };

  // --- HANDLERS ---
  const handleCreateNew = () => {
    setEditingId(null); // Aseguramos que no estamos editando
    setShowWorkbench(true);
  };

  // Función que se activa al dar clic en "Editar"
  const handleEdit = (id: string) => {
    setShowWorkbench(false);
    setEditingId(id); 
  };

  const handleSuccessSave = () => {
      setShowWorkbench(false);
      setEditingId(null); 
      fetchExams(); 
  };

  const handleBackToList = () => {
    setShowWorkbench(false);
    setEditingId(null);
  };

  // --- RENDERIZADO ---
  if (status === "loading") return <div className="p-8 text-slate-500">Cargando sesión...</div>;

  // 1. MODO CREACIÓN (Workbench)
  if (showWorkbench) {
    return (
      <div className="animate-in slide-in-from-right duration-300 relative">
         <button onClick={handleBackToList} className="absolute top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md text-slate-500 hover:text-primary transition-colors border border-slate-100">
            <span className="material-symbols-outlined">arrow_back</span>
         </button>
         <ExamWorkbench onSuccess={handleSuccessSave} /> 
      </div>
    );
  }

  // 2. MODO EDICIÓN (EditExam )
  if (editingId) {
    return (
      <div className="animate-in slide-in-from-right duration-300 relative p-8">
         {/* EditExam ya tiene su propio botón de cerrar, pero pasamos el handler */}
        <EditExam 
          code={editingId} 
          onClose={handleBackToList} 
          onSuccess={handleSuccessSave} 
        />
      </div>
    );
  }

  // 3. VISTA PRINCIPAL (LISTA)
  return (
    <div className="p-8 space-y-8 bg-[#F9F7FA] min-h-screen font-display">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Catálogo de Exámenes</h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona tus pruebas de laboratorio.</p>
        </div>
        <button onClick={handleCreateNew} className="group flex items-center gap-2 px-6 py-3 bg-[#9727aa] text-white font-bold rounded-xl shadow-lg shadow-[#9727aa]/30 hover:bg-[#8a239b] transition-all">
          <span className="material-symbols-outlined">add</span>
          Crear Nuevo
        </button>
      </div>

      {/* Buscador */}
      <div> 
        <h3 className="text-sm text-slate-500 mb-2">
        Ingresa el codigo del examen para poder buscarlo...

        </h3>
      </div>
      <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
      </div>

      {/* Grid de Resultados */}
      {isLoadingExams ? (
         <div className="text-center py-20 text-slate-400">Cargando datos...</div>
      ) : exams.length === 0 ? (
         <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">No se encontraron exámenes.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {exams.map((exam) => (
            <div key={exam.code} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-xl transition-all relative overflow-hidden group">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
               <div className="pl-3 mb-2">
                <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded">Codigo del examen:</span>
                  
               </div>
               <div className="pl-3 mb-2">
                <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded">{exam.code}</span>
               </div>
               <h3 className="pl-3 text-lg font-bold text-slate-800 mb-1">Nombre: {exam.name}</h3>
               <p className="pl-3 text-xs text-slate-400 mb-4">{exam.category}</p>
               <div className="pl-3 border-t border-slate-50 pt-3 flex justify-between items-center">
                  <span className="font-black text-slate-700">${exam.price?.toFixed(2)}</span>
                  
                  {/* --- BOTÓN EDITAR CONECTADO --- */}
                  <button 
                      onClick={() => handleEdit(exam.code)} 
                      className="text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                      Editar
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}