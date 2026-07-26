import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UGC Flow — Product-to-Video Studio",
  description: "Turn one product image into a visible AI UGC video workflow.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
