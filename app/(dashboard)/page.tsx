"use client"; // IMPORTANTE: Esto convierte el componente a Cliente

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Protección: Si no está logueado, lo manda al login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-8 text-slate-500">Cargando dashboard...</div>;
  }

  return (
    <>
      
      

      <div className="p-8 space-y-8">
       

         <h2 className="text-2xl font-bold text-slate-800">Vista General</h2>
        
      </div>
    </>
  );
}