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
    const {serial, name, unit, stock, price, minStock, category } = body;

    const existingProduct = await Product.findOne({ serial });
    if (existingProduct) {
      return NextResponse.json( 
        { error: "El producto con este serial ya existe" },
        { status: 400 }
      );
    }
    const existingName = await Product.findOne({ name });
    if (existingName) {
      return NextResponse.json( 
        { error: "El producto con este nombre ya existe" },
        { status: 400 }
      );
    }
     



    if (!serial || !name || !unit || !price || !minStock || !category) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }


    const newProduct = await Product.create({
      serial,
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