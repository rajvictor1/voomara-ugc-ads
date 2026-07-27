"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [loading,setLoading] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true);
    window.setTimeout(() => router.push("/dashboard"), 450);
  }
  return <main className="login-page">
    <Link className="lp-brand login-brand" href="/"><span>VO</span>Voomara</Link><div className="login-theme"><ThemeToggle/></div>
    <section className="login-card">
      <div className="login-art"><div className="login-art-copy"><span>✦ VOOMARA VISUAL AI</span><h1>Ideas move faster when you can see them work.</h1><p>Upload a product, shape the story, and watch your UGC video come together—node by node.</p></div><div className="mini-flow"><i>01</i><b/><i>02</i><b/><i>03</i><b/><i>✓</i></div></div>
      <div className="login-form-wrap"><Link href="/" className="back-link">← Back home</Link><p className="eyebrow">WELCOME BACK</p><h2>Enter your studio</h2><p className="login-sub">Continue creating product videos that feel native, clear, and ready to publish.</p><form onSubmit={submit}><label>Email address<input required type="email" placeholder="you@brand.com" defaultValue="creator@voomara.ai"/></label><label>Password<input required type="password" placeholder="••••••••" defaultValue="voomara"/></label><div className="form-meta"><label><input type="checkbox" defaultChecked/> Remember me</label><button type="button">Forgot password?</button></div><button className="login-submit" disabled={loading}>{loading ? "Opening studio…" : "Continue to dashboard →"}</button></form><div className="demo-note"><span>i</span><p><b>Preview access</b><small>This lightweight login opens the demo studio. Secure account authentication comes with the production backend.</small></p></div></div>
    </section>
  </main>;
}
