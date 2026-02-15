"use client";
import { useState, useEffect, useRef } from "react";

// --- 1. TIPOS DE DATOS ---

type Product = {
  _id: string;
  serial: string;
  name: string;
  unit: number;
  stock: number;
  price: number;
  minStock: number; 
  category: string;
};

// Frontend Type (Puede tener strings en inputs temporales)
type ReferenceRange = {
  id: string; // ID temporal para UI
  gender: "M" | "F" | "Ambos" | "Niños";
  ageMin: number | string;
  ageMax: number | string;
  ageUnit: "Años" | "Meses" | "Días";
  low: number | string;
  high: number | string;
  unit: string;
};

type ExamComponent = {
  id: string;
  productId: string;
  name: string;
  cost: number;
  quantity: number;
  category: string;
};

type ExamData = {
  code: string;
  name: string;
  category: string;
  sampleType: string;
  methodology: string;
  tat: string;
  price: string;
  ranges: ReferenceRange[];
  components: ExamComponent[];
};

interface ExamWorkbenchProps {
  onSuccess?: () => void;
}

// Multi-step exam creation flow with ranges and components.

const RANGE_PRESETS = [
  { label: "Adultos (General)", gender: "Ambos", min: 18, max: 99, unit: "Años" },
  { label: "Hombres Adultos", gender: "M", min: 18, max: 60, unit: "Años" },
  { label: "Mujeres Adultas", gender: "F", min: 18, max: 60, unit: "Años" },
  { label: "Niños (Pediátrico)", gender: "Niños", min: 0, max: 12, unit: "Años" },
  { label: "Bebés (Neonatal)", gender: "Niños", min: 0, max: 30, unit: "Días" },
];

export default function ExamWorkbench({ onSuccess }: ExamWorkbenchProps) {
  // --- ESTADOS ---
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  
  // Buscador de Productos
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Estado Principal
  const [examData, setExamData] = useState<ExamData>({
    code: "",
    name: "",
    category: "Hematología",
    sampleType: "Suero",
    methodology: "Quimioluminiscencia",
    tat: "24",
    price: "",
    ranges: [],
    components: []
  });

  // Temporales
  const [tempRange, setTempRange] = useState<Partial<ReferenceRange>>({ 
      gender: "Ambos", ageUnit: "Años", low: "", high: "", ageMin: "", ageMax: "", unit: "" 
  });

  const [tempComponent, setTempComponent] = useState<ExamComponent>({
    id: "", productId: "", name: "", cost: 0, quantity: 1, category: "",
  });

  // --- EFECTOS ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product");
        if (res.ok) {
          const data = await res.json();
          setAvailableProducts(data);
        }
      } catch (error) {
        console.error("Error cargando inventario:", error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- FUNCIONES ---

  // RANGOS
  const loadRangePreset = (presetIndex: string) => {
    if(presetIndex === "") return;
    const preset = RANGE_PRESETS[parseInt(presetIndex)];
    setTempRange({
        ...tempRange,
        gender: preset.gender as any,
        ageMin: preset.min,
        ageMax: preset.max,
        ageUnit: preset.unit as any,
        low: "", high: "" // Limpiamos valores para que el usuario los ponga
    });
  };

  const addRange = () => {
    if(!tempRange.low || !tempRange.high) return;
    const newRange = { ...tempRange, id: crypto.randomUUID() } as ReferenceRange;
    setExamData({ ...examData, ranges: [...examData.ranges, newRange] });
    setTempRange({ ...tempRange, low: "", high: "" }); 
  };

  const removeRange = (id: string) => {
    setExamData({ ...examData, ranges: examData.ranges.filter(r => r.id !== id) });
  };

  // PRODUCTOS
  const handleSelectProduct = (prod: Product) => {
      setTempComponent({
          ...tempComponent,
          productId: prod._id,
          name: prod.name,
          cost: prod.price, 
          category: prod.category,
          quantity: 1
      });
      setSearchTerm(prod.name);
      setIsSearchOpen(false);
  };

  const addComponent = () => {
    if (!tempComponent.name) return;
    setExamData((prev) => ({
      ...prev,
      components: [...prev.components, { ...tempComponent, id: crypto.randomUUID() }],
    }));
    setTempComponent({ id: "", productId: "", name: "", cost: 0, quantity: 1, category: "" });
    setSearchTerm("");
  };

  const removeComponent = (id: string) => {
    setExamData((prev) => ({ ...prev, components: prev.components.filter((c) => c.id !== id) }));
  };

  // --- GUARDADO FINAL (CORREGIDO PARA SCHEMA) ---
  const handleFinalSave = async () => {
    setLoading(true);
    try {
      // 1. Transformación de datos (String -> Number) para evitar errores de Mongoose
      const formattedPayload = {
        code: examData.code,
        name: examData.name,
        category: examData.category,
        sampleType: examData.sampleType,
        methodology: examData.methodology,
        tat: Number(examData.tat) || 24,
        price: Number(examData.price) || 0,
        status: "activo",
        
        // Mapeamos los rangos asegurando números
        ranges: examData.ranges.map(r => ({
            gender: r.gender,
            ageMin: Number(r.ageMin),
            ageMax: Number(r.ageMax),
            ageUnit: r.ageUnit,
            low: Number(r.low),
            high: Number(r.high),
            unit: r.unit
        })),

        // Mapeamos los componentes asegurando estructura
        components: examData.components.map(c => ({
            productId: c.productId,
            name: c.name,
            category: c.category || "General",
            cost: Number(c.cost),
            quantity: Number(c.quantity),
            usagePhase: "Procesamiento"
        }))
      };

    const response = await fetch("/api/examenes", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedPayload),
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.error || "Error al guardar el examen");
      }

      setSuccess(true);
      setTimeout(() => { if (onSuccess) onSuccess(); }, 1500);

    } catch (error: any) {
      console.error("Error al guardar:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- UTILS VISUALES ---
  const getStockStatusColor = (stock: number, min: number) => {
     if(stock === 0) return "bg-red-100 text-red-700 border-red-200";
     if(stock <= min) return "bg-amber-100 text-amber-700 border-amber-200";
     return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };
  
  const getStockStatusText = (stock: number, min: number) => {
      if(stock === 0) return "Agotado";
      if(stock <= min) return "Bajo Stock";
      return "En Stock";
   };

  const filteredProducts = availableProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.serial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const steps = ["Detalles", "Rangos", "Reactivos", "Revisión"];

  if (success) {
    return (
        <div className="flex flex-col items-center justify-center h-[500px] animate-in zoom-in duration-500 bg-white rounded-2xl shadow-xl">
             <div className="relative w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <span className="material-symbols-outlined text-5xl text-purple-600">check_circle</span>
             </div>
             <h2 className="text-2xl font-black text-slate-800 mb-2">¡Examen Guardado!</h2>
             <p className="text-slate-500">Configuración aplicada correctamente.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7FA] font-display text-slate-800 flex flex-col pb-20">
      
      {/* STEPPER */}
      <div className="w-full max-w-4xl mx-auto my-8 px-4">
           <div className="relative flex items-center justify-between">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full z-0"></div>
              <div className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-500 rounded-full z-0" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}></div>
              {steps.map((label, index) => {
                 const isActive = index === currentStep;
                 const isCompleted = index < currentStep;
                 return (
                    <div key={index} className="relative z-10 flex flex-col items-center cursor-pointer group" onClick={() => setCurrentStep(index)}>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#F9F7FA] transition-all duration-300 ${isCompleted ? "bg-emerald-500 text-white" : isActive ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" : "bg-slate-200 text-slate-400 group-hover:bg-slate-300"}`}>
                          <span className="material-symbols-outlined text-lg">{index === 0 ? "edit_document" : index === 1 ? "tune" : index === 2 ? "biotech" : "verified"}</span>
                       </div>
                       <span className={`absolute top-12 text-[9px] font-black uppercase whitespace-nowrap transition-colors ${isActive ? "text-primary" : "text-slate-400"}`}>{label}</span>
                    </div>
                 );
              })}
           </div>
      </div>

      <div className="flex-1 px-4">
        
        {/* PASO 1: GENERAL */}
        {currentStep === 0 && (
            <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl shadow-xl shadow-primary/5 border border-primary/10 p-8">
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit_document</span>
                        Información General
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Código Interno</label>
                            <input value={examData.code} onChange={(e) => setExamData({...examData, code: e.target.value})} placeholder="Ej: TSH-001" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase font-bold text-slate-600" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nombre del Examen</label>
                            <input value={examData.name} onChange={(e) => setExamData({...examData, name: e.target.value})} placeholder="Ej: TSH Neonatal" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-semibold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Categoría</label>
                            <select value={examData.category} onChange={(e) => setExamData({...examData, category: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-600 cursor-pointer">
                                <option>Hematología</option>
                                <option>Química Sanguínea</option>
                                <option>Hormonas</option>
                                <option>Inmunología</option>
                                <option>Urianálisis</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Tipo de Muestra</label>
                            <select value={examData.sampleType} onChange={(e) => setExamData({...examData, sampleType: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-600 cursor-pointer">
                                <option>Suero</option>
                                <option>Plasma</option>
                                <option>Sangre Total</option>
                                <option>Orina</option>
                                <option>Heces</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Tiempo (h)</label>
                                <input type="number" value={examData.tat} onChange={(e) => setExamData({...examData, tat: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-center" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Precio ($)</label>
                                <input type="number" value={examData.price} onChange={(e) => setExamData({...examData, price: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-700 text-center" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* PASO 2: RANGOS (DISEÑO UNIFICADO + PRESETS) */}
        {currentStep === 1 && (
            <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-right-8 duration-500">
                
                {/* Panel de Configuración */}
                <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl border border-primary/10 shadow-xl shadow-primary/5 h-fit">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <span className="material-symbols-outlined text-xl">tune</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg">Configurar Rango</h4>
                    </div>

                    <div className="space-y-5">
                        {/* SELECTOR DE PLANTILLAS */}
                        <div>
                             <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Cargar Plantilla</label>
                             <select 
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none focus:border-primary cursor-pointer"
                                onChange={(e) => loadRangePreset(e.target.value)}
                             >
                                <option value="">-- Seleccionar --</option>
                                {RANGE_PRESETS.map((p, i) => (
                                    <option key={i} value={i}>{p.label}</option>
                                ))}
                             </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Grupo / Género</label>
                            <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer" value={tempRange.gender} onChange={e => setTempRange({...tempRange, gender: e.target.value as any})}>
                                <option value="Ambos">Ambos</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="Niños">Pediátrico</option>
                            </select>
                        </div>

                        <div>
                             <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Edad del Paciente</label>
                             <div className="flex items-center gap-2 mb-2">
                                <input type="number" placeholder="0" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-center outline-none focus:border-primary font-bold" value={tempRange.ageMin} onChange={e => setTempRange({...tempRange, ageMin: e.target.value})} />
                                <span className="text-slate-300 font-black">-</span>
                                <input type="number" placeholder="100" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-center outline-none focus:border-primary font-bold" value={tempRange.ageMax} onChange={e => setTempRange({...tempRange, ageMax: e.target.value})} />
                            </div>
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                {["Años", "Meses", "Días"].map(u => (
                                    <button key={u} onClick={() => setTempRange({...tempRange, ageUnit: u as any})} className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${tempRange.ageUnit === u ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>{u}</button>
                                ))}
                            </div>
                        </div>

                        {/* TARJETA DE VALORES */}
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-3">
                            <p className="text-[10px] font-black text-primary uppercase tracking-wider">Valores de Referencia</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[9px] font-bold text-primary/70 uppercase mb-1 block">Mínimo</label>
                                    <input type="number" className="w-full px-3 py-2 bg-white border border-primary/20 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20" value={tempRange.low} onChange={e => setTempRange({...tempRange, low: e.target.value})} placeholder="0.0" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-primary/70 uppercase mb-1 block">Máximo</label>
                                    <input type="number" className="w-full px-3 py-2 bg-white border border-primary/20 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20" value={tempRange.high} onChange={e => setTempRange({...tempRange, high: e.target.value})} placeholder="0.0" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-primary/70 uppercase mb-1 block">Unidad de Medida</label>
                                <input type="text" placeholder="Ej: mg/dL" className="w-full px-3 py-2 bg-white border border-primary/20 rounded-lg text-xs outline-none font-medium" value={tempRange.unit} onChange={e => setTempRange({...tempRange, unit: e.target.value})} />
                            </div>
                        </div>
                        
                        <button onClick={addRange} className="w-full py-3 bg-[#9727aa] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#9727aa]/30 hover:bg-[#8a239b] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">add_circle</span>
                            Agregar Configuración
                        </button>
                    </div>
                </div>

                {/* Lista Visual */}
                <div className="flex-1 bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col min-h-[500px]">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-sm">{examData.ranges.length}</div>
                        <h4 className="font-bold text-slate-700">Rangos Configurados</h4>
                     </div>
                     
                     <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                        {examData.ranges.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                                <span className="material-symbols-outlined text-4xl mb-3 opacity-30">bar_chart</span>
                                <p className="font-medium text-sm">No hay rangos definidos</p>
                                <p className="text-xs opacity-70 mt-1">Configura los valores normales</p>
                            </div>
                        ) : examData.ranges.map(r => (
                            <div key={r.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.gender === 'Niños' ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <span className="material-symbols-outlined">{r.gender === 'Niños' ? 'child_care' : 'person'}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{r.gender}</p>
                                        <p className="text-xs text-slate-400 font-medium">{r.ageMin} - {r.ageMax} {r.ageUnit}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-6">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Rango Normal</p>
                                        <p className="font-mono font-bold text-primary text-lg">{r.low} - {r.high} <span className="text-xs text-slate-400">{r.unit}</span></p>
                                    </div>
                                    <button onClick={() => removeRange(r.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        )}

        {/* PASO 3: REACTIVOS (CON BUSCADOR MEJORADO) */}
        {currentStep === 2 && (
           <div className="flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-6xl mx-auto">
             
             {/* Formulario */}
             <div className="w-full md:w-1/3 bg-white p-6 rounded-2xl border border-primary/10 shadow-xl shadow-primary/5 h-fit">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-50">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <span className="material-symbols-outlined text-xl">science</span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-lg">Vincular Insumo</h4>
                </div>
                
                <div className="space-y-5">
                   {/* BUSCADOR CUSTOM */}
                   <div className="relative" ref={searchWrapperRef}>
                       <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Buscar en Inventario</label>
                       <div className="relative group">
                            <input 
                                type="text"
                                placeholder="Escribe para buscar..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setIsSearchOpen(true);
                                    if(e.target.value === "") setTempComponent(prev => ({...prev, productId: "", name: "" }));
                                }}
                                onFocus={() => setIsSearchOpen(true)}
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                            {searchTerm && (
                                <button onClick={() => { setSearchTerm(""); setTempComponent(prev => ({...prev, productId: "", name: "" })); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            )}
                       </div>
                       {isSearchOpen && (
                           <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 max-h-64 overflow-y-auto z-50 custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
                               {filteredProducts.length === 0 ? (
                                   <div className="p-4 text-center text-slate-400 text-xs">No se encontraron productos.</div>
                               ) : (
                                   filteredProducts.map(product => (
                                       <div key={product._id} onClick={() => handleSelectProduct(product)} className="px-4 py-3 hover:bg-primary/5 cursor-pointer border-b border-slate-50 last:border-0 transition-colors group">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded group-hover:bg-white transition-colors">#{product.serial}</span>
                                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${getStockStatusColor(product.stock, product.minStock)}`}>
                                                    {getStockStatusText(product.stock, product.minStock)} ({product.stock})
                                                   
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{product.name}</p>
                                       </div>
                                   ))
                               )}
                           </div>
                       )}
                   </div>

                   {tempComponent.productId && (
                       <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-100 shadow-sm animate-in slide-in-from-top-2 duration-300">
                           <div className="flex items-center gap-3 mb-3">
                               <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm text-primary">
                                   <span className="material-symbols-outlined">inventory_2</span>
                               </div>
                               <div>
                                   <p className="font-black text-slate-800 text-sm leading-tight">{tempComponent.name}</p>
                                   <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{tempComponent.category}</p>
                               </div>
                           </div>
                           <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                                <div>
                                    <label className="text-[9px] font-bold text-primary uppercase mb-1 block">Costo Unit.</label>
                                    <input type="number" value={tempComponent.cost} onChange={e => setTempComponent({...tempComponent, cost: parseFloat(e.target.value) || 0})} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:border-primary outline-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-primary uppercase mb-1 block">Cantidad Usada</label>
                                    <input type="number" value={tempComponent.quantity} onChange={e => setTempComponent({...tempComponent, quantity: parseFloat(e.target.value) || 0})} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:border-primary outline-none" />
                                </div>
                           </div>
                       </div>
                   )}

                   <button onClick={addComponent} disabled={!tempComponent.name} className="w-full py-3 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                       <span className="material-symbols-outlined text-sm">add_link</span>
                       Vincular Insumo
                   </button>
                </div>
             </div>

             {/* Lista */}
             <div className="flex-1 bg-white p-8 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center mb-6">
                   <div>
                       <h4 className="font-bold text-slate-800 text-lg">Estructura de Costos</h4>
                       <p className="text-xs text-slate-400 mt-1">Desglose de reactivos por prueba</p>
                   </div>
                   <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Costo Total</p>
                        <p className="text-2xl font-black text-primary tracking-tight">
                            ${examData.components.reduce((acc, curr) => acc + (curr.cost * curr.quantity), 0).toFixed(2)}
                        </p>
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {examData.components.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                        <span className="material-symbols-outlined text-4xl mb-3 opacity-30">science</span>
                        <p className="font-medium text-sm">No hay insumos vinculados</p>
                        <p className="text-xs opacity-70 mt-1">Busca y selecciona un producto</p>
                     </div>
                  ) : (
                      examData.components.map(c => (
                         <div key={c.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-primary/20 hover:shadow-md transition-all group">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-lg">science</span>
                               </div>
                               <div>
                                   <p className="font-bold text-sm text-slate-800">{c.name}</p>
                                   <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">{c.category}</span>
                                   </div>
                               </div>
                            </div>
                            <div className="text-right flex items-center gap-6">
                               <div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{c.quantity} x ${c.cost}</p>
                                    <p className="font-mono font-bold text-slate-700 text-lg">${(c.cost * c.quantity).toFixed(2)}</p>
                               </div>
                               <button onClick={() => removeComponent(c.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                  <span className="material-symbols-outlined">delete</span>
                               </button>
                            </div>
                         </div>
                      ))
                  )}
                </div>
             </div>
           </div>
        )}

        {/* PASO 4: REVISIÓN */}
        {currentStep === 3 && (
           <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-10 rounded-3xl border border-primary/10 shadow-2xl">
                 <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-100">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">Resumen Final</p>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">{examData.name || "Sin nombre"}</h2>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">{examData.code}</span>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">{examData.category}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-bold mb-1">Precio de Venta</p>
                        <p className="text-5xl font-black text-slate-800">${parseFloat(examData.price || "0").toFixed(2)}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-6 mb-10">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg">science</span>
                            <p className="text-xs text-slate-400 uppercase font-bold">Costo Insumos</p>
                        </div>
                        <p className="font-bold text-slate-700 text-xl">${examData.components.reduce((acc, c) => acc + (c.cost * c.quantity), 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg">list</span>
                            <p className="text-xs text-slate-400 uppercase font-bold">Rangos</p>
                        </div>
                        <p className="font-bold text-slate-700 text-xl">{examData.ranges.length} definidos</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg">schedule</span>
                            <p className="text-xs text-slate-400 uppercase font-bold">Tiempo (TAT)</p>
                        </div>
                        <p className="font-bold text-slate-700 text-xl">{examData.tat} Horas</p>
                    </div>
                 </div>

                 <button onClick={handleFinalSave} disabled={loading} className="w-full py-5 bg-[#9727aa] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#9727aa]/20 hover:bg-[#8a239b] hover:shadow-[#9727aa]/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                    {loading ? "Guardando configuración..." : <><span className="material-symbols-outlined">save</span> Publicar Examen</>}
                 </button>
              </div>
           </div>
        )}

      </div>

      {/* FOOTER DE NAVEGACIÓN */}
      {!success && (
          <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 flex justify-between items-center z-50 md:px-20">
              <button onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} disabled={currentStep === 0} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl disabled:opacity-0 transition-all">Atrás</button>
              <div className="hidden md:block text-xs font-bold text-slate-400 uppercase tracking-widest">Paso {currentStep + 1} de 4</div>
              {currentStep < 3 && (
                  <button onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))} className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-900 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                      Siguiente <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
              )}
          </div>
      )}
    </div>
  );
}