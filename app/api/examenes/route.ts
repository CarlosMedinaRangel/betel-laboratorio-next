import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Exam from "@/models/exam";
import Product from "@/models/product";

// List exams with optional search by code or name.
export async function GET(request: Request) {
  try {
    await connectDB();
    // Build search query when a term is provided.
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


// Create an exam and decrement stock for each component.
export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const payload = { ...data };
    const components = Array.isArray(payload?.components) ? payload.components : [];

    // Deduct stock with validation; supports optional transaction session.
    const decrementStock = async (useSession?: mongoose.ClientSession) => {
      const decremented: Array<{ productId: mongoose.Types.ObjectId; quantity: number }> = [];

      for (const component of components) {
        const quantity = Number(component?.quantity) || 0;
        const productId = component?.productId;
        const isValidProductId = mongoose.Types.ObjectId.isValid(productId);

        if (!productId || !isValidProductId || quantity <= 0) {
          throw new Error("Componente invalido en el examen");
        }

        const productObjectId = new mongoose.Types.ObjectId(productId);

        const updated = await Product.findOneAndUpdate(
          { _id: productObjectId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session: useSession }
        );

        if (!updated) {
          const productName = component?.name || "producto";
          throw new Error(`Stock insuficiente para ${productName}`);
        }

        decremented.push({ productId: productObjectId, quantity });
      }

      return decremented;
    };

    let newExam: any;

    try {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          await decrementStock(session);
          const created = await Exam.create([payload], { session });
          newExam = created[0];
        });
      } finally {
        session.endSession();
      }

      return NextResponse.json(newExam, { status: 201 });
    } catch (error: any) {
      const message = error?.message || "Error interno del servidor";

      // Fallback for environments without transaction support.
      if (message.includes("Transaction numbers are only allowed")) {
        let decremented: Array<{ productId: mongoose.Types.ObjectId; quantity: number }> = [];

        try {
          decremented = await decrementStock();
          newExam = await Exam.create(payload);
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