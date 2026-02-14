import { NextResponse } from "next/server";
import  connectDB  from "@/lib/mongoose";
import Product from "@/models/product";
import Exam from "@/models/exam";

export async function GET() {
  try {
    await connectDB();

    // 1. Obtener Productos con Stock Bajo (Stock <= MinStock)
    const lowStockProducts = await Product.find({
      $expr: { $lte: ["$stock", "$minStock"] }
    }).limit(5); // Traemos solo los 5 más críticos

    // 2. Estadísticas de Exámenes (Agrupados por Estado)
    const examStats = await Exam.aggregate([
      {
        $group: {
          _id: "$status", // Agrupa por "active", "En proceso", "Archivado"
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Totales Generales (Para las tarjetas KPI)
    const totalExams = await Exam.countDocuments();
    
    // Exámenes creados hoy
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const examsToday = await Exam.countDocuments({
      createdAt: { $gte: startOfDay }
    });

    // Filtramos conteos específicos para el gráfico "", "En proceso", "archivado"
    const activeCount = examStats.find(s => s._id === "activo")?.count || 0;
    const processCount = examStats.find(s => s._id === "En proceso")?.count || 0;
    const archivedCount = examStats.find(s => s._id === "archivado")?.count || 0;

    return NextResponse.json({
      lowStockProducts,
      kpi: {
        totalExams,
        examsToday,
        activeCount,
        processCount,
        archivedCount
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Error cargando dashboard" }, { status: 500 });
  }
}