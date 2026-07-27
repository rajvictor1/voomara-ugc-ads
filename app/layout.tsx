import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voomara — Turn Products Into UGC Videos",
  description: "Turn one product image into a complete UGC video and watch every AI production stage happen live.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`try{document.documentElement.dataset.theme=localStorage.getItem('voomara-theme')||localStorage.getItem('adloom-theme')||((matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light')}catch(e){}`}}/></head><body>{children}</body></html>;
}
