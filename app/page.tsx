import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const stages = [
  ["01", "Drop your product", "Upload one clean product image. Voomara reads the visual details instantly."],
  ["02", "Direct the story", "Choose the angle, creator energy, and the benefit your audience should remember."],
  ["03", "Watch it become an ad", "Follow every AI stage live, then review the finished vertical video in your studio."],
];

export default function LandingPage() {
  return (
    <main className="voomara-landing">
      <nav className="al-nav">
        <Link className="al-brand" href="/" aria-label="Voomara home"><span>VO</span><b>Voomara</b></Link>
        <div className="al-nav-links"><a href="#product">Product</a><a href="#how">How it works</a><a href="#results">Results</a></div>
        <div className="al-nav-actions"><ThemeToggle/><Link className="al-login" href="/login">Log in</Link><Link className="al-button small" href="/login">Create an ad <span>↗</span></Link></div>
      </nav>

      <section className="al-hero">
        <div className="al-grid-glow"/>
        <div className="al-copy">
          <div className="al-pill"><i/> The visual AI studio for UGC ads</div>
          <h1>Your product deserves<br/><em>more screen time.</em></h1>
          <p>Turn one product image into a complete creator-style video—and watch the entire AI workflow come alive, node by node.</p>
          <div className="al-actions"><Link className="al-button" href="/login">Create your first ad <span>→</span></Link><a className="al-watch" href="#product"><i>▶</i> See Voomara in action</a></div>
          <div className="al-proof"><div><strong>10×</strong><span>faster creative cycles</span></div><div><strong>6</strong><span>visible AI stages</span></div><div><strong>9:16</strong><span>ready to publish</span></div></div>
        </div>

        <div className="al-engine" aria-label="Voomara AI workflow preview">
          <div className="al-orbit orbit-one"/><div className="al-orbit orbit-two"/>
          <div className="engine-card engine-input"><span className="engine-icon coral">↑</span><div><small>PRODUCT INPUT</small><b>Hero image added</b></div><i>✓</i></div>
          <div className="engine-line line-one"><i/></div>
          <div className="engine-core"><div className="core-halo"/><span>✦</span><small>VOOMARA AI</small><b>Creating your story</b><div className="core-loader"><i/></div></div>
          <div className="engine-line line-two"><i/></div>
          <div className="engine-card engine-output"><span className="engine-icon green">▶</span><div><small>FINAL OUTPUT</small><b>UGC video ready</b></div><i>✓</i></div>
          <div className="engine-float float-script"><span>✦</span><div><small>CREATIVE DIRECTION</small><b>Hook approved</b></div></div>
          <div className="engine-float float-format"><b>9:16</b><small>VERTICAL</small></div>
          <div className="engine-floor"/>
        </div>
      </section>

      <section className="al-marquee" aria-label="Voomara capabilities"><div><span>PRODUCT ANALYSIS</span><i>✦</i><span>CREATIVE DIRECTION</span><i>✦</i><span>AI VIDEO GENERATION</span><i>✦</i><span>VISIBLE WORKFLOWS</span><i>✦</i><span>READY-TO-POST OUTPUT</span></div></section>

      <section className="al-product" id="product">
        <div className="al-section-copy"><span>THE ENTIRE PROCESS, UNHIDDEN</span><h2>Creative intelligence<br/>you can actually see.</h2><p>No black box. No confusing timeline. Voomara turns AI production into a clear visual system, so your team knows exactly what is happening and what comes next.</p></div>
        <div className="al-browser-wrap">
          <div className="al-browser-top"><div><i/><i/><i/></div><span>app.voomara.ai/studio</span><b>● WORKFLOW LIVE</b></div>
          <Image src="/dashboard-preview.png" alt="Voomara visual AI production dashboard" width={1440} height={900}/>
          <div className="al-browser-label"><span>✦</span><div><small>TRANSPARENT BY DESIGN</small><b>Six stages. One finished story.</b></div></div>
        </div>
      </section>

      <section className="al-how" id="how">
        <header><span>FROM STILL TO STORY</span><h2>One image in.<br/>An ad people feel.</h2></header>
        <div className="al-stage-grid">{stages.map(([number,title,copy]) => <article key={number}><span>{number}</span><div className="stage-symbol">{number === "01" ? "↑" : number === "02" ? "✦" : "▶"}</div><h3>{title}</h3><p>{copy}</p><i>Learn more →</i></article>)}</div>
      </section>

      <section className="al-results" id="results"><div className="result-visual"><div className="phone-frame"><div className="phone-content"><span>YOUR PRODUCT</span><i>▶</i><b>Made to stop<br/>the scroll.</b></div></div><div className="result-chip chip-one"><strong>+34%</strong><small>watch time</small></div><div className="result-chip chip-two"><strong>15 sec</strong><small>production ready</small></div></div><div className="result-copy"><span>CREATIVE THAT MOVES</span><h2>From product shot<br/>to main character.</h2><p>Built for growth teams, founders, and creators who need more winning concepts without adding another production headache.</p><ul><li><i>✓</i> Creator-native concepts, not generic templates</li><li><i>✓</i> Visual control over every production stage</li><li><i>✓</i> Finished video delivered inside your workspace</li></ul><Link className="al-button" href="/login">Enter the studio <span>→</span></Link></div></section>

      <section className="al-final"><div className="final-glow"/><span>YOUR NEXT WINNER IS ONE IMAGE AWAY</span><h2>Make something<br/><em>worth watching.</em></h2><p>Bring your product. Voomara will help you turn it into a story.</p><Link className="al-button light" href="/login">Start creating for free <span>↗</span></Link></section>
      <footer className="al-footer"><Link className="al-brand" href="/"><span>VO</span><b>Voomara</b></Link><p>Turn one product image into a complete UGC video.</p><div><a href="#product">Product</a><a href="#how">How it works</a><Link href="/login">Log in</Link></div><small>© 2026 Voomara</small></footer>
    </main>
  );
}
