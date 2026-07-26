"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";

const steps = [
  { title: "Product input", detail: "Prepare your hero image", icon: "01" },
  { title: "Visual analysis", detail: "Read packaging and details", icon: "02" },
  { title: "Creative direction", detail: "Build the UGC concept", icon: "03" },
  { title: "AI video studio", detail: "Generate a vertical ad", icon: "04" },
  { title: "Render output", detail: "Finalise motion and audio", icon: "05" },
  { title: "Ready to review", detail: "Deliver the finished video", icon: "06" },
];

const sampleVideo = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();
  const [fileName, setFileName] = useState("");
  const [prompt, setPrompt] = useState("A creator discovers this product, demonstrates its most useful benefit, and gives an honest, energetic recommendation.");
  const [audio, setAudio] = useState(true);
  const [active, setActive] = useState(-1);
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function acceptFile(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setComplete(false);
    setActive(-1);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  function removeImage() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(undefined);
    setFileName("");
    setComplete(false);
    setActive(-1);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function runWorkflow(demo = false) {
    if (!preview && !demo) {
      inputRef.current?.click();
      return;
    }
    if (running) return;
    setRunning(true);
    setComplete(false);
    for (let index = 0; index < steps.length; index += 1) {
      setActive(index);
      await new Promise((resolve) => window.setTimeout(resolve, index === 3 ? 1300 : 720));
    }
    setComplete(true);
    setRunning(false);
  }

  const finishedCount = complete ? steps.length : Math.max(active, 0);
  const progress = complete ? 100 : active < 0 ? 0 : Math.round(((active + .35) / steps.length) * 100);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">UG</span><span>UGC Flow</span></div>
        <nav aria-label="Primary navigation">
          <a className="nav-item active" href="#studio"><span>✦</span> Create</a>
          <a className="nav-item" href="#workflow"><span>⌘</span> Workflows</a>
          <a className="nav-item" href="#output"><span>▶</span> My videos</a>
          <a className="nav-item" href="#history"><span>↻</span> Run history</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="credit-card"><span className="eyebrow">Studio credits</span><strong>2,450</strong><small>Ready for 16 productions</small><button>Manage plan</button></div>
          <div className="profile"><span className="avatar">HV</span><span><strong>My workspace</strong><small>Creator plan</small></span><b>•••</b></div>
        </div>
      </aside>

      <main className="main" id="studio">
        <header className="topbar">
          <div><p className="breadcrumb">CREATE / NEW PRODUCTION</p><h1>Product-to-UGC studio</h1></div>
          <div className="top-actions"><span className={`status-pill ${running ? "live" : ""}`}>{running ? "● Workflow running" : complete ? "✓ Complete" : "Ready to create"}</span><button className="run-button" onClick={() => runWorkflow(false)} disabled={running}><span>{running ? "↻" : "▶"}</span>{running ? "Running…" : "Run workflow"}</button></div>
        </header>

        <section className="workspace">
          <div className="production-column">
            <div className="input-grid">
              <article className="panel upload-panel">
                <div className="panel-heading"><div><p className="eyebrow">01 · PRODUCT</p><h2>Drop your hero image</h2></div><span className="panel-icon">▧</span></div>
                <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} hidden />
                <div className={`dropzone ${dragging ? "dragging" : ""} ${preview ? "has-image" : ""}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
                  {preview ? <><img src={preview} alt="Selected product" /><div className="file-chip"><span>✓ {fileName}</span><button onClick={() => inputRef.current?.click()}>Replace</button><button aria-label="Remove image" onClick={removeImage}>×</button></div></> : <button className="upload-trigger" onClick={() => inputRef.current?.click()}><span className="upload-icon">↑</span><strong>Choose or drop product image</strong><small>JPG, PNG or WebP · up to 12 MB</small></button>}
                </div>
              </article>

              <article className="panel direction-panel">
                <div className="panel-heading"><div><p className="eyebrow">02 · DIRECTION</p><h2>Tell the creator what matters</h2></div><button className="soft-button" onClick={() => setPrompt("Open with a scroll-stopping product reveal, demonstrate the clearest everyday benefit, then close with a warm and credible recommendation.")}>✦ Improve prompt</button></div>
                <textarea aria-label="Creative direction" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                <div className="direction-footer"><button className="preview-button" onClick={() => runWorkflow(true)} disabled={running}>Preview without credits</button><span>9:16 · 15 SEC</span><label className="toggle-row"><input type="checkbox" checked={audio} onChange={(e) => setAudio(e.target.checked)} /><span className="toggle"/><b>Audio {audio ? "on" : "off"}</b></label></div>
              </article>
            </div>

            <article className="canvas" id="workflow">
              <div className="canvas-head"><div><p>LIVE PRODUCTION MAP</p><h2>Every node reflects real execution</h2></div><span>{running ? "Running" : complete ? "Completed" : "Ready"}</span></div>
              <div className="canvas-grid" aria-label="Visual workflow">
                {steps.map((step, index) => {
                  const state = complete || index < active ? "done" : index === active ? "running" : "pending";
                  return <div className="node-wrap" key={step.title}>
                    <div className={`flow-node ${state}`}>
                      <div className="node-top"><span className="node-number">{state === "done" ? "✓" : step.icon}</span><span className="node-state">{state}</span></div>
                      <strong>{step.title}</strong><small>{step.detail}</small>
                      <div className="node-progress"><i /></div>
                    </div>
                    {index < steps.length - 1 && <div className={`connector ${index < finishedCount ? "done" : index === active ? "running" : ""}`}><i /></div>}
                  </div>;
                })}
              </div>
              <div className="canvas-controls"><button aria-label="Zoom in">+</button><button aria-label="Zoom out">−</button><button aria-label="Fit workflow">⌗</button></div>
            </article>
          </div>

          <aside className="output-column">
            <article className="panel progress-panel"><p className="eyebrow">PRODUCTION STATUS</p><div className="progress-title"><strong>{progress}%</strong><span>{running ? "In progress" : complete ? "Completed" : "Not started"}</span></div><div className="big-progress"><i style={{ width: `${progress}%` }} /></div><div className="current-step"><span className={running ? "pulse" : "dot"}/><div><strong>{active < 0 ? "Ready for your product" : complete ? "Video ready to review" : steps[active].title}</strong><small>{active < 0 ? "Add an image and start the workflow" : complete ? "Your production finished successfully" : steps[active].detail}</small></div></div></article>
            <article className="panel video-panel" id="output"><div className="panel-heading"><div><p className="eyebrow">FINAL OUTPUT</p><h2>Your generated video</h2></div><span>⛶</span></div><div className="video-frame">{complete ? <video src={sampleVideo} controls playsInline /> : <div className="video-empty"><span>▶</span><strong>Your video will land here</strong><p>Upload a product and run the workflow. Watch every production stage update live.</p></div>}</div>{complete && <div className="video-actions"><button onClick={() => document.querySelector("video")?.play()}>▶ Play</button><a href={sampleVideo} target="_blank" rel="noreferrer">↓ Download</a></div>}</article>
          </aside>
        </section>
      </main>
    </div>
  );
}
