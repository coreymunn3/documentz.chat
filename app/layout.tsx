import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.className} min-h-screen h-screen overflow-hidden flex flex-col`}
        >
          <ThemeProvider
            attribute={"class"}
            defaultTheme="light"
            enableSystem={false}
          >
            {children}
          </ThemeProvider>
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: {
                padding: "1rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
