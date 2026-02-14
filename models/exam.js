import mongoose, { Schema, model, models } from "mongoose";

// Sub-esquema para los Rangos de Referencia
const ReferenceRangeSchema = new Schema({
  gender: { type: String, required: true, enum: ["M", "F", "Ambos", "Niños"] },
  ageMin: { type: Number, required: true },
  ageMax: { type: Number, required: true },
  ageUnit: { type: String, enum: ["Años", "Meses", "Días"], default: "Años" },
  low: { type: Number, required: true },
  high: { type: Number, required: true },
  unit: { type: String, required: false }, // ej: mg/dL
});

// Sub-esquema para los Componentes (Insumos/Reactivos)
const ExamComponentSchema = new Schema({
  productId: { type: String, required: true }, // ID del producto en tu colección de inventario
  name: { type: String, required: true }, // Guardamos el nombre por si se borra el producto original
  category: { type: String },
  cost: { type: Number, required: true }, // Costo al momento de configurar el examen (snapshot)
  quantity: { type: Number, required: true, default: 1 },
  usagePhase: { type: String, default: "Procesamiento" },
});

// Esquema Principal del Examen
const ExamSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true }, // Hematología, Química, etc.
    sampleType: { type: String, required: true }, // Suero, Plasma, etc.
    methodology: { type: String },
    tat: { type: Number, default: 24 }, // Turnaround Time en horas
    price: { type: Number, required: true },
    status: { type: String, enum: ["activo", "En proceso", "archivado"], default: "activo" },
    resultados: { type: String, default: "Esperando resultados..." }, // Descripción de los resultados o interpretación
    
    // Arrays de sub-documentos
    ranges: [ReferenceRangeSchema],
    components: [ExamComponentSchema],
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
    versionKey: false,
  }
);

// Evitar recompilar el modelo si ya existe (Hot Reload de Next.js)
const Exam = models.Exam || model("Exam", ExamSchema);

export default Exam;