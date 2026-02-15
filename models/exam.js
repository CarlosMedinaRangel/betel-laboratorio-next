import mongoose, { Schema, model, models } from "mongoose";

// Sub-schema for reference ranges per gender and age.
const ReferenceRangeSchema = new Schema({
  gender: { type: String, required: true, enum: ["M", "F", "Ambos", "Niños"] },
  ageMin: { type: Number, required: true },
  ageMax: { type: Number, required: true },
  ageUnit: { type: String, enum: ["Años", "Meses", "Días"], default: "Años" },
  low: { type: Number, required: true },
  high: { type: Number, required: true },
  unit: { type: String, required: false }, // ej: mg/dL
});

// Sub-schema for inventory components used by an exam.
const ExamComponentSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true }, 
  name: { type: String, required: true }, 
  category: { type: String },
  cost: { type: Number, required: true }, 
  quantity: { type: Number, required: true, default: 1 },
  usagePhase: { type: String, default: "Procesamiento" },
});

// Main exam document schema.
const ExamSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true }, 
    sampleType: { type: String, required: true }, 
    methodology: { type: String },
    tat: { type: Number, default: 24 }, 
    price: { type: Number, required: true },
    status: { type: String, enum: ["activo", "En proceso", "archivado"], default: "activo" },
    resultados: { type: String, default: "Esperando resultados..." }, 
    
    // Arrays de sub-documentos
    ranges: [ReferenceRangeSchema],
    components: [ExamComponentSchema],
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
    versionKey: false,
  }
);

// Reuse model on hot reload.
const Exam = models.Exam || model("Exam", ExamSchema);

export default Exam;