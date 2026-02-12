"use client";
import { useEffect, useState } from "react";

type Product = {
  _id: string;
  serial: string; // ✅ Campo nuevo
  name: string;
  unit: number;
  stock: number;
  price: number;
  minStock: number;
  category: string;
};

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/product");
      const data = await res.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const getStatusColor = (stock: number, minStock: number) => {
    if (stock === 0) return "bg-red-100 text-red-700 border-red-200";
    if (stock <= minStock) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-green-100 text-green-700 border-green-200";
  };

  const getStatusText = (stock: number, minStock: number) => {
    if (stock === 0) return "Agotado";
    if (stock <= minStock) return "Bajo Stock";
    return "En Stock";
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Cargando inventario...</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-primary/10">
              {/* --- NUEVA COLUMNA DE SERIAL --- */}
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Serial</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Unidad</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-primary/5">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  No hay productos registrados aún.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="hover:bg-primary/5 transition-colors group">
                  
                  {/* --- DATOS DEL SERIAL --- */}
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      #{product.serial}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[18px]">science</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.category}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-600">{product.unit}</td>

                  <td className={`px-6 py-4 text-sm font-medium ${product.stock === 0 ? "text-slate-400" : "text-slate-900"}`}>
                    {product.stock}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(product.stock, product.minStock)}`}>
                      {getStatusText(product.stock, product.minStock)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}