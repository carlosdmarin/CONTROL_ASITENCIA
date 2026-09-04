"use client";

import Historial from "../components/historial";
import { useRouter } from "next/navigation";

export default function HistorialPage() {
  const router = useRouter();

  return (
    <Historial onBack={() => router.push("/marcacion")} />
  );
}

