import { redirect } from "next/navigation";

// /cerez eski yol — yeni resmi yol /cerezler
export default function CerezRedirect() {
  redirect("/cerezler");
}
