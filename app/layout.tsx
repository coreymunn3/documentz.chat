import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Documentz.chat - Your Interactive Document Companion",
  description:
    "Transform your PDF documents into interactive conversations. Upload your documents and chat with them using AI to get instant answers, summaries, and insights.",
  keywords: [
    "PDF chat",
    "document AI",
    "interactive documents",
    "PDF assistant",
    "document companion",
    "AI document analysis",
  ],
  authors: [{ name: "Documentz.chat Team" }],
  creator: "Documentz.chat",
  publisher: "Documentz.chat",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://documentz.chat",
    title: "Documentz.chat - Your Interactive Document Companion",
    description:
      "Transform your PDF documents into interactive conversations with AI",
    siteName: "Documentz.chat",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Documentz.chat - Chat with your PDF documents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Documentz.chat - Your Interactive Document Companion",
    description:
      "Transform your PDF documents into interactive conversations with AI",
    images: ["/og-image.svg"],
  },
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
        <head>
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
          <link rel="manifest" href="/site.webmanifest" />
        </head>
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
