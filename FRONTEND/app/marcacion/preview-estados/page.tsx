// TEMPORAL - borrar después de la Fase 2B
import { notFound } from "next/navigation";
import PreviewClient from "./PreviewClient";

export default function PreviewEstadosPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return <PreviewClient />;
}
