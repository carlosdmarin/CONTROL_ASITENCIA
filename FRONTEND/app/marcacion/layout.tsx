"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";

export default function MarcacionLayout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["VIGILANTE"]}>{children}</RoleGuard>;
}
