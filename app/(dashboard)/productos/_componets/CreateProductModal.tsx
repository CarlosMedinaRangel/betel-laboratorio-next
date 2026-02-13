"use client";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
};

export default function CreateProductModal({ isOpen, onClose, onProductCreated }: Props) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    serial: "",
    name: "",
    unit: "",
    stock: "",
    price: "",
    minStock: "",
    category: "General",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar");
      }

      
      setShowSuccess(true);
      
      
      setTimeout(() => {
        onProductCreated(); // Avisamos al padre para cerrar y recargar
        setShowSuccess(false);
        setFormData({ serial: "", name: "", unit: "", stock: "", price: "", minStock: "", category: "General" });
      }, 1500);

    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-2.5 rounded-lg border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#9727aa] focus:border-[#9727aa] transition-all";
  const labelClass = "block text-xs font-semibold text-[#C795D0] mb-1 uppercase tracking-wide";
  const iconClass = "material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9727aa] text-[20px] pointer-events-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e131f]/60 backdrop-blur-sm p-4 transition-all">
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border-t-4 border-[#9727aa] relative" style={{ minHeight: "420px" }}>
        
        
        {showSuccess ? (
          <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
            
            {/* Contenedor del Ícono con Onda Expansiva */}
            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
               {/* La onda expansiva (detrás) */}
               <span className="absolute inset-0 rounded-full bg-green-200 animate-ping opacity-70"></span>
               
               {/* El círculo principal (al frente) */}
               <div className="relative w-24 h-24 bg-green-100 rounded-full flex items-center justify-center z-10 shadow-sm">
                 {/* Ícono de Estetoscopio */}
                 <span className="material-symbols-outlined text-5xl text-green-600">stethoscope</span>
               </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Producto Guardado!</h3>
            <p className="text-gray-500">El inventario médico se ha actualizado.</p>
          </div>
        ) : (
          /* --- VISTA DEL FORMULARIO (Sin cambios aquí) --- */
          <>
            {/* Encabezado */}
            
            <div className="px-8 py-5 border-b border-primary/10 flex justify-between items-start bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Nuevo Insumo</h3>
                <p className="text-sm text-[#C795D0]">Registra un nuevo producto en el catálogo</p>
              </div>
              <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {errorMessage && (
              <div className="mx-8 mt-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                <span className="material-symbols-outlined">error</span>
                {errorMessage}
              </div>
            )}

            <div className="overflow-y-auto p-8 bg-[#FAF7FC] flex-1 max-h-[60vh]">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Sección 1 */}
                <section>
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-200/60 pb-2">
                    <span className="material-symbols-outlined text-[#9727aa]">info</span>
                    <h4 className="text-sm font-bold text-gray-700 uppercase">Información Básica</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Código / Serial</label>
                      <div className="relative">
                        <span className={iconClass}>qr_code_2</span>
                        <input required name="serial" value={formData.serial} onChange={handleChange} placeholder="Ej: REF-001" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Categoría</label>
                      <div className="relative">
                        <span className={iconClass}>category</span>
                        <select name="category" value={formData.category} onChange={handleChange} className={`${inputClass} appearance-none bg-white`}>
                          <option value="General">General</option>
                          <option value="Lab hormonal">Lab hormonal</option>
                          <option value="Reactivos">Reactivos</option>
                          <option value="Insumos">Insumos</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px] pointer-events-none">expand_more</span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Nombre del Producto</label>
                      <div className="relative">
                        <span className={iconClass}>science</span>
                        <input required name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Tubos de Ensayo Rojos" className={inputClass} />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Sección 2 */}
                <section>
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-200/60 pb-2">
                    <span className="material-symbols-outlined text-[#9727aa]">inventory_2</span>
                    <h4 className="text-sm font-bold text-gray-700 uppercase">Control de Stock & Precio</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Unidad de Medida</label>
                      <div className="relative">
                        <span className={iconClass}>scale</span>
                        <input required name="unit" value={formData.unit} onChange={handleChange} placeholder="Ej: 50 ml, Caja" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Precio Unitario</label>
                      <div className="relative">
                        <span className={iconClass}>attach_money</span>
                        <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Stock Inicial</label>
                      <div className="relative">
                        <span className={iconClass}>package_2</span>
                        <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Alerta Stock Mínimo</label>
                      <div className="relative">
                        <span className={iconClass}>notification_important</span>
                        <input required type="number" name="minStock" value={formData.minStock} onChange={handleChange} className={`${inputClass} border-red-100 focus:border-red-400 focus:ring-red-400`} />
                      </div>
                    </div>
                  </div>
                </section>
              </form>
            </div>

            <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
                  Cancelar
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading} 
                  className="px-8 py-2.5 text-sm font-bold text-white bg-[#9727aa] rounded-lg shadow-md shadow-[#9727aa]/20 hover:bg-[#9727aa]/90 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                >
                  {loading ? "Guardando..." : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Guardar Producto
                    </>
                  )}
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}