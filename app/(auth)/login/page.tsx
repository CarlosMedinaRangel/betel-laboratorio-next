// app/(auth)/login/page.tsx
"use client"; // 👈 OBLIGATORIO

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // Si usas next/image

export default function LoginPage() {
  const router = useRouter();
  
  // Estados para el formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Colores (Tu configuración visual)
  const palePurple = "bg-[#FCF9FC]";
  const bgColor = "bg-[#ffffff]";
  const bgColor2 = "bg-[#F7EEF8]";
 
 

  // Función para enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Intentar Login
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // Importante para manejar el error nosotros mismos
    });

    if (res?.error) {
      setError("Credenciales inválidas. Verifica tu correo o contraseña.");
      setLoading(false);
    } else {
      // Login exitoso -> Redirigir al Dashboard
      router.push("/"); // Asegúrate que esta ruta exista (app/(dashboard)/page.tsx)
      router.refresh();
    }
  };

  return (
    <div className={`min-h-screen ${bgColor2} md:grid md:grid-cols-[1fr_6rem] md:grid-rows-[1fr_5rem]`}>
      
      {/* CUADRANTE 1: CONTENIDO PRINCIPAL */}
      <div className="relative flex items-center justify-center p-4 overflow-hidden">
            
            {/* Fondo Decorativo */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
              <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-[#9727aa]/5 blur-[120px]"></div>
              <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-[#C795D0]/10 blur-[100px]"></div>
            </div>

            {/* --- TARJETA DE LOGIN --- */}
            <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 relative z-10">
              
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-3 mb-2 justify-center">
                  <div className="bg-[#9727aa] p-2.5 rounded-xl flex items-center justify-center shadow-lg shadow-[#9727aa]/20">
                    <span className="material-symbols-outlined text-white text-2xl">biotech</span>
                  </div>
                  <div className="text-left">
                    <h1 className="text-2xl font-bold text-[#9727aa] leading-none tracking-tight">Betel</h1>
                    <p className="text-[10px] font-bold text-[#9727aa]/60 uppercase tracking-[0.2em]">Laboratorio Clínico</p>
                  </div>
                </div>
                <p className="text-slate-500 text-sm mt-4">Bienvenido, ingresa tus credenciales.</p>
              </div>

              {/* Mensaje de Error (Si existe) */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium text-center border border-red-100">
                  {error}
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 ml-1 uppercase tracking-wide">Correo Electrónico</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 group-focus-within:text-[#9727aa] transition-colors text-[20px]">mail</span>
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="ejemplo@betel.com"
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#9727aa] focus:ring-4 focus:ring-[#9727aa]/10 transition-all outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 ml-1 uppercase tracking-wide">Contraseña</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-slate-400 group-focus-within:text-[#9727aa] transition-colors text-[20px]">lock</span>
                    </div>
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      placeholder="••••••••"
                      className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#9727aa] focus:ring-4 focus:ring-[#9727aa]/10 transition-all outline-none text-slate-700 placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded text-[#9727aa] border-slate-300 focus:ring-[#9727aa]" />
                    <span className="ml-2 text-slate-500">Recordarme</span>
                  </label>
                  <Link href="#" className="text-[#9727aa] font-medium hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#9727aa] hover:bg-[#852296] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-[#9727aa]/25 active:scale-[0.98] transition-all duration-200 text-sm tracking-wide"
                >
                  {loading ? "INICIANDO..." : "INICIAR SESIÓN"}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                  © 2024 Betel Sistema de Gestión
                </p>
              </div>
            </div>
      </div>

      {/* CUADRANTES DECORATIVOS (DERECHA Y ABAJO) */}
      <div className={`hidden md:block ${palePurple}`}></div>
      <div className={`hidden md:block ${palePurple}`}></div>
      <div className={`hidden md:block ${bgColor}`}></div>

    </div>
  );
}