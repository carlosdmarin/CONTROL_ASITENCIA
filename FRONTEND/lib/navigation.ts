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
  { title: "Asistencia", icon: Users, href: "/dashboard/asistencia" },
  { title: "Reportes", icon: FileText, href: "/dashboard/reportes" },
  { title: "Vigilantes", icon: ShieldCheck, href: "/dashboard/vigilantes" },
] as const;
