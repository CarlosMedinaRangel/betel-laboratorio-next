import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Exam from "@/models/exam";
import Product from "@/models/product";

// 1. ESTA ES LA QUE TE FALTA O FALLA (Para fetchExams)
export async function GET(request: Request) {
  try {
    await connectDB();
    // Obtenemos los parámetros de búsqueda de la URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { code: { $regex: search, $options: "i" } },
        ],
      };
    }

    const exams = await Exam.find(query).sort({ createdAt: -1 });
    return NextResponse.json(exams); // Retorna JSON 200 OK
  } catch (error) {
    console.error("Error GET:", error);
    return NextResponse.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}

// 2. ESTA ES LA QUE YA TIENES (Para guardar)
export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const components = Array.isArray(data?.components) ? data.components : [];

    const decrementStock = async (useSession?: mongoose.ClientSession) => {
      const decremented: Array<{ productId: string; quantity: number }> = [];

      for (const component of components) {
        const quantity = Number(component?.quantity) || 0;
        const productId = component?.productId;

        if (!productId || quantity <= 0) {
          throw new Error("Componente invalido en el examen");
        }

        const updated = await Product.findOneAndUpdate(
          { _id: productId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session: useSession }
        );

        if (!updated) {
          const productName = component?.name || "producto";
          throw new Error(`Stock insuficiente para ${productName}`);
        }

        decremented.push({ productId, quantity });
      }

      return decremented;
    };

    let newExam: any;

    try {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await decrementStock(session);
          const created = await Exam.create([data], { session });
          newExam = created[0];
        });
      } finally {
        session.endSession();
      }

      return NextResponse.json(newExam, { status: 201 });
    } catch (error: any) {
      const message = error?.message || "Error interno del servidor";

      if (message.includes("Transaction numbers are only allowed")) {
        let decremented: Array<{ productId: string; quantity: number }> = [];

        try {
          decremented = await decrementStock();
          newExam = await Exam.create(data);
          return NextResponse.json(newExam, { status: 201 });
        } catch (fallbackError: any) {
          for (const item of decremented) {
            await Product.updateOne(
              { _id: item.productId },
              { $inc: { stock: item.quantity } }
            );
          }

          const fallbackMessage = fallbackError?.message || "Error interno del servidor";
          const status = fallbackMessage.includes("Stock insuficiente") || fallbackMessage.includes("Componente invalido") ? 400 : 500;
          return NextResponse.json({ error: fallbackMessage }, { status });
        }
      }

      const status = message.includes("Stock insuficiente") || message.includes("Componente invalido") ? 400 : 500;
      return NextResponse.json({ error: message }, { status });
    }
  } catch (error: any) {
    const message = error?.message || "Error interno del servidor";
    const status = message.includes("Stock insuficiente") || message.includes("Componente invalido") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}