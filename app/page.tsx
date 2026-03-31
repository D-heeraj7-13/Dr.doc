import Link from "next/link";

export default function Home() {
  const tools = [
    {
      title: "Firewall Deployment",
      desc: "Configuration & SOW for firewall setups.",
      href: "/firewall",
      icon: "🛡️",
      color: "blue",
    },
    {
      title: "Scope of Work (SOW)",
      desc: "Executive summaries & project milestones.",
      href: "/sow",
      icon: "📄",
      color: "emerald",
    },
    {
      title: "Custom Builder",
      desc: "Dynamic document generator (Power Mode).",
      href: "/builder",
      icon: "🏗️",
      color: "indigo",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-indigo-500 selection:text-white">
      <main className="flex flex-1 flex-col items-center justify-center py-20 px-8">
        <div className="max-w-4xl w-full text-center space-y-8">
          <header className="space-y-4">
            <h1 className="text-7xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 uppercase italic">
              Doc <span className="text-indigo-600 not-italic">Gen</span>
            </h1>
            <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto tracking-tight leading-relaxed">
              Generate professional Microsoft Word documents directly from your browser. 
              Automated serial numbering, signature sections, and dynamic tables included.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all hover:-translate-y-2 overflow-hidden text-left"
              >
                <div className={`text-5xl mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  {tool.icon}
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-2 uppercase tracking-tight">
                  {tool.title}
                </h3>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                  {tool.desc}
                </p>
                
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-indigo-600 text-2xl">→</span>
                </div>
              </Link>
            ))}
          </div>

          <footer className="pt-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-200/50 dark:bg-zinc-900/50 border border-zinc-300/50 dark:border-zinc-800/50 text-xs font-black uppercase tracking-widest text-zinc-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Production Ready Engine v2.0
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
