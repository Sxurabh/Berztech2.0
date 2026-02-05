// "use client";
// import React, { useEffect, useState } from "react";
// import { CornerFrame } from "@/components/CornerFrame";
// import clsx from "clsx";

// /* ---------------- Component 1: The Technical IDE ---------------- */
// function CodeWindow() {
//   return (
//     <div className="relative z-20 w-full min-w-0">
//       <div className="absolute -top-3 left-4 z-30 bg-white  px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-950">
//         Source.tsx
//       </div>

//       <CornerFrame 
//         className="bg-neutral-950 text-neutral-600 p-1 shadow-2xl" 
//         bracketClassName="w-3 h-3 border-2" 
//       >
//         {/* Added overflow-hidden to the wrapper and min-w-0 to the parent */}
//         <div className="relative bg-neutral-950 p-4 sm:p-6 pt-8 ring-1 ring-white/10 overflow-hidden">
//           <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />

//           <div className="absolute right-4 top-4 flex gap-1.5">
//             <div className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
//             <div className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
//           </div>

//           {/* Forced horizontal scroll on code overflow */}
//           <div className="relative font-jetbrains-mono text-[10px] leading-5 text-neutral-400 sm:text-xs overflow-x-auto scrollbar-thin">
//             <div className="flex gap-4 min-w-max pb-2">
//               <div className="flex select-none flex-col text-right text-neutral-700">
//                 <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
//               </div>
//               <div className="flex flex-col whitespace-nowrap">
//                 <div><span className="text-purple-400">export default</span> <span className="text-blue-400">function</span> <span className="text-yellow-100">LiveMetric</span>() {"{"}</div>
//                 <div className="pl-4"><span className="text-purple-400">const</span> data = <span className="text-blue-300">useSocket</span>(<span className="text-green-400">'wss://api.stream'</span>);</div>
//                 <div className="h-5" />
//                 <div className="pl-4"><span className="text-purple-400">return</span> (</div>
//                 <div className="pl-8">&lt;<span className="text-yellow-100">Card</span> <span className="text-purple-300">variant</span>="<span className="text-green-400">industrial</span>"&gt;</div>
//                 <div className="pl-12 bg-white/5 -mx-4 px-4 border-l-2 border-blue-500">
//                    &lt;<span className="text-yellow-100">MetricDisplay</span> <span className="text-purple-300">value</span>={"{"}<span className="text-white">data.rpm</span>{"}"} /&gt;
//                 </div>
//                 <div className="pl-8">&lt;/<span className="text-yellow-100">Card</span>&gt;</div>
//                 <div>)</div>
//                 <div>{"}"}</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </CornerFrame>
//     </div>
//   );
// }

// /* ---------------- Component 2: The Industrial Monitor ---------------- */
// function VisualPreview() {
//   const [val, setVal] = useState(84);

//   useEffect(() => {
//     const i = setInterval(() => setVal(prev => Math.min(99, Math.max(70, prev + (Math.random() - 0.5) * 10))), 800);
//     return () => clearInterval(i);
//   }, []);

//   return (
//     <div className="relative z-20 w-full min-w-0 lg:ml-auto lg:max-w-[90%]">
//       <div className="absolute -top-3 right-4 z-30 bg-neutral-950 border border-neutral-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
//         Output.exe
//       </div>

//       <CornerFrame 
//         className="bg-white text-neutral-300 p-1 shadow-2xl"
//         bracketClassName="w-3 h-3 border-2"
//       >
//         <div className="relative overflow-hidden bg-neutral-50 p-4 sm:p-6 flex flex-col justify-between border border-neutral-100">
          
//           <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
//             <span className="font-jetbrains-mono text-[9px] uppercase tracking-widest text-neutral-500">System_Status</span>
//             <div className="flex items-center gap-2">
//                <span className="h-1.5 w-1.5 bg-green-500 animate-pulse rounded-full" />
//                <span className="font-jetbrains-mono text-[9px] font-bold text-neutral-950">ONLINE</span>
//             </div>
//           </div>

//           <div className="py-8 text-center">
//              <div className="font-space-grotesk text-5xl sm:text-6xl font-bold text-neutral-950 tracking-tighter">
//                 {Math.floor(val)}<span className="text-2xl text-neutral-400">%</span>
//              </div>
//              <p className="font-jetbrains-mono text-[10px] text-neutral-400 mt-1">CPU_LOAD_OPTIMIZED</p>
//           </div>

//           <div className="space-y-2">
//             <div className="w-full bg-neutral-200 h-1.5">
//                <div 
//                   className="h-full bg-neutral-950 transition-all duration-500 ease-out" 
//                   style={{ width: `${val}%` }}
//                />
//             </div>
//             <div className="flex justify-between font-jetbrains-mono text-[8px] text-neutral-400">
//                <span>0%</span>
//                <span>THRESHOLD: 90%</span>
//             </div>
//           </div>
//         </div>
//       </CornerFrame>
//     </div>
//   );
// }

// /* ---------------- Main Section ---------------- */
// export default function CodeShowcase() {
//   return (
//     <section className="mt-32 px-6 lg:mt-48">
//       <div className="mx-auto max-w-7xl">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
//           {/* Left: Content */}
//           <div className="max-w-xl">
//             <h2 className="font-space-grotesk text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl">
//               Precision engineering <br />
//               <span className="text-neutral-400">for complex systems.</span>
//             </h2>

//             <p className="mt-6 text-lg font-light leading-relaxed text-neutral-600">
//               We don't just write scripts; we architect scalable ecosystems. 
//               Real-time synchronization, heavy-load optimization, and 
//               industrial-grade reliability come standard.
//             </p>

//             <div className="mt-10 flex flex-wrap gap-3 font-jetbrains-mono text-xs text-neutral-950">
//               {["[ NEXT.JS ]", "[ TURBOREPO ]", "[ TYPESCRIPT ]", "[ RUST ]"].map((tech) => (
//                 <span key={tech} className="bg-neutral-50 border border-neutral-100 px-3 py-1.5">
//                   {tech}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Right: The Machine (Stacked Layout) */}
//           <div className="relative w-full flex flex-col gap-12 lg:gap-0">
              
//               {/* IDE sits normally */}
//               <CodeWindow />
              
//               {/* Monitor sits lower and slightly shifted on Large screens only */}
//               <div className="lg:mt-[-40px] lg:pl-16 relative z-30">
//                 <VisualPreview />
//               </div>

//               {/* Background Grid Accent */}
//               <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none -z-10" />
//           </div>
//         </div>
//       </div>

//       <style jsx global>{`
//         .scrollbar-thin::-webkit-scrollbar {
//           height: 4px;
//         }
//         .scrollbar-thin::-webkit-scrollbar-track {
//           background: #171717;
//         }
//         .scrollbar-thin::-webkit-scrollbar-thumb {
//           background: #404040;
//           border-radius: 2px;
//         }
//       `}</style>
//     </section>
//   );
// }