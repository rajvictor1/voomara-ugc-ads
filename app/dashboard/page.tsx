"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProductionMap } from "@/components/workflow/production-map";
import { createSteps } from "@/lib/workflow/definition";
import type { HiggsfieldAccount, WorkflowRun, WorkflowStep } from "@/types/workflow";
import Image from "next/image";

const sampleVideo = "/demo-ugc.mp4";
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const [fileName, setFileName] = useState("");
  const [prompt, setPrompt] = useState("A creator discovers this product, demonstrates its most useful benefit, and gives an honest, energetic recommendation.");
  const [audio, setAudio] = useState(true);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(createSteps());
  const [running, setRunning] = useState(false);
  const [complete, setComplete] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string>();
  const [demoOutput, setDemoOutput] = useState(false);
  const [error, setError] = useState("");
  const [improving, setImproving] = useState(false);
  const [runtimeMode, setRuntimeMode] = useState<"remote-api" | "local-cli" | "public-demo">("public-demo");
  const [account, setAccount] = useState<HiggsfieldAccount>({ connected: false, message: "Checking Higgsfield…" });
  const [navSection, setNavSection] = useState("studio");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useEffect(() => {
    fetch("/api/runtime", { cache: "no-store" }).then((response) => response.json()).then((data) => setRuntimeMode(data.mode)).catch(() => undefined);
    fetch("/api/higgsfield/account", { cache: "no-store" }).then(async (response) => ({ response, body: await response.json() })).then(({ body }) => setAccount(body)).catch(() => setAccount({ connected: false, message: "Higgsfield status unavailable" }));
  }, []);

  function acceptFile(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setComplete(false);
    setVideoError(false);
    setWorkflowSteps(createSteps());
    setOutputUrl(undefined);
    setDemoOutput(false);
    setError("");
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
    setFile(undefined);
    setFileName("");
    setComplete(false);
    setWorkflowSteps(createSteps());
    setOutputUrl(undefined);
    setDemoOutput(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function runWorkflow(previewOnly = false) {
    if (!file && !previewOnly) {
      inputRef.current?.click();
      return;
    }
    if (running) return;
    setRunning(true);
    setComplete(false);
    setVideoError(false);
    setOutputUrl(undefined);
    setDemoOutput(false);
    setError("");

    if (runtimeMode === "public-demo" && !previewOnly) {
      setError("Live Higgsfield generation is not connected on this deployment. Use Preview without credits for the sample experience, or connect Higgsfield production credentials to generate from this product image.");
      setRunning(false);
      return;
    }

    if (previewOnly) {
      const next = createSteps();
      for (let index = 0; index < next.length; index += 1) {
        next[index] = { ...next[index], status: "running", progress: 35, message: index === 3 ? "Safe Higgsfield preview — no credits charged" : next[index].description };
        setWorkflowSteps([...next]);
        await wait(index === 3 ? 1300 : 620);
        next[index] = { ...next[index], status: "completed", progress: 100 };
        setWorkflowSteps([...next]);
      }
      setOutputUrl(sampleVideo);
      setDemoOutput(true);
      setComplete(true);
      setRunning(false);
      return;
    }

    try {
      const form = new FormData();
      if (file) form.set("image", file);
      form.set("prompt", prompt);
      form.set("generateAudio", String(audio));
      const response = await fetch("/api/workflows", { method: "POST", body: form });
      const created = await response.json();
      if (!response.ok) throw new Error(created.error || "Could not start workflow");
      setWorkflowSteps(created.steps);
      if (created.status === "completed") {
        setOutputUrl(created.outputUrl);
        setComplete(true);
        return;
      }
      while (true) {
        await wait(900);
        const poll = await fetch(`/api/workflows/${created.id}`, { cache: "no-store" });
        const run = await poll.json() as WorkflowRun;
        if (!poll.ok) throw new Error("Could not read workflow status");
        setWorkflowSteps(run.steps);
        if (run.status === "completed") { setOutputUrl(run.outputUrl); setComplete(true); break; }
        if (run.status === "failed") throw new Error(run.error || "Higgsfield generation failed");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Workflow failed");
    } finally {
      setRunning(false);
    }
  }

  async function improvePrompt() {
    setImproving(true); setError("");
    try {
      const response = await fetch("/api/prompt/improve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setPrompt(body.prompt);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Prompt improvement failed"); }
    finally { setImproving(false); }
  }

  function navigateTo(section: string) {
    setNavSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const active = workflowSteps.findIndex((step) => step.status === "running" || step.status === "failed");
  const completedCount = workflowSteps.filter((step) => step.status === "completed").length;
  const progress = Math.round(workflowSteps.reduce((total, step) => total + step.progress, 0) / workflowSteps.length);
  const currentStep = active >= 0 ? workflowSteps[active] : complete ? workflowSteps.at(-1) : undefined;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">VO</span><span>Voomara</span></div>
        <nav aria-label="Primary navigation">
          <a className={`nav-item ${navSection === "studio" ? "active" : ""}`} href="#studio" onClick={(event) => { event.preventDefault(); navigateTo("studio"); }} aria-current={navSection === "studio" ? "page" : undefined}><span>✦</span> Create</a>
          <a className={`nav-item ${navSection === "workflow" ? "active" : ""}`} href="#workflow" onClick={(event) => { event.preventDefault(); navigateTo("workflow"); }} aria-current={navSection === "workflow" ? "page" : undefined}><span>⌘</span> Workflows</a>
          <a className={`nav-item ${navSection === "output" ? "active" : ""}`} href="#output" onClick={(event) => { event.preventDefault(); navigateTo("output"); }} aria-current={navSection === "output" ? "page" : undefined}><span>▶</span> My videos</a>
          <a className={`nav-item ${navSection === "history" ? "active" : ""}`} href="#history" onClick={(event) => { event.preventDefault(); navigateTo("history"); }} aria-current={navSection === "history" ? "page" : undefined}><span>↻</span> Run history</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="credit-card"><span className="eyebrow">Higgsfield account</span><strong>{account.connected ? account.credits ?? "API" : runtimeMode === "public-demo" ? "DEMO" : "OFF"}</strong><small>{account.connected ? account.message || `${account.plan || "Plan"} · live sync` : account.message}</small><button onClick={() => window.open("https://cloud.higgsfield.ai", "_blank")}>{account.connected ? "Open Higgsfield" : "Connect Higgsfield"}</button></div>
          <div className="profile"><span className="avatar">HV</span><span><strong>My workspace</strong><small>Creator plan</small></span><b>•••</b></div>
        </div>
      </aside>

      <main className="main" id="studio">
        <header className="topbar">
          <div><p className="breadcrumb">CREATE / NEW PRODUCTION</p><h1>Product-to-UGC studio</h1></div>
          <div className="top-actions"><ThemeToggle/><span className={`status-pill ${running ? "live" : ""}`}>{running ? "● Workflow running" : complete ? "✓ Complete" : "Ready to create"}</span><button className="run-button" onClick={() => runWorkflow(false)} disabled={running}><span>{running ? "↻" : "▶"}</span>{running ? "Generating…" : runtimeMode === "public-demo" ? "Connect & generate" : "Run workflow"}</button></div>
        </header>

        <section className="workspace">
          <div className="production-column">
            <div className="input-grid">
              <article className="panel upload-panel">
                <div className="panel-heading"><div><p className="eyebrow">01 · PRODUCT</p><h2>Drop your hero image</h2></div><span className="panel-icon">▧</span></div>
                <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} hidden />
                <div className={`dropzone ${dragging ? "dragging" : ""} ${preview ? "has-image" : ""}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
                  {preview ? <><Image src={preview} alt="Selected product" fill unoptimized sizes="(max-width: 760px) 100vw, 300px"/><div className="file-chip"><span>✓ {fileName}</span><button onClick={() => inputRef.current?.click()}>Replace</button><button aria-label="Remove image" onClick={removeImage}>×</button></div></> : <button className="upload-trigger" onClick={() => inputRef.current?.click()}><span className="upload-icon">↑</span><strong>Choose or drop product image</strong><small>JPG, PNG or WebP · up to 12 MB</small></button>}
                </div>
              </article>

              <article className="panel direction-panel">
                <div className="panel-heading"><div><p className="eyebrow">02 · DIRECTION</p><h2>Tell the creator what matters</h2></div><button className="soft-button" onClick={improvePrompt} disabled={improving}>✦ {improving ? "Improving…" : "Improve prompt"}</button></div>
                <textarea aria-label="Creative direction" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
                {error && <p className="workflow-error" role="alert">{error}</p>}
                <div className="direction-footer"><button className="preview-button" onClick={() => runWorkflow(true)} disabled={running}>Preview without credits</button><span>9:16 · 15 SEC</span><label className="toggle-row"><input type="checkbox" checked={audio} onChange={(e) => setAudio(e.target.checked)} /><span className="toggle"/><b>Audio {audio ? "on" : "off"}</b></label></div>
              </article>
            </div>

            <article className="canvas" id="workflow">
              <div className="canvas-head"><div><p>LIVE PRODUCTION MAP</p><h2>Every node reflects real execution</h2></div><span>{running ? "Running" : complete ? "Completed" : "Ready"}</span></div>
              <div className="react-flow-canvas" aria-label="Interactive visual workflow"><ProductionMap steps={workflowSteps}/></div>
            </article>
          </div>

          <aside className="output-column">
            <article className="panel progress-panel"><p className="eyebrow">PRODUCTION STATUS · {runtimeMode === "public-demo" ? "PUBLIC PREVIEW" : runtimeMode === "remote-api" ? "LIVE HIGGSFIELD API" : "LIVE CLI"}</p><div className="progress-title"><strong>{progress}%</strong><span>{running ? "In progress" : complete ? "Completed" : error ? "Needs attention" : "Not started"}</span></div><div className="big-progress"><i style={{ width: `${progress}%` }} /></div><div className="current-step"><span className={running ? "pulse" : "dot"}/><div><strong>{currentStep?.label || "Ready for your product"}</strong><small>{currentStep?.message || currentStep?.description || `${completedCount} of ${workflowSteps.length} stages completed`}</small></div></div></article>
            <article className="panel video-panel" id="output"><div className="panel-heading"><div><p className="eyebrow">{demoOutput ? "SAMPLE PREVIEW" : "FINAL OUTPUT"}</p><h2>{demoOutput ? "Interface demonstration" : "Your generated video"}</h2></div><span>⛶</span></div>{demoOutput && <p className="demo-disclosure">Sample video only — it is not generated from your uploaded image or prompt.</p>}<div className="video-frame">{complete && outputUrl && !videoError ? <video src={outputUrl} controls playsInline preload="metadata" onError={() => setVideoError(true)} /> : videoError ? <div className="video-empty"><span>!</span><strong>Video could not be loaded</strong><p>The provider URL may have expired. Run the workflow again.</p></div> : <div className="video-empty"><span>▶</span><strong>Your generated video will land here</strong><p>Live output requires a connected Higgsfield production account. Use Preview without credits only to demonstrate the interface.</p></div>}</div>{complete && outputUrl && !videoError && <div className="video-actions"><button onClick={() => document.querySelector("video")?.play()}>▶ Play</button><a href={outputUrl} download={demoOutput ? "voomara-sample-preview.mp4" : "voomara-ugc-output.mp4"}>↓ Download</a></div>}</article>
            <article className="panel history-panel" id="history"><div className="panel-heading"><div><p className="eyebrow">RUN HISTORY</p><h2>Current session</h2></div><span>↻</span></div><div className="history-entry"><span className={complete ? "history-icon complete" : running ? "history-icon running" : "history-icon"}>{complete ? "✓" : running ? "↻" : "•"}</span><div><strong>{complete ? (demoOutput ? "Sample preview completed" : "Generation completed") : running ? "Workflow in progress" : fileName || "No run started"}</strong><small>{complete ? `${workflowSteps.length} of ${workflowSteps.length} stages completed` : running ? `${completedCount} of ${workflowSteps.length} stages completed` : "Upload a product or run the credit-free preview"}</small></div>{complete && outputUrl && <a href="#output" onClick={(event) => { event.preventDefault(); navigateTo("output"); }}>View</a>}</div></article>
          </aside>
        </section>
      </main>
    </div>
  );
}
