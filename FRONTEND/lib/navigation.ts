"use client";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  FileText,
  Settings,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

export const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { title: "Practicantes", icon: Users, href: "/dashboard/practicantes" },
  { title: "Vigilantes", icon: ShieldCheck, href: "/dashboard/vigilantes" },
  { title: "Asistencia", icon: Users, href: "/dashboard/asistencia" },
  { title: "Reportes", icon: FileText, href: "/dashboard/reportes" },
  { title: "Configuracion", icon: Settings, href: "/dashboard/configuracion" },
  { title: "Ayuda", icon: HelpCircle, href: "/dashboard/ayuda" },
] as const;
