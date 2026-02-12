import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Product from "@/models/product";



export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Error al cargar" }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    await connectDB();
    

    const body = await request.json();
    const { name, unit, stock, price, minStock, category } = body;


    if (!name || !unit || !price || !minStock || !category) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }


    const newProduct = await Product.create({
      name,
      unit: Number(unit),
      stock: Number(stock),       
      price: Number(price),       
      minStock: Number(minStock), 
      category,
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error("Error creando producto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}