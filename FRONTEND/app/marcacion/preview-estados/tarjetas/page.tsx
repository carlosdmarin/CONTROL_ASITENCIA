// TEMPORAL - borrar después de la Fase 2B
import { notFound } from "next/navigation";
import PreviewTarjetasClient from "./PreviewTarjetasClient";

export default function Page() {
  if (process.env.NODE_ENV === "production") notFound();
  return <PreviewTarjetasClient />;
}
