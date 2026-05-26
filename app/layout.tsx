import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "Board-inn — Student Housing Platform",
    template: "%s | Board-inn"
  },
  description: "Secure and affordable boarding houses and bed spaces for students in Zambia. Book viewings and find your next home with ease.",
  keywords: ["student housing", "boarding house", "Zambia", "Lusaka", "Copperbelt", "university accommodation"],
  authors: [{ name: "Board-inn Team" }],
  creator: "Board-inn",
  publisher: "Board-inn",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
