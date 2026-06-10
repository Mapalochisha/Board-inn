import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('theme');
                if (!theme) {
                  const match = document.cookie.match(/theme=([^;]+)/);
                  if (match) theme = match[1];
                }
                
                let supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                if (!theme || theme === 'system') {
                  if (supportDarkMode) document.documentElement.classList.add('dark');
                } else if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
