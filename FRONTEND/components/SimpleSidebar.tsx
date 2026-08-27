"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  Menu,
  LogOut,
  Sparkles,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Turnos", icon: ClipboardClock, href: "/dashboard/turnos" },
  { title: "Puestos", icon: BriefcaseBusiness, href: "/dashboard/puestos" },
  { title: "Practicantes", icon: Users, href: "/dashboard/practicantes" },
  { title: "Asistencia", icon: Users, href: "/dashboard/asistencia" },
  { title: "Historial", icon: Calendar, href: "/dashboard/historial" },
  { title: "Graficos", icon: BarChart3, href: "/dashboard/graficos" },
  { title: "Reportes", icon: FileText, href: "/dashboard/reportes" },
  { title: "Configuracion", icon: Settings, href: "/dashboard/configuracion" },
  { title: "Ayuda", icon: HelpCircle, href: "/dashboard/ayuda" },
];

export function SimpleSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir menú"
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors"
      >
        <Menu className="h-5 w-5 text-slate-700" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0 bg-white gap-0">
        <div className="flex flex-col h-full bg-white">
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="text-white font-bold text-sm">OA</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                ONE Attendance
              </h2>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Control de asistencias
              </p>
            </div>
          </div>

          <Separator className="bg-slate-200/80" />

          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    active
                      ? "bg-blue-50 text-blue-600 font-medium shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon
                    className={`h-[18px] w-[18px] ${
                      active ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <span className="flex-1">{item.title}</span>
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-200/80" />

            <Link href="/login" onClick={() => setOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-normal text-red-600 bg-red-50 hover:text-red-700 hover:bg-red-100 transition-all duration-200 rounded-lg mt-2"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Cerrar Sesión
              </Button>
            </Link>
          </nav>

          <div className="p-3 border-t border-slate-200/80">
            <div className="flex items-center gap-2 px-2">
              <Sparkles className="h-3 w-3 text-blue-400" />
              <span className="text-[10px] text-slate-400 font-medium">v2.0.1</span>
              <span className="text-[10px] text-slate-300">•</span>
              <span className="text-[10px] text-slate-400">2026</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
