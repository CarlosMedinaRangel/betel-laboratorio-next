// src/app/api/exams/[id]/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Exam from "@/models/exam";

// GET: Load a single exam by code.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    // Normalize code to match stored format.
    const code = id?.toUpperCase().trim();
    if (!code) {
      return NextResponse.json({ error: "Codigo de examen requerido" }, { status: 400 });
    }

    const exam = await Exam.findOne({ code });

    if (!exam) {
      return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update exam metadata and results.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const code = id?.toUpperCase().trim();
    if (!code) {
      return NextResponse.json({ error: "Codigo de examen requerido" }, { status: 400 });
    }
    const body = await request.json();

    const updatedExam = await Exam.findOneAndUpdate(
      { code },
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

// DELETE: Remove an exam by code.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const code = id?.toUpperCase().trim();
    if (!code) {
      return NextResponse.json({ error: "Codigo de examen requerido" }, { status: 400 });
    }

    await Exam.findOneAndDelete({ code });
    return NextResponse.json({ message: "Examen eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}