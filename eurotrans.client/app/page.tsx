import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function Page() {
  const user = await getSessionUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (user.role === "driver") {
    redirect("/driver")
  }

  if (user.role === "manager") {
    redirect("/dashboard")
  }

  redirect("/access-denied")
}
