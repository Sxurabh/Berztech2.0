"use client";
import React, { useEffect, useState, useRef } from "react";
import { CornerFrame } from "@/components/CornerFrame";
import clsx from "clsx";

/* ---------------- Component 1: Interactive IDE with Live Typing ---------------- */
function CodeWindow() {
  const [activeFile, setActiveFile] = useState('Dashboard.tsx');
  const [typingProgress, setTypingProgress] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [lineHighlights, setLineHighlights] = useState([]);
  
  const files = [
    { name: 'Dashboard.tsx', lang: 'tsx', color: 'text-blue-400' },
    { name: 'api/stream.ts', lang: 'ts', color: 'text-blue-300' },
    { name: 'hooks/useMetrics.ts', lang: 'ts', color: 'text-yellow-300' },
  ];

  const codeLines = [
    { content: "export default function RealtimeDashboard() {", indent: 0, type: 'function' },
    { content: "const { metrics, isLive } = useWebSocket('wss://api.dev');", indent: 1, type: 'hook' },
    { content: "const optimized = useMemo(() => compute(metrics), [metrics]);", indent: 1, type: 'logic' },
    { content: "", indent: 0, type: 'empty' },
    { content: "return (", indent: 1, type: 'return' },
    { content: "<Grid cols={3} gap='lg'>", indent: 2, type: 'jsx' },
    { content: "<MetricCard", indent: 3, type: 'component', highlight: true },
    { content: "title='Throughput'", indent: 4, type: 'prop' },
    { content: "value={optimized.rps}", indent: 4, type: 'prop' },
    { content: "trend='+12%'", indent: 4, type: 'prop' },
    { content: "/>", indent: 3, type: 'close' },
    { content: "</Grid>", indent: 2, type: 'close' },
    { content: ");", indent: 1, type: 'end' },
    { content: "}", indent: 0, type: 'end' },
  ];

  // Live typing simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingProgress(prev => {
        if (prev >= codeLines.length) {
          setTimeout(() => setTypingProgress(0), 2000);
          return 0;
        }
        return prev + 0.5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  // Random line highlights
  useEffect(() => {
    const interval = setInterval(() => {
      const randomLine = Math.floor(Math.random() * codeLines.length);
      setLineHighlights([randomLine]);
      setTimeout(() => setLineHighlights([]), 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getSyntaxColor = (type) => {
    const colors = {
      function: 'text-purple-400',
      hook: 'text-blue-300',
      logic: 'text-cyan-300',
      return: 'text-purple-400',
      jsx: 'text-yellow-100',
      component: 'text-yellow-100',
      prop: 'text-purple-300',
      close: 'text-neutral-400',
      end: 'text-neutral-400',
      empty: ''
    };
    return colors[type] || 'text-neutral-300';
  };

  const visibleLines = Math.floor(typingProgress);

  return (
    <div className="relative z-20 w-full">
      {/* File Tabs */}
      <div className="flex items-end gap-1 px-2 overflow-x-auto scrollbar-hide">
        {files.map((file) => (
          <button
            key={file.name}
            onClick={() => setActiveFile(file.name)}
            className={clsx(
              "px-3 py-2 text-[10px] font-jetbrains-mono font-medium transition-all duration-200 border-t border-l border-r rounded-t-lg flex items-center gap-2 shrink-0",
              activeFile === file.name 
                ? "bg-neutral-950 text-white border-neutral-700 translate-y-[1px]" 
                : "bg-neutral-900 text-neutral-500 border-transparent hover:text-neutral-300"
            )}
          >
            <span className={file.color}>●</span>
            {file.name}
            {activeFile === file.name && (
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse ml-1" />
            )}
          </button>
        ))}
      </div>

      <CornerFrame 
        className="bg-neutral-950 text-neutral-600 shadow-2xl rounded-b-lg rounded-tr-lg" 
        bracketClassName="w-4 h-4 border-2" 
      >
        <div className="relative bg-neutral-950 p-4 sm:p-5 ring-1 ring-white/10 overflow-hidden min-h-[320px] sm:min-h-[380px]">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
          
          {/* Window Controls */}
          <div className="absolute right-4 top-4 flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/40 transition-colors cursor-pointer" />
            <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/40 transition-colors cursor-pointer" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/40 transition-colors cursor-pointer" />
          </div>

          {/* IDE Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-jetbrains-mono text-neutral-500">src/components/</span>
              <span className="text-[10px] font-jetbrains-mono text-white">{activeFile}</span>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-jetbrains-mono text-neutral-500">
              <span className="flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                LSP: active
              </span>
              <span>UTF-8</span>
            </div>
          </div>

          {/* Code Editor */}
          <div className="relative font-jetbrains-mono text-[11px] sm:text-xs leading-6 overflow-hidden">
            <div className="flex gap-4">
              {/* Line Numbers */}
              <div className="flex select-none flex-col text-right text-neutral-700 min-w-[2rem]">
                {codeLines.map((_, i) => (
                  <span 
                    key={i} 
                    className={clsx(
                      "transition-colors duration-200",
                      lineHighlights.includes(i) && "text-yellow-400 bg-yellow-400/10 px-1 rounded",
                      i < visibleLines && "text-neutral-600"
                    )}
                  >
                    {i + 1}
                  </span>
                ))}
              </div>

              {/* Code Content */}
              <div className="flex flex-col flex-1">
                {codeLines.map((line, i) => {
                  const isVisible = i < visibleLines;
                  const isPartiallyTyped = i === Math.floor(typingProgress) && typingProgress % 1 !== 0;
                  const displayContent = isPartiallyTyped 
                    ? line.content.slice(0, Math.floor((typingProgress % 1) * line.content.length))
                    : line.content;

                  return (
                    <div 
                      key={i}
                      className={clsx(
                        "transition-all duration-300 flex",
                        !isVisible && "opacity-0",
                        lineHighlights.includes(i) && "bg-blue-500/10 -mx-2 px-2 rounded border-l-2 border-blue-500"
                      )}
                      style={{ paddingLeft: `${line.indent}rem` }}
                    >
                      <span className={getSyntaxColor(line.type)}>
                        {displayContent}
                        {i === Math.floor(typingProgress) && showCursor && (
                          <span className="inline-block w-2 h-4 bg-blue-400 ml-0.5 animate-pulse" />
                        )}
                      </span>
                    </div>
                  );
                })}
                
                {/* Autocomplete Suggestion */}
                {typingProgress > 3 && typingProgress < 5 && (
                  <div className="absolute left-32 top-20 bg-neutral-800 border border-neutral-700 rounded shadow-2xl p-2 z-10 animate-fade-in">
                    <div className="text-[9px] text-neutral-400 mb-1">Suggestions</div>
                    <div className="flex items-center gap-2 text-[10px] text-white bg-blue-500/20 px-2 py-1 rounded">
                      <span className="text-yellow-400">⚡</span>
                      useWebSocket
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-300 px-2 py-1">
                      <span className="text-neutral-500">fn</span>
                      useMetrics
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terminal Footer */}
          <div className="absolute bottom-0 left-0 right-0 bg-neutral-900 border-t border-white/5 px-4 py-2 flex items-center justify-between text-[9px] font-jetbrains-mono">
            <div className="flex items-center gap-3 text-neutral-500">
              <span className="text-emerald-500">●</span>
              <span>main*</span>
              <span className="text-neutral-600">|</span>
              <span>2 changes</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neutral-500">Ln {visibleLines}, Col 1</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-500">TypeScript React</span>
            </div>
          </div>
        </div>
      </CornerFrame>
    </div>
  );
}

/* ---------------- Component 2: Live Preview Dashboard ---------------- */
function VisualPreview() {
  const [metrics, setMetrics] = useState({
    rpm: 2450,
    latency: 12,
    errors: 0.01,
    uptime: 99.99
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [logs, setLogs] = useState([]);

  const tabs = ['overview', 'network', 'console', 'errors'];

  // Live metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        rpm: Math.max(2000, Math.min(3000, prev.rpm + Math.floor((Math.random() - 0.5) * 200))),
        latency: Math.max(8, Math.min(25, prev.latency + (Math.random() - 0.5) * 3)),
        errors: Math.max(0, Math.min(0.05, prev.errors + (Math.random() - 0.5) * 0.01)),
        uptime: 99.99
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Generate logs
  useEffect(() => {
    const messages = [
      { type: 'success', msg: 'Build completed in 1.2s' },
      { type: 'info', msg: 'Hot reload: page.tsx' },
      { type: 'success', msg: 'API route /api/metrics 200 OK' },
      { type: 'warning', msg: 'Deprecation: useLayoutEffect' },
    ];
    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [{ ...msg, id: Date.now() }, ...prev.slice(0, 3)]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const getBarWidth = (value, max) => `${Math.min(100, (value / max) * 100)}%`;

  return (
    <div className="relative z-20 w-full lg:ml-auto lg:max-w-[95%]">
      {/* Browser Chrome */}
      <div className="bg-neutral-100 border border-neutral-200 border-b-0 rounded-t-lg px-3 py-2 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/30" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/30" />
        </div>
        <div className="flex-1 bg-white border border-neutral-200 rounded px-3 py-1 text-[9px] font-jetbrains-mono text-neutral-400 flex items-center gap-2">
          <svg className="w-3 h-3 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          localhost:3000/dashboard
          <span className="ml-auto text-emerald-500 text-[8px]">● Live</span>
        </div>
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-2 py-1 text-[8px] font-jetbrains-mono uppercase rounded transition-colors",
                activeTab === tab ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <CornerFrame 
        className="bg-white text-neutral-600 shadow-2xl rounded-b-lg"
        bracketClassName="w-4 h-4 border-2"
      >
        <div className="relative overflow-hidden bg-white p-4 sm:p-5 min-h-[280px] sm:min-h-[340px]">
          
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-neutral-100">
            <div>
              <h3 className="font-space-grotesk text-sm font-bold text-neutral-900">Production Metrics</h3>
              <p className="font-jetbrains-mono text-[9px] text-neutral-400 mt-0.5">Region: us-east-1 • Cluster: pro-01</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-jetbrains-mono rounded">
                HEALTHY
              </span>
              <button className="p-1.5 hover:bg-neutral-100 rounded transition-colors">
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* RPM Card */}
            <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 relative overflow-hidden group hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-jetbrains-mono text-neutral-500 uppercase">Requests/min</span>
                <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="font-space-grotesk text-2xl font-bold text-neutral-900 tabular-nums">
                {metrics.rpm.toLocaleString()}
              </div>
              <div className="mt-2 h-1 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500 rounded-full"
                  style={{ width: getBarWidth(metrics.rpm, 3000) }}
                />
              </div>
            </div>

            {/* Latency Card */}
            <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 relative overflow-hidden group hover:border-emerald-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-jetbrains-mono text-neutral-500 uppercase">Latency</span>
                <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-space-grotesk text-2xl font-bold text-neutral-900 tabular-nums">
                  {metrics.latency.toFixed(1)}
                </span>
                <span className="text-[10px] text-neutral-400">ms</span>
              </div>
              <div className="mt-2 h-1 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className={clsx(
                    "h-full transition-all duration-500 rounded-full",
                    metrics.latency < 15 ? "bg-emerald-500" : metrics.latency < 25 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: getBarWidth(50 - metrics.latency, 50) }}
                />
              </div>
            </div>

            {/* Error Rate */}
            <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 relative overflow-hidden group hover:border-rose-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-jetbrains-mono text-neutral-500 uppercase">Error Rate</span>
                <svg className="w-3 h-3 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-space-grotesk text-2xl font-bold text-neutral-900 tabular-nums">
                  {metrics.errors.toFixed(2)}
                </span>
                <span className="text-[10px] text-neutral-400">%</span>
              </div>
              <div className="mt-2 text-[8px] font-jetbrains-mono text-emerald-600">
                ↓ 0.02% from last hour
              </div>
            </div>

            {/* Uptime */}
            <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 relative overflow-hidden group hover:border-purple-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-jetbrains-mono text-neutral-500 uppercase">Uptime</span>
                <svg className="w-3 h-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div className="font-space-grotesk text-2xl font-bold text-neutral-900 tabular-nums">
                {metrics.uptime}%
              </div>
              <div className="mt-2 flex gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className={clsx(
                      "flex-1 h-1 rounded-full",
                      i < 9 ? "bg-emerald-400" : "bg-emerald-200"
                    )} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="border border-neutral-100 rounded-lg bg-neutral-50/50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-jetbrains-mono text-neutral-500 uppercase">Recent Activity</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse delay-75" />
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse delay-150" />
              </div>
            </div>
            <div className="space-y-1.5">
              {logs.length === 0 && (
                <div className="text-[9px] text-neutral-400 font-jetbrains-mono py-2">Waiting for events...</div>
              )}
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center gap-2 text-[9px] font-jetbrains-mono animate-slide-in"
                >
                  <span className={clsx(
                    "w-1.5 h-1.5 rounded-full",
                    log.type === 'success' && "bg-emerald-500",
                    log.type === 'warning' && "bg-amber-500",
                    log.type === 'info' && "bg-blue-500"
                  )} />
                  <span className={clsx(
                    log.type === 'success' && "text-emerald-700",
                    log.type === 'warning' && "text-amber-700",
                    log.type === 'info' && "text-blue-700",
                    "text-neutral-600"
                  )}>
                    {log.msg}
                  </span>
                  <span className="text-neutral-300 ml-auto">now</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CornerFrame>
    </div>
  );
}

/* ---------------- Main Section ---------------- */
export default function CodeShowcase() {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-jetbrains-mono font-bold text-neutral-600 uppercase tracking-wider">
              Development Environment
            </span>
          </div>
          <h2 className="font-space-grotesk text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-neutral-950 mb-4">
            Write once. Deploy everywhere.{' '}
            <span className="text-neutral-400">Monitor always.</span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            Modern development workflow with live preview, real-time metrics, and instant feedback loops.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Left: IDE */}
          <div className={clsx(
            "transition-all duration-700",
            isIntersecting ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
          )}>
            <CodeWindow />
            
            {/* Feature List */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: 'IntelliSense', desc: 'Smart completions', icon: '💡' },
                { label: 'Type Safety', desc: 'Full TS coverage', icon: '🛡️' },
                { label: 'Hot Reload', desc: '<100ms updates', icon: '⚡' },
                { label: 'Git Integration', desc: 'Inline diffs', icon: '🔀' },
              ].map((feature, i) => (
                <div 
                  key={feature.label}
                  className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-100 rounded-lg hover:border-neutral-200 transition-colors group"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">{feature.icon}</span>
                  <div>
                    <div className="font-jetbrains-mono text-[10px] font-bold text-neutral-900">{feature.label}</div>
                    <div className="text-[9px] text-neutral-500 mt-0.5">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Preview */}
          <div className={clsx(
            "lg:mt-12 transition-all duration-700 delay-200",
            isIntersecting ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
          )}>
            <VisualPreview />
            
           
          </div>
        </div>

      
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}