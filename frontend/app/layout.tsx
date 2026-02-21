import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-100">
        <div className="flex h-screen">

          {/* SIDEBAR */}
          <aside className="w-64 bg-blue-900 text-white flex flex-col">
            
            <div className="p-6 border-b border-blue-800">
              <h1 className="text-xl font-bold">OdontoISITec</h1>
            </div>

            <nav className="flex-1 p-4 space-y-3">
              <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-blue-800">
                Dashboard
              </Link>

              <Link href="/pacientes" className="block px-4 py-2 rounded hover:bg-blue-800">
                Pacientes
              </Link>

              <Link href="/odontologos" className="block px-4 py-2 rounded hover:bg-blue-800">
                Odontólogos
              </Link>

              <Link href="/agenda" className="block px-4 py-2 rounded hover:bg-blue-800">
                Agenda
              </Link>
            </nav>

            <div className="p-4 border-t border-blue-800 text-sm">
              Sistema Odontológico v1
            </div>

          </aside>

          {/* CONTENIDO */}
          <div className="flex-1 flex flex-col">

            {/* HEADER SUPERIOR */}
            <header className="bg-white shadow px-8 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700">
                Panel de Administración
              </h2>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Dr. Pérez
                </div>
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
            </header>

            {/* MAIN */}
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>

          </div>
        </div>
      </body>
    </html>
  );
}

