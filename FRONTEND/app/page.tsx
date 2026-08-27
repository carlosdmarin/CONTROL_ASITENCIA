import { redirect } from "next/navigation";

export default function Home() {
  // Redirige automáticamente a la página de login
  redirect("/login");
}