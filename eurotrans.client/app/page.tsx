import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function Page() {
  const user = await getSessionUser()

  if (user?.role === "driver") {
    redirect("/driver")
  }

  if (user) {
    redirect("/dashboard")
  }

  redirect("/auth/login")
}
