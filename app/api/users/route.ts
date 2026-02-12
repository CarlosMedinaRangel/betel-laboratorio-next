// api/users/route.ts
import connectionToDatabase from "../../../lib/mongoose";
import User from "../../../models/users";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";

// Definimos una interfaz para el cuerpo de la petición
interface UserRequestBody {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export async function POST(request: NextRequest) {
    try {
        await connectionToDatabase();

        // Tipamos la desestructuración del JSON
        const { name, email, password, role }: UserRequestBody = await request.json();

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "El usuario ya existe" }, 
                { status: 400 }
            );
        }

        // ENCRIPTAR CONTRASEÑA 🔐
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "user",
        });

        await newUser.save();
        
        return NextResponse.json(
            { message: "Usuario creado exitosamente" }, 
            { status: 201 }
        );

    } catch (error: unknown) {
        // En TS, el error es 'unknown' por seguridad
        console.error(error);
        return NextResponse.json(
            { message: "Error al crear usuario" }, 
            { status: 500 }
        );
    }
}