"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";

export default function PracticanteLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["PRACTICANTE"]}>{children}</RoleGuard>;
}
