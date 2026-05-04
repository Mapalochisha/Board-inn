import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Link href="/" className="mb-8">
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-500 tracking-tight">
          Board-inn
        </h1>
      </Link>
      <Card className="w-full max-w-md p-6 shadow-lg border-muted">
        {children}
      </Card>
    </div>
  );
}
