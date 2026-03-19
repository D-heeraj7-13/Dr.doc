"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { generateDoc } from "../../src/templates/renderDocument";
import { downloadFile } from "../../src/utils/downloadDoc";
import DynamicForm from "../../src/components/DynamicForm";

const ServerRackModel = dynamic(() => import("../../src/components/ServerRackModel"), { ssr: false });

export default function SowPage() {
  const [meta, setMeta] = useState<any>({
    title: "Project Scope of Work (SOW)",
    customer: "",
    date: new Date().toISOString().split("T")[0],
    createdBy: "",
    logo: null,
    hasBorder: true,
  });

  const [sections, setSections] = useState<any[]>([
    {
      type: "text",
      title: "Executive Summary",
      content: "Brief overview of project goals...",
    },
    {
      type: "text",
      title: "Project Objectives",
      content: `1. Objective One\n2. Objective Two`,
    },
    {
      type: "table",
      title: "Deliverables Schedule",
      columns: ["Sr No", "Milestone", "Deadline", "Responsibility"],
      rows: [
        { Milestone: "Initial Setup", Deadline: "Week 1", Responsibility: "Lead Engineer" },
        { Milestone: "Testing Phase", Deadline: "Week 3", Responsibility: "QA Team" }
      ],
    },
    {
      type: "signature",
      title: "Formal Acceptance",
      fields: [
        { label: "Authorized Signatory", value: "" },
        { label: "Designation", value: "" },
        { label: "Signature", value: "" },
        { label: "Date", value: new Date().toLocaleDateString() },
      ],
    },
  ]);

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

  const handleDownload = async () => {
    try {
      const blob = await generateDoc({ meta, sections });
      downloadFile(blob, `SOW_${meta.customer || "Project"}.docx`);
    } catch (err) {
      console.error("Failed to generate document:", err);
      alert("Error generating document.");
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background layer */}
      <div className="fixed inset-0 bg-white dark:bg-black -z-20" />

      {/* 3D Model layer */}
      <ServerRackModel />

      {/* Content layer */}
      <div className="relative z-10 max-w-5xl mx-auto p-8 space-y-12 pb-20">
        <header className="flex justify-between items-end border-b pb-6">
          <div>
            <h1 className="text-4xl font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
              SOW Generator
            </h1>
            <p className="text-zinc-500 font-medium italic">Professional Scope of Work Template</p>
          </div>
          <button
            onClick={handleDownload}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
          >
            Download SOW
          </button>
        </header>

        {/* <section className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-zinc-50/80 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner items-end backdrop-blur-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Client / Organization</label>
            <input
              className="w-full bg-white dark:bg-zinc-950 border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
              placeholder="Organization name..."
              value={meta.customer}
              onChange={(e) => setMeta({ ...meta, customer: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document Date</label>
            <input
              type="date"
              className="w-full bg-white dark:bg-zinc-950 border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all"
              value={meta.date}
              onChange={(e) => setMeta({ ...meta, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Page Border</label>
            <div className="flex bg-white dark:bg-zinc-950 border rounded-xl p-1 gap-1 h-[50px]">
              <button
                onClick={() => setMeta({ ...meta, hasBorder: true })}
                className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${meta.hasBorder ? "bg-emerald-600 text-white" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              >
                ON
              </button>
              <button
                onClick={() => setMeta({ ...meta, hasBorder: false })}
                className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${!meta.hasBorder ? "bg-zinc-400 text-white" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
              >
                OFF
              </button>
            </div>
          </div>
        </section> */}

        <div className="bg-white/50 dark:bg-zinc-950/50 rounded-3xl p-4 backdrop-blur-sm">
           <DynamicForm sections={sections} setSections={setSections} />
        </div>
      </div>
    </div>
  );
}
