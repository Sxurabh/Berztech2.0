"use client";
import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CornerFrame } from "@/components/CornerFrame";

/* ---------------- Parallax Hook ---------------- */
function useParallax(strength = 6) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Only apply parallax on desktop (lg screens)
    if (window.innerWidth < 1024) return;

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      
      el.style.transform = `perspective(1000px) rotateX(${y * -strength}deg) rotateY(${x * strength}deg)`;
    };

    const leave = () => {
      el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    };

    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [strength]);

  return ref;
}

/* ---------------- Bento Card Wrapper ---------------- */
function BentoCard({ 
  title, 
  subtitle, 
  tag, 
  children, 
  className = "", 
  dark = false,
  // CUSTOMIZATION: Default to slightly bolder corners than buttons
  bracketClass = "w-5 h-5 border-2" 
}) {
  const ref = useParallax(4);

  return (
    <div className={clsx("h-full min-h-[320px]", className)}>
      <CornerFrame
        ref={ref}
        // Pass the custom styling to your CornerFrame component
        bracketClassName={bracketClass}
        className={clsx(
          "h-full w-full transition-all duration-500 ",
          dark ? "bg-neutral-950 text-blue-400 hover:text-black" : "bg-white text-black"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className={clsx(
          "relative h-full overflow-hidden p-6 sm:p-8 flex flex-col",
          dark ? "text-white" : "text-neutral-950"
        )}>
          
          {/* Background Grid Pattern */}
          <div 
            className={clsx("absolute inset-0 opacity-[0.03] pointer-events-none", dark ? "bg-white" : "bg-black")}
            style={{ 
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
              backgroundSize: '24px 24px' 
            }} 
          />

          {/* Header */}
          <div className="relative z-10 pointer-events-none mb-4">
            <div className="flex items-center gap-2 mb-3">
               <div className={clsx("h-1 w-1 rounded-full", dark ? "bg-blue-400" : "bg-neutral-950")} />
               <p className={clsx("font-jetbrains-mono text-[10px] uppercase tracking-widest font-bold", dark ? "text-blue-400" : "text-neutral-500")}>
                 {tag}
               </p>
            </div>
            <h3 className="font-space-grotesk text-2xl font-medium tracking-tight">{title}</h3>
            <p className={clsx("mt-3 text-sm leading-relaxed max-w-[90%]", dark ? "text-neutral-400" : "text-neutral-600")}>
              {subtitle}
            </p>
          </div>
          
          {/* Content Area */}
          <div className="relative w-full flex-1 flex items-end justify-center pointer-events-auto min-h-[180px]">
             {children}
          </div>
        </div>
      </CornerFrame>
    </div>
  );
}



/* ---------------- Card 1: Architecture (Redesigned with Micro-interactions) ---------------- */
/* ---------------- Card 1: Architecture (Redesigned - Space Optimized) ---------------- */
function CrossPlatformCard() {
  const [activeLayer, setActiveLayer] = useState(null);
  const [dataPackets, setDataPackets] = useState([]);
  const [systemStatus, setSystemStatus] = useState('operational');
  
  // Generate continuous data flow
  useEffect(() => {
    const interval = setInterval(() => {
      const routes = ['client-to-cdn', 'cdn-to-edge', 'edge-to-core', 'core-to-db', 'db-to-cache'];
      const newPacket = {
        id: Date.now(),
        route: routes[Math.floor(Math.random() * routes.length)],
        progress: 0
      };
      setDataPackets(prev => [...prev.slice(-8), newPacket]);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  // Simulate status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses = ['operational', 'scaling', 'optimized'];
      setSystemStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const layers = [
    {
      id: 'clients',
      label: 'CLIENTS',
      icon: 'M',
      y: 15,
      nodes: [
        { x: 20, label: 'WEB', color: 'blue' },
        { x: 40, label: 'IOS', color: 'purple' },
        { x: 60, label: 'AND', color: 'green' },
        { x: 80, label: 'DESK', color: 'orange' }
      ]
    },
    {
      id: 'edge',
      label: 'EDGE/CDN',
      icon: 'E',
      y: 40,
      nodes: [
        { x: 25, label: 'US-E', color: 'emerald' },
        { x: 50, label: 'EU-W', color: 'emerald' },
        { x: 75, label: 'AS-S', color: 'emerald' }
      ]
    },
    {
      id: 'core',
      label: 'CORE CLUSTER',
      icon: 'C',
      y: 65,
      nodes: [
        { x: 35, label: 'API', color: 'indigo' },
        { x: 65, label: 'SRV', color: 'indigo' }
      ]
    },
    {
      id: 'data',
      label: 'DATA LAYER',
      icon: 'D',
      y: 88,
      nodes: [
        { x: 30, label: 'DB', color: 'rose' },
        { x: 50, label: 'CACHE', color: 'amber' },
        { x: 70, label: 'STORE', color: 'cyan' }
      ]
    }
  ];

  const getNodeColor = (color) => {
    const colors = {
      blue: 'bg-blue-500 border-blue-400 shadow-blue-500/30',
      purple: 'bg-purple-500 border-purple-400 shadow-purple-500/30',
      green: 'bg-emerald-500 border-emerald-400 shadow-emerald-500/30',
      orange: 'bg-orange-500 border-orange-400 shadow-orange-500/30',
      emerald: 'bg-emerald-500 border-emerald-400 shadow-emerald-500/30',
      indigo: 'bg-indigo-500 border-indigo-400 shadow-indigo-500/30',
      rose: 'bg-rose-500 border-rose-400 shadow-rose-500/30',
      amber: 'bg-amber-500 border-amber-400 shadow-amber-500/30',
      cyan: 'bg-cyan-500 border-cyan-400 shadow-cyan-500/30'
    };
    return colors[color] || colors.blue;
  };

  return (
    <BentoCard
      tag="Architecture"
      title="Unified Core"
      subtitle="Distributed edge computing with centralized core logic. Auto-scaling across 12 regions."
      className="lg:col-span-2 lg:row-span-2"
    >
      <div className="absolute inset-0 flex flex-col p-4 sm:p-6">
        
        {/* Header Stats - Fills top space */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className={clsx(
              "px-2 sm:px-3 py-1 rounded-full font-jetbrains-mono text-[9px] sm:text-[10px] font-bold border flex items-center gap-1.5 transition-all duration-500",
              systemStatus === 'operational' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
              systemStatus === 'scaling' && "bg-amber-500/10 border-amber-500/30 text-amber-600",
              systemStatus === 'optimized' && "bg-blue-500/10 border-blue-500/30 text-blue-600"
            )}>
              <span className={clsx(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                systemStatus === 'operational' && "bg-emerald-500",
                systemStatus === 'scaling' && "bg-amber-500",
                systemStatus === 'optimized' && "bg-blue-500"
              )} />
              {systemStatus.toUpperCase()}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-jetbrains-mono text-neutral-400">
              <span>LATENCY: <span className="text-neutral-600">12ms</span></span>
              <span className="text-neutral-300">|</span>
              <span>UPTIME: <span className="text-neutral-600">99.99%</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="font-space-grotesk text-lg sm:text-xl font-bold text-neutral-900 leading-none">2.4M</div>
              <div className="font-jetbrains-mono text-[8px] sm:text-[9px] text-neutral-500">REQ/MIN</div>
            </div>
          </div>
        </div>

        {/* Main Architecture Diagram - Flexible height */}
        <div className="flex-1 relative min-h-[280px] sm:min-h-[320px]">
          
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: 'clamp(20px, 4vw, 40px) clamp(20px, 4vw, 40px)'
            }} />
          </div>

          {/* Connection Lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            
            {/* Vertical spine */}
            <line x1="50%" y1="10%" x2="50%" y2="95%" stroke="#e5e5e5" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Layer connections */}
            {layers.slice(0, -1).map((layer, idx) => {
              const nextLayer = layers[idx + 1];
              return layer.nodes.map((node, nIdx) => 
                nextLayer.nodes.map((target, tIdx) => {
                  const isActive = dataPackets.some(p => 
                    (p.route.includes('client') && idx === 0) ||
                    (p.route.includes('edge') && idx === 1) ||
                    (p.route.includes('core') && idx === 2)
                  );
                  return (
                    <line
                      key={`${layer.id}-${nIdx}-${tIdx}`}
                      x1={`${node.x}%`}
                      y1={`${layer.y + 8}%`}
                      x2={`${target.x}%`}
                      y2={`${nextLayer.y - 5}%`}
                      stroke={isActive ? "url(#flowGradient)" : "#f0f0f0"}
                      strokeWidth={isActive ? "1.5" : "1"}
                      className={clsx("transition-all duration-300", isActive && "animate-pulse")}
                    />
                  );
                })
              );
            })}

            {/* Data packets */}
            {dataPackets.map((packet, idx) => (
              <circle
                key={packet.id}
                r={window.innerWidth < 640 ? "2" : "3"}
                fill="#3b82f6"
                filter="url(#glow)"
                className="animate-packet-flow"
                style={{
                  offsetPath: `path("M50% 15% Q ${30 + (idx * 15)}% 30% 50% 40%")`,
                  animationDelay: `${idx * 0.1}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </svg>

          {/* Architecture Layers */}
          <div className="relative h-full flex flex-col justify-between py-2">
            {layers.map((layer, layerIdx) => (
              <div 
                key={layer.id}
                className="relative"
                style={{ height: `${85 / layers.length}%` }}
                onMouseEnter={() => setActiveLayer(layer.id)}
                onMouseLeave={() => setActiveLayer(null)}
              >
                {/* Layer Label */}
                <div className={clsx(
                  "absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 font-jetbrains-mono text-[8px] sm:text-[10px] font-bold tracking-wider transition-all duration-300 z-10",
                  activeLayer === layer.id ? "text-neutral-900 translate-x-1" : "text-neutral-400"
                )}>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className={clsx(
                      "w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center text-[8px] sm:text-[10px] text-white transition-colors",
                      activeLayer === layer.id ? "bg-neutral-800" : "bg-neutral-400"
                    )}>
                      {layer.icon}
                    </span>
                    <span className="hidden xs:inline">{layer.label}</span>
                  </div>
                </div>

                {/* Nodes Container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
                    {layer.nodes.map((node, nodeIdx) => (
                      <div
                        key={nodeIdx}
                        className={clsx(
                          "relative group cursor-pointer transition-all duration-300",
                          activeLayer === layer.id ? "scale-110" : "hover:scale-105"
                        )}
                        style={{ marginLeft: `${(node.x - 50) * 0.1}%` }}
                      >
                        {/* Node */}
                        <div className={clsx(
                          "relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 shadow-lg",
                          getNodeColor(node.color),
                          activeLayer === layer.id ? "shadow-xl scale-105" : "opacity-90"
                        )}>
                          {/* Inner content */}
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/90 rounded-full mb-0.5 sm:mb-1 animate-pulse" />
                          <span className="font-jetbrains-mono text-[6px] sm:text-[7px] md:text-[8px] font-bold text-white/90 tracking-wider">
                            {node.label}
                          </span>
                          
                          {/* Hover tooltip */}
                          <div className={clsx(
                            "absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-2 py-1 rounded font-jetbrains-mono text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20",
                            "after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-neutral-900"
                          )}>
                            {node.label}-{(layerIdx + 1) * 10 + nodeIdx}
                          </div>
                        </div>

                        {/* Connection dots */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-neutral-300 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side metrics */}
                <div className={clsx(
                  "absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 font-jetbrains-mono text-[8px] sm:text-[9px] text-neutral-400 transition-opacity",
                  activeLayer === layer.id ? "opacity-100" : "opacity-0 sm:opacity-50"
                )}>
                  <div className="text-right space-y-0.5">
                    <div>{90 + layerIdx * 3}%</div>
                    <div className="text-neutral-300">HEALTH</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Floating status indicators */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 sm:gap-8 pointer-events-none">
            {['SSL', 'HTTP/2', 'WS', 'gRPC'].map((protocol, idx) => (
              <div 
                key={protocol}
                className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-neutral-200 px-2 py-1 rounded-full shadow-sm"
                style={{ animationDelay: `${idx * 0.2}s` }}
              >
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-jetbrains-mono text-[7px] sm:text-[8px] font-bold text-neutral-600">{protocol}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between text-[9px] sm:text-[10px] font-jetbrains-mono text-neutral-500 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
            <span className="truncate">NODES: <span className="text-neutral-900">12/12</span></span>
            <span className="text-neutral-300 hidden sm:inline">|</span>
            <span className="hidden sm:inline">REGIONS: <span className="text-neutral-900">GLOBAL</span></span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="animate-pulse text-emerald-500">●</span>
            <span>ACTIVE</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes packet-flow {
          0% { offset-distance: 0%; opacity: 0; transform: scale(0.5); }
          15% { opacity: 1; transform: scale(1); }
          85% { opacity: 1; transform: scale(1); }
          100% { offset-distance: 100%; opacity: 0; transform: scale(0.5); }
        }
        @media (max-width: 640px) {
          @keyframes packet-flow {
            0% { offset-distance: 0%; opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { offset-distance: 100%; opacity: 0; }
          }
        }
        .animate-packet-flow {
          animation: packet-flow 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </BentoCard>
  );
}

/* ---------------- Card 2: Performance (Responsive Terminal) ---------------- */
/* ---------------- Card 2: Performance (Redesigned Responsive Terminal) ---------------- */
function RealtimeCard() {
  const [logs, setLogs] = useState([
    { id: 1, text: "> system_init()", type: "info", timestamp: "00:00:01" },
    { id: 2, text: "> connecting_to_stream...", type: "process", timestamp: "00:00:02" },
  ]);
  const [metrics, setMetrics] = useState({
    cpu: 12,
    memory: 45,
    latency: 24,
    requests: 128
  });
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const terminalRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Generate logs and update metrics
  useEffect(() => {
    const messages = [
      { text: "> packet_received [2kb]", type: "success" },
      { text: "> latency_check: 12ms", type: "info" },
      { text: "> db_sync: OK", type: "success" },
      { text: "> cache_invalidate", type: "warning" },
      { text: "> event: user_login", type: "info" },
      { text: "> websocket_ping", type: "process" },
      { text: "> batch_process: 450 items", type: "success" },
      { text: "> garbage_collect", type: "warning" },
      { text: "> api_response: 200 OK", type: "success" },
      { text: "> realtime_update: 1.2ms", type: "info" },
    ];

    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const now = new Date();
      const timestamp = `00:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      setIsTyping(true);
      
      // Simulate typing delay
      setTimeout(() => {
        setLogs(prev => {
          const newLogs = [...prev, { 
            id: Date.now(), 
            text: randomMsg.text, 
            type: randomMsg.type,
            timestamp 
          }];
          return newLogs.slice(-6); // Keep last 6 logs
        });
        setIsTyping(false);
        
        // Update metrics randomly
        setMetrics(prev => ({
          cpu: Math.max(5, Math.min(95, prev.cpu + (Math.random() - 0.5) * 20)),
          memory: Math.max(20, Math.min(90, prev.memory + (Math.random() - 0.5) * 10)),
          latency: Math.max(8, Math.min(100, prev.latency + (Math.random() - 0.5) * 15)),
          requests: prev.requests + Math.floor(Math.random() * 5)
        }));
      }, 150);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  const getLogColor = (type) => {
    switch(type) {
      case 'success': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'error': return 'text-rose-400';
      case 'process': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  const getLogIcon = (type) => {
    switch(type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      case 'process': return '◐';
      default: return '›';
    }
  };

  return (
    <BentoCard
      tag="Infrastructure"
      title="Real-Time"
      subtitle="Event-driven systems built for sub-millisecond updates."
      dark
      className="lg:col-span-1"
    >
      <div className="w-full h-full flex flex-col gap-3 min-h-[280px] sm:min-h-[320px]">
        
        {/* Terminal Window */}
        <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl relative group">
          {/* Terminal Header */}
          <div className="bg-neutral-900 border-b border-neutral-800 px-3 py-2 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 group-hover:bg-rose-500 transition-colors" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 group-hover:bg-amber-500 transition-colors" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors" />
              </div>
              <span className="ml-3 font-jetbrains-mono text-[10px] text-neutral-500 uppercase tracking-wider hidden sm:inline">root@server-prod-01</span>
              <span className="ml-2 font-jetbrains-mono text-[10px] text-neutral-500 uppercase tracking-wider sm:hidden">prod-01</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-jetbrains-mono text-[9px] text-emerald-500 animate-pulse">● LIVE</span>
              <div className="w-12 h-1 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-pulse-width" style={{ width: '60%' }} />
              </div>
            </div>
          </div>

          {/* Terminal Body */}
          <div 
            ref={terminalRef}
            className="p-3 sm:p-4 font-jetbrains-mono text-[10px] sm:text-[11px] leading-relaxed overflow-y-auto h-[140px] sm:h-[160px] scrollbar-hide relative"
          >
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded opacity-[0.03]">
              <div className="w-full h-full bg-gradient-to-b from-transparent via-white to-transparent animate-scanline" />
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none opacity-50" />

            {/* Logs */}
            <div className="flex flex-col gap-1.5 relative z-10">
              {logs.map((log, index) => (
                <div 
                  key={log.id}
                  className={clsx(
                    "flex items-start gap-2 opacity-0 animate-fade-in",
                    index === logs.length - 1 && "animate-highlight"
                  )}
                  style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                >
                  <span className="text-neutral-600 shrink-0 font-mono text-[9px]">{log.timestamp}</span>
                  <span className={clsx("shrink-0", getLogColor(log.type))}>
                    {getLogIcon(log.type)}
                  </span>
                  <span className={clsx(
                    "break-all",
                    getLogColor(log.type),
                    index === logs.length - 1 && isTyping && "animate-typing"
                  )}>
                    {log.text}
                  </span>
                </div>
              ))}
              
              {/* Active cursor line */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-neutral-600 text-[9px]">
                  {`00:${String(new Date().getMinutes()).padStart(2, '0')}:${String(new Date().getSeconds()).padStart(2, '0')}`}
                </span>
                <span className="text-green-400">›</span>
                <span className="text-neutral-400">_</span>
                <span 
                  className={clsx(
                    "w-2 h-4 bg-green-400 ml-0.5",
                    cursorVisible ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="bg-neutral-900 border-t border-neutral-800 px-3 py-1.5 flex items-center justify-between text-[9px] font-jetbrains-mono">
            <div className="flex items-center gap-3 overflow-hidden">
              <span className="text-neutral-500 truncate">
                MODE: <span className="text-emerald-400">INSERT</span>
              </span>
              <span className="text-neutral-600 hidden xs:inline">|</span>
              <span className="text-neutral-500 hidden xs:inline">
                PID: <span className="text-neutral-300">8,492</span>
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-neutral-500">UTF-8</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-500">LN: {logs.length}</span>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* CPU Metric */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-2.5 sm:p-3 relative overflow-hidden group hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-jetbrains-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-wider">CPU</span>
              <svg className="w-3 h-3 text-neutral-600 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div className="flex items-end gap-1">
              <span className="font-space-grotesk text-lg sm:text-xl font-bold text-white">
                {Math.round(metrics.cpu)}
              </span>
              <span className="font-jetbrains-mono text-[10px] text-neutral-500 mb-1">%</span>
            </div>
            <div className="mt-2 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${metrics.cpu}%` }}
              />
            </div>
            {/* Mini sparkline */}
            <div className="absolute top-2 right-2 w-8 h-4 opacity-30">
              <svg viewBox="0 0 32 16" className="w-full h-full fill-none stroke-emerald-500 stroke-1">
                <path d="M0 8 L4 6 L8 10 L12 4 L16 8 L20 6 L24 12 L28 8 L32 10" />
              </svg>
            </div>
          </div>

          {/* Memory Metric */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-2.5 sm:p-3 relative overflow-hidden group hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-jetbrains-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-wider">MEM</span>
              <svg className="w-3 h-3 text-neutral-600 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="flex items-end gap-1">
              <span className="font-space-grotesk text-lg sm:text-xl font-bold text-white">
                {Math.round(metrics.memory)}
              </span>
              <span className="font-jetbrains-mono text-[10px] text-neutral-500 mb-1">%</span>
            </div>
            <div className="mt-2 h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${metrics.memory}%` }}
              />
            </div>
          </div>

          {/* Latency Metric */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-2.5 sm:p-3 relative overflow-hidden group hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-jetbrains-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-wider">LATENCY</span>
              <svg className="w-3 h-3 text-neutral-600 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex items-end gap-1">
              <span className="font-space-grotesk text-lg sm:text-xl font-bold text-white">
                {Math.round(metrics.latency)}
              </span>
              <span className="font-jetbrains-mono text-[10px] text-neutral-500 mb-1">ms</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <div className={clsx(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                metrics.latency < 20 ? "bg-emerald-500" : metrics.latency < 50 ? "bg-amber-500" : "bg-rose-500"
              )} />
              <span className="font-jetbrains-mono text-[8px] text-neutral-500">
                {metrics.latency < 20 ? 'OPTIMAL' : metrics.latency < 50 ? 'NORMAL' : 'ELEVATED'}
              </span>
            </div>
          </div>

          {/* Requests Metric */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-2.5 sm:p-3 relative overflow-hidden group hover:border-neutral-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-jetbrains-mono text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-wider">REQ/SEC</span>
              <svg className="w-3 h-3 text-neutral-600 group-hover:text-purple-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="flex items-end gap-1">
              <span className="font-space-grotesk text-lg sm:text-xl font-bold text-white">
                {metrics.requests}
              </span>
              <span className="font-jetbrains-mono text-[10px] text-neutral-500 mb-1">/s</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="font-jetbrains-mono text-[8px] text-emerald-500">+12%</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes highlight {
          0% { background-color: rgba(16, 185, 129, 0.1); }
          100% { background-color: transparent; }
        }
        @keyframes pulse-width {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes typing {
          0%, 100% { border-right: 2px solid transparent; }
          50% { border-right: 2px solid #10b981; }
        }
        .animate-scanline {
          animation: scanline 4s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-highlight {
          animation: highlight 0.5s ease-out;
        }
        .animate-pulse-width {
          animation: pulse-width 2s ease-in-out infinite;
        }
        .animate-typing {
          animation: typing 0.8s ease-in-out infinite;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </BentoCard>
  );
}

/* ---------------- Card 3: Intelligence ---------------- */
/* ---------------- Card 3: Intelligence (Redesigned with Neural Aesthetic) ---------------- */
function AICard() {
  const [neuralState, setNeuralState] = useState('idle'); // idle, processing, complete
  const [synapseFired, setSynapseFired] = useState([]);
  
  // Simulate neural activity
  useEffect(() => {
    const interval = setInterval(() => {
      // Random synapse firing
      const synapseId = Date.now();
      setSynapseFired(prev => [...prev.slice(-5), synapseId]);
      
      // Occasional state change
      if (Math.random() > 0.7) {
        setNeuralState('processing');
        setTimeout(() => setNeuralState('complete'), 800);
        setTimeout(() => setNeuralState('idle'), 1500);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const nodes = [
    { id: 1, x: 20, y: 30, size: 'sm', delay: 0 },
    { id: 2, x: 80, y: 25, size: 'md', delay: 0.2 },
    { id: 3, x: 15, y: 70, size: 'md', delay: 0.4 },
    { id: 4, x: 85, y: 75, size: 'sm', delay: 0.6 },
    { id: 5, x: 50, y: 85, size: 'sm', delay: 0.8 },
    { id: 6, x: 50, y: 15, size: 'xs', delay: 1 },
  ];

  return (
    <BentoCard
      tag="Intelligence"
      title="AI Agents"
      subtitle="Embed intelligent workflows directly into your platform."
      className="lg:col-span-1"
    >
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        
        {/* Neural Network SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Gradient for active connections */}
            <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="neuralGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Dynamic Connection Lines */}
          <g className="transition-all duration-500">
            {/* Connections between nodes */}
            {nodes.map((node, i) => 
              nodes.slice(i + 1).map((target, j) => {
                const isActive = synapseFired.some((_, idx) => (idx + i + j) % 3 === 0);
                return (
                  <line
                    key={`${node.id}-${target.id}`}
                    x1={node.x}
                    y1={node.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isActive ? "url(#neuralGrad)" : "#e5e5e5"}
                    strokeWidth={isActive ? "0.8" : "0.4"}
                    className={clsx(
                      "transition-all duration-300",
                      isActive && "animate-pulse-opacity"
                    )}
                  />
                );
              })
            )}
          </g>

          {/* Traveling Data Packets along connections */}
          {synapseFired.map((id, idx) => {
            const fromNode = nodes[idx % nodes.length];
            const toNode = nodes[(idx + 2) % nodes.length];
            return (
              <circle
                key={id}
                r="1.2"
                fill="#a855f7"
                filter="url(#neuralGlow)"
                className="animate-synapse-travel"
                style={{
                  offsetPath: `path("M${fromNode.x} ${fromNode.y} L${toNode.x} ${toNode.y}")`,
                  animationDelay: `${idx * 0.1}s`
                }}
              />
            );
          })}
        </svg>

        {/* Central Brain/Core */}
        <div 
          className="relative z-20 group cursor-pointer"
          onMouseEnter={() => setNeuralState('processing')}
          onMouseLeave={() => setNeuralState('idle')}
        >
          {/* Outer aura rings */}
          <div className={clsx(
            "absolute inset-0 rounded-full border border-purple-500/20 transition-all duration-1000",
            neuralState === 'processing' ? "scale-150 opacity-0" : "scale-100 opacity-100 animate-ping-slow"
          )} />
          
          <div className={clsx(
            "absolute -inset-4 rounded-full border border-purple-500/10 transition-all duration-700",
            neuralState === 'processing' && "scale-110 border-purple-500/30"
          )} />

          {/* Main brain container */}
          <div className={clsx(
            "relative w-20 h-20 bg-white border-2 shadow-2xl transition-all duration-500 flex items-center justify-center",
            neuralState === 'processing' 
              ? "border-purple-500 shadow-purple-500/30 scale-110 rotate-3" 
              : "border-neutral-200 hover:border-purple-400 hover:scale-105",
            neuralState === 'complete' && "border-green-500 shadow-green-500/20"
          )}>
            
            {/* Brain icon/svg */}
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <path 
                  d="M12 2C8.13 2 5 5.13 5 9c0 1.74.5 3.37 1.41 4.84.95 1.54 2.2 2.86 3.16 4.4.47.75.93 1.66 1.43 2.76.5 1.1 1 2 1 2s.5-.9 1-2 1.01-1.76 1.43-2.76c.96-1.54 2.21-2.86 3.16-4.4C18.5 12.37 19 10.74 19 9c0-3.87-3.13-7-7-7z" 
                  className={clsx(
                    "transition-all duration-500",
                    neuralState === 'processing' ? "fill-purple-100 stroke-purple-600" : "fill-neutral-100 stroke-neutral-600",
                    neuralState === 'complete' && "fill-green-100 stroke-green-600"
                  )}
                  strokeWidth="1.5"
                />
                {/* Neural pathways inside brain */}
                <path 
                  d="M8 9c0-1 .5-2 1.5-2.5M16 9c0-1-.5-2-1.5-2.5M12 14v3" 
                  stroke="currentColor" 
                  strokeWidth="1" 
                  strokeLinecap="round"
                  className={clsx(
                    "transition-opacity duration-300",
                    neuralState === 'processing' ? "text-purple-600 opacity-100" : "text-neutral-400 opacity-50"
                  )}
                />
              </svg>

              {/* Processing indicator overlay */}
              <div className={clsx(
                "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                neuralState === 'processing' ? "opacity-100" : "opacity-0"
              )}>
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>

            {/* Corner tech details */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-purple-500/50" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-purple-500/50" />
          </div>

          {/* Status label floating below */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className={clsx(
              "font-jetbrains-mono text-[9px] font-bold tracking-wider px-2 py-1 rounded transition-all duration-300",
              neuralState === 'processing' && "bg-purple-100 text-purple-700",
              neuralState === 'complete' && "bg-green-100 text-green-700",
              neuralState === 'idle' && "bg-neutral-100 text-neutral-500"
            )}>
              {neuralState === 'processing' && "PROCESSING..."}
              {neuralState === 'complete' && "COMPLETE"}
              {neuralState === 'idle' && "STANDBY"}
            </div>
          </div>
        </div>

        {/* Orbital Nodes */}
        {nodes.map((node) => (
          <div
            key={node.id}
            className={clsx(
              "absolute rounded-full bg-white border transition-all duration-500 shadow-sm hover:scale-125 cursor-pointer",
              node.size === 'sm' && "w-3 h-3",
              node.size === 'md' && "w-4 h-4",
              node.size === 'xs' && "w-2 h-2",
              synapseFired.some((_, idx) => idx % nodes.length === node.id - 1) 
                ? "border-purple-500 shadow-purple-500/50 bg-purple-50" 
                : "border-neutral-300 hover:border-purple-400"
            )}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${node.delay}s`
            }}
          >
            {/* Node pulse effect */}
            <div className={clsx(
              "absolute inset-0 rounded-full bg-purple-500/30 animate-ping",
              synapseFired.some((_, idx) => idx % nodes.length === node.id - 1) ? "opacity-100" : "opacity-0"
            )} />
          </div>
        ))}

        {/* Floating Data Particles */}
        <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-purple-400 rounded-full animate-float-particle" />
        <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 bg-blue-400 rounded-full animate-float-particle" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-[25%] left-[20%] w-1 h-1 bg-purple-300 rounded-full animate-float-particle" style={{ animationDelay: '0.7s' }} />

        {/* Background grid subtle effect */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at ${nodes[0].x}% ${nodes[0].y}%, purple 1px, transparent 1px),
                             radial-gradient(circle at ${nodes[1].x}% ${nodes[1].y}%, purple 1px, transparent 1px),
                             radial-gradient(circle at ${nodes[2].x}% ${nodes[2].y}%, purple 1px, transparent 1px)`,
            backgroundSize: '100% 100%'
          }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes pulse-opacity {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes synapse-travel {
          0% { offset-distance: 0%; opacity: 0; transform: scale(0.5); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { offset-distance: 100%; opacity: 0; transform: scale(0.5); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          33% { transform: translate(10px, -10px) scale(1.2); opacity: 0.8; }
          66% { transform: translate(-5px, 5px) scale(0.8); opacity: 0.6; }
        }
        .animate-ping-slow {
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-pulse-opacity {
          animation: pulse-opacity 2s ease-in-out infinite;
        }
        .animate-synapse-travel {
          animation: synapse-travel 1.5s ease-in-out forwards;
        }
        .animate-float-particle {
          animation: float-particle 4s ease-in-out infinite;
        }
      `}</style>
    </BentoCard>
  );
}

/* ---------------- Main Layout ---------------- */
export default function BentoGrid() {
  return (
    <section className="py-24 px-6 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl mb-16">
          <h2 className="font-space-grotesk text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
            Engineered for scale. <br/>
            <span className="text-neutral-400">Designed for longevity.</span>
          </h2>
          <p className="mt-6 text-lg font-jetbrains-mono text-neutral-500">
            // We build systems, not just pages.
          </p>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-2 lg:min-h-[600px] auto-rows-fr">
          <CrossPlatformCard />
          <RealtimeCard />
          <AICard />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan {
           animation: scan 2s linear infinite;
        }
      `}</style>
    </section>
  );
}