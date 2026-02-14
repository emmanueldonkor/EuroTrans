import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-3">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground">The page you are looking for does not exist or has been moved.</p>
        </div>
        <Link href="/">
          <Button className="w-full">Return Home</Button>
        </Link>
      </Card>
    </div>
  )
}
