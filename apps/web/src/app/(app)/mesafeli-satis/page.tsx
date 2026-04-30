import { redirect } from "next/navigation";

// /mesafeli-satis eski yol — yeni resmi yol /sozlesme
export default function MesafeliSatisRedirect() {
  redirect("/sozlesme");
}
