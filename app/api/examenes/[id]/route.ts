// src/app/api/exams/[id]/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import Exam from "@/models/exam";

// GET: Obtener un examen por id
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Id de examen requerido" }, { status: 400 });
    }

    const exam = mongoose.isValidObjectId(id)
      ? await Exam.findById(id)
      : await Exam.findOne({ code: id.toUpperCase() });

    if (!exam) {
      return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Actualizar un examen existente
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Id de examen requerido" }, { status: 400 });
    }
    const body = await request.json();

    const updatedExam = mongoose.isValidObjectId(id)
      ? await Exam.findByIdAndUpdate(
          id,
          { ...body },
          { new: true }
        )
      : await Exam.findOneAndUpdate(
          { code: id.toUpperCase() },
          { ...body },
          { new: true }
        );

    if (!updatedExam) {
      return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 });
    }

    return NextResponse.json(updatedExam);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: (Opcional) Por si quieres borrar exámenes también
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Id de examen requerido" }, { status: 400 });
    }

    if (mongoose.isValidObjectId(id)) {
      await Exam.findByIdAndDelete(id);
    } else {
      await Exam.findOneAndDelete({ code: id.toUpperCase() });
    }
    return NextResponse.json({ message: "Examen eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}