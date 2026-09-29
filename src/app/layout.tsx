import type { Metadata, Viewport } from "next";
import { Fredoka, Kaushan_Script, Poppins } from "next/font/google";
import { CartProvider } from "@/components/cart";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const kaushan = Kaushan_Script({
  variable: "--font-kaushan",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: "Kelly's Eatery | Good life is Good food!",
  description:
    "Order jollof, fried rice, soups and swallow from Kelly's Eatery, delivered to you.",
  openGraph: {
    title: "Kelly's Eatery",
    description: "Good life is Good food! Order online for delivery.",
    images: ["/brand/flyer.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#1d5128",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${fredoka.variable} ${kaushan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
