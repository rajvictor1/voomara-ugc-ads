import Image from "next/image";
import Link from "next/link";

const features = [
  ["01", "Drop your product", "Upload one clean product image. No production brief or complicated setup required."],
  ["02", "Watch AI create", "Follow every idea, generation, and render stage on a transparent visual canvas."],
  ["03", "Review your video", "Play, review, and download the finished vertical video without leaving your workspace."],
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="lp-nav">
        <Link className="lp-brand" href="/"><span>UG</span>UGC Flow</Link>
        <div className="lp-links"><a href="#how">How it works</a><a href="#product">Product</a></div>
        <div className="lp-actions"><Link className="lp-login" href="/login">Log in</Link><Link className="lp-nav-cta" href="/login">Start creating <b>↗</b></Link></div>
      </nav>

      <section className="lp-hero">
        <div className="hero-orb hero-orb-one"/><div className="hero-orb hero-orb-two"/>
        <div className="hero-copy">
          <div className="hero-kicker"><i/> AI video creation, made visible</div>
          <h1>One product image.<br/><em>A complete UGC video.</em></h1>
          <p>Turn a simple product shot into scroll-stopping creator content—and watch every AI production step happen live.</p>
          <div className="hero-actions"><Link className="hero-primary" href="/login">Create your first video <span>→</span></Link><a className="hero-secondary" href="#product"><span>▶</span> See how it works</a></div>
          <div className="hero-proof"><div className="proof-faces"><i>MK</i><i>SC</i><i>AL</i><i>+</i></div><div><b>Built for modern creators</b><small>No editing timeline. No production maze.</small></div></div>
        </div>

        <div className="hero-product" id="product">
          <div className="preview-glow"/>
          <div className="preview-window">
            <div className="preview-bar"><span className="mini-brand">UG</span><div><i/><i/><i/></div><small>ugcflow.studio/dashboard</small><b>● Live</b></div>
            <Image src="/dashboard-preview.png" alt="UGC Flow visual production dashboard" width={1440} height={900} priority />
          </div>
          <div className="floating-card floating-one"><span>✓</span><div><b>Video ready</b><small>6 stages completed</small></div></div>
          <div className="floating-card floating-two"><span>▶</span><div><b>9:16 vertical</b><small>Ready to publish</small></div></div>
        </div>
      </section>

      <section className="trust-strip"><span>FROM PRODUCT SHOT</span><i>→</i><span>TO CREATIVE DIRECTION</span><i>→</i><span>TO READY-TO-POST VIDEO</span></section>

      <section className="how-section" id="how">
        <div className="section-intro"><p>THE SIMPLEST PATH TO UGC</p><h2>Production you can<br/>actually see.</h2><span>UGC Flow turns a hidden generation process into a clear, confidence-building creative workflow.</span></div>
        <div className="feature-grid">{features.map(([number,title,description]) => <article key={number}><span>{number}</span><div className="feature-icon">{number === "01" ? "↑" : number === "02" ? "✦" : "▶"}</div><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className="lp-cta"><div><p>YOUR NEXT AD STARTS HERE</p><h2>Make the product<br/>the main character.</h2></div><Link href="/login">Enter the studio <span>→</span></Link></section>
      <footer><Link className="lp-brand" href="/"><span>UG</span>UGC Flow</Link><p>Visible AI production for creator-led brands.</p><small>© 2026 UGC Flow</small></footer>
    </main>
  );
}
