import type { Metadata } from "next";

import "./globals.css";
import { GeistMono } from 'geist/font/mono';
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { client } from "@/lib/thirdwebClient";

export const metadata: Metadata = {
  title: "thirdweb SDK + Next starter",
  description:
    "Starter template for using thirdweb SDK with Next.js App router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistMono.variable}>
      <body>
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}
