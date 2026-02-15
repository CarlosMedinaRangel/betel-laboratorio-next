"use client";
import { useState, useEffect } from "react";

interface EditExamProps {
    code: string;
  onClose: () => void;
  onSuccess: () => void;
}

// Edit existing exam metadata and results.
export default function EditExam({ code, onClose, onSuccess }: EditExamProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    price: 0,
    tat: 24,
    resultados: "", 
    status: "activo"
  });

  // 1. Cargar datos al abrir el componente
  useEffect(() => {
    const fetchExam = async () => {
      try {
                const res = await fetch(`/api/examenes/${code}`);
                const text = await res.text();
                const data = text ? JSON.parse(text) : null;

                if (res.ok && data) {
          setFormData({
            code: data.code || "",
            name: data.name || "",
            category: data.category || "Hematología",
            price: data.price || 0,
            tat: data.tat || 24,
            resultados: data.resultados || "", 
            status: data.status || "activo"
          });
        } else {
                    const message = data?.error || "Error al cargar el examen";
                    alert(message);
                    onClose();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

        if (code) fetchExam();
    }, [code, onClose]);

  // 2. Guardar cambios
  const handleUpdate = async () => {
    setSaving(true);
    try {
            const res = await fetch(`/api/examenes/${code}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

                if (!res.ok) {
                    const text = await res.text();
                    const data = text ? JSON.parse(text) : null;
                    throw new Error(data?.error || "Error al actualizar");
                }

        // Éxito
        onSuccess(); 

    } catch (error) {
        alert("No se pudo guardar los cambios");
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Cargando datos del examen...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-primary/10 p-8 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
            <div>
                <h2 className="text-2xl font-black text-slate-800">Editar Examen</h2>
                <p className="text-sm text-slate-400">Modifica los detalles o agrega resultados</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>

        <div className="space-y-6">
            
            {/* DATOS BÁSICOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Código</label>
                    <input 
                        type="text" 
                        value={formData.code} 
                        onChange={e => setFormData({...formData, code: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-600 outline-none focus:border-primary"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nombre del Examen</label>
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Precio ($)</label>
                    <input 
                        type="number" 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:border-primary"
                    />
                </div>
                 <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Categoría</label>
                    <select 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-600 outline-none focus:border-primary"
                    >
                         <option>Hematología</option>
                         <option>Química Sanguínea</option>
                         <option>Hormonas</option>
                         <option>Inmunología</option>
                         <option>Urianálisis</option>
                    </select>
                </div>
            </div>

            {/* SECCIÓN DE RESULTADOS (Lo nuevo) */}
            <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-amber-600">lab_panel</span>
                    <h3 className="font-bold text-amber-800">Resultados / Interpretación</h3>
                </div>
                <p className="text-xs text-amber-700/70 mb-3">
                    Ingresa aquí los resultados predeterminados o la plantilla de interpretación para este examen.
                </p>
                <textarea 
                    rows={5}
                    value={formData.resultados}
                    onChange={e => setFormData({...formData, resultados: e.target.value})}
                    placeholder="Ej: Muestra procesada mediante método X. Resultados dentro de límites..."
                    className="w-full p-4 bg-white border border-amber-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"
                ></textarea>
            </div>  
            <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Estado</label>
                <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-600 outline-none focus:border-primary"
                >
                    
                     <option value="activo">Activo</option>
                     <option value="En proceso">En proceso</option>
                     <option value="archivado">Archivado</option>
                </select>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                    onClick={onClose}
                    disabled={saving}
                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-[#8a239b] transition-all flex justify-center items-center gap-2"
                >
                    {saving ? "Guardando..." : (
                        <>
                            <span className="material-symbols-outlined">save</span>
                            Guardar Cambios
                        </>
                    )}
                </button>
            </div>

        </div>
    </div>
  );
}