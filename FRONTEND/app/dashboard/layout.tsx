"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SimpleSidebar } from "@/components/SimpleSidebar";
import { Toaster } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  ClipboardClock,
  BriefcaseBusiness,
  LogOut,
  Sparkles,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Areas", icon: BriefcaseBusiness, href: "/dashboard/areas" },
  { title: "Practicantes", icon: Users, href: "/dashboard/practicantes" },
  { title: "Asistencia", icon: Users, href: "/dashboard/asistencia" },
  { title: "Historial", icon: Calendar, href: "/dashboard/historial" },
  { title: "Graficos", icon: BarChart3, href: "/dashboard/graficos" },
  { title: "Reportes", icon: FileText, href: "/dashboard/reportes" },
  { title: "Configuracion", icon: Settings, href: "/dashboard/configuracion" },
  { title: "Ayuda", icon: HelpCircle, href: "/dashboard/ayuda" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <div className="flex h-[100dvh] overflow-hidden bg-slate-50/80 flex-col md:flex-row">
        {/* Header móvil - fijo arriba solo en cel */}
        <header className="md:hidden shrink-0 sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xs">OA</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">PRACITCANTE</h2>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Control de asistencias</p>
            </div>
          </div>
          <SimpleSidebar />
        </header>

        {/* ====== SIDEBAR DESKTOP - FIJO, SOLO SCROLLEA SU NAV ====== */}
        <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-[100dvh] border-r border-slate-200/80 bg-white/90 backdrop-blur-sm overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden">
            {/* LOGO - fijo */}
            <div className="shrink-0 p-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  <span className="text-white font-bold text-sm">OA</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 tracking-tight">
                   PRACTICANTE
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                    Control de asistencias
                  </p>
                </div>
              </div>
              <Separator className="mt-4 bg-slate-200/80" />
            </div>

            {/* MENÚ - único con scroll */}
            <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-0.5 scrollbar-thin">
              {menuItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                      active
                        ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                  >
                    <item.icon
                      className={`h-[18px] w-[18px] transition-colors ${
                        active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className="flex-1">{item.title}</span>
                  </Link>
                );
              })}

              <div className="pt-6 mt-4 border-t border-slate-200/80" />

              <Link href="/login">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-normal text-red-600 bg-red-50 hover:text-red-700 hover:bg-red-100 transition-all duration-200 rounded-lg"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  Cerrar Sesión
                </Button>
              </Link>
            </nav>

            {/* FOOTER - fijo abajo */}
            <div className="shrink-0 p-4 border-t border-slate-200/80">
              <div className="flex items-center gap-2 px-2">
                <Sparkles className="h-3 w-3 text-blue-400" />
                <span className="text-[10px] text-slate-400 font-medium">v2.0.1</span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-slate-400">2026</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ====== CONTENIDO PRINCIPAL - ÚNICO CON SCROLL ====== */}
        <main className="flex-1 h-[100dvh] md:h-[100dvh] overflow-y-auto overflow-x-hidden bg-slate-50/80">
          <div className="p-4 md:p-6 min-h-full">
            {children}
          </div>
        </main>
      </div>

      <Toaster position="top-center" richColors />
    </>
  );
}
