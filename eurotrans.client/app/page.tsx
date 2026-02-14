import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPageClient from "@/components/landing-page"; // Ensure this component exists

export default async function Page() {
  // 1. Auth0 Logic
  const user = await getSessionUser();

  if (user) {
    if (user.role === 'driver') {
      redirect("/driver");
    } else {
      // Default for Manager or others
      redirect("/dashboard");
    }
  }

  // 3. Not authenticated -> Render Landing Page
  return <LandingPageClient />;
}
