"use client";

import React, { useState } from "react";
import { generateDoc } from "../../src/templates/renderDocument";
import { downloadFile } from "../../src/utils/downloadDoc";
import DynamicForm from "../../src/components/DynamicForm";

export default function BuilderPage() {
  const [meta, setMeta] = useState<any>({
    title: "Custom Document",
    customer: "",
    date: new Date().toISOString().split("T")[0],
    createdBy: "",
    logo: null,
  });

  const [sections, setSections] = useState<any[]>([]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMeta({ ...meta, logo: event.target?.result });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const addTextSection = () => {
    setSections([...sections, { type: "text", title: "New Text Section", content: "" }]);
  };

  const addTableSection = () => {
    setSections([...sections, {
      type: "table",
      title: "New Table Section",
      columns: ["Sr No", "Column 1", "Column 2"],
      rows: [{}],
    }]);
  };

  const addSignatureSection = () => {
    setSections([...sections, {
      type: "signature",
      title: "Signature Section",
      fields: [
        { label: "Name", value: "" },
        { label: "Role", value: "" },
        { label: "Date", value: "" }
      ],
    }]);
  };

  const handleDownload = async () => {
    try {
      const blob = await generateDoc({ meta, sections });
      downloadFile(blob, `${meta.title || "CustomDoc"}.docx`);
    } catch (err) {
      console.error("Failed to generate document:", err);
      alert("Error generating document.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-12 space-y-12 bg-white dark:bg-black min-h-screen border-x border-zinc-100 dark:border-zinc-900 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight">
            Document Builder
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide">Custom Document Generation System</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 text-lg"
          >
            Export Word
          </button>
        </div>
      </header>

      <section className="bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-3xl border border-indigo-100 dark:border-indigo-900/20 space-y-6">
        <h2 className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-1">Global Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-indigo-500 uppercase">Logo Upload</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-all cursor-pointer"
            />
          </div>
          <div className="space-y-2 lg:col-span-1">
             <label className="text-[10px] font-bold text-indigo-500 uppercase">Document Title</label>
            <input
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              placeholder="Document Title..."
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-indigo-500 uppercase">Client Name</label>
            <input
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              placeholder="Client Name..."
              value={meta.customer}
              onChange={(e) => setMeta({ ...meta, customer: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-indigo-500 uppercase">Effective Date</label>
            <input
              type="date"
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              value={meta.date}
              onChange={(e) => setMeta({ ...meta, date: e.target.value })}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
        <div className="space-y-12 min-h-[400px] bg-zinc-50 dark:bg-zinc-900/20 p-8 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-400">
              <span className="text-6xl mb-4 opacity-50">📄</span>
              <p className="font-black text-xl italic tracking-tight uppercase">Empty Document</p>
              <p className="text-sm font-medium">Add sections from the sidebar to begin.</p>
            </div>
          ) : (
            <DynamicForm sections={sections} setSections={setSections} />
          )}
        </div>

        <aside className="space-y-4 sticky top-12 self-start bg-zinc-50 dark:bg-zinc-900/40 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2 mb-4">Toolbar</h3>
          <button
            onClick={addTextSection}
            className="w-full p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all text-left flex items-center gap-4 group"
          >
            <span className="text-2xl group-hover:scale-125 transition-transform">📝</span>
            <span className="font-bold text-xs uppercase tracking-tight">Add Text Area</span>
          </button>
          <button
            onClick={addTableSection}
            className="w-full p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all text-left flex items-center gap-4 group"
          >
            <span className="text-2xl group-hover:scale-125 transition-transform">📊</span>
            <span className="font-bold text-xs uppercase tracking-tight">Add Data Table</span>
          </button>
          <button
            onClick={addSignatureSection}
            className="w-full p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10 transition-all text-left flex items-center gap-4 group"
          >
            <span className="text-2xl group-hover:scale-125 transition-transform">✍️</span>
            <span className="font-bold text-xs uppercase tracking-tight">Add Signature</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
