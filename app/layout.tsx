import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Framique — AI photo studio in one upload",
    template: "%s · Framique",
  },
  description:
    "23 AI tools on a single engine. Headshots, retouching, restored photos, product shots, interiors, voiceovers — pick a tool, drop in a picture and watch the result develop.",
  openGraph: {
    siteName: "Framique",
    type: "website",
    images: ["/covers/preset-golden-hour.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "#a855f7",
          colorBackground: "#0b0b12",
          colorInput: "rgba(255,255,255,0.05)",
          borderRadius: "0.75rem",
        },
      }}
      signInUrl="/login"
      signUpUrl="/signup"
    >
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} page-glow min-h-screen font-sans`}
        >
          {children}
          <Toaster theme="dark" position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
