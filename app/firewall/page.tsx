"use client";

import React, { useState } from "react";
import { generateDoc } from "../../src/templates/renderDocument";
import { downloadFile } from "../../src/utils/downloadDoc";
import DynamicForm from "../../src/components/DynamicForm";

export default function FirewallPage() {
  const [meta, setMeta] = useState<any>({
    title: "Firewall Deployment Configuration",
    customer: "",
    date: new Date().toISOString().split("T")[0],
    createdBy: "",
    logo: null,
    hasBorder: true,
  });

  const [sections, setSections] = useState<any[]>([
    {
      type: "table",
      title: "Scope of Work & Technical Details",
      columns: ["Sr No", "Description", "Technical Specification", "Comments"],
      rows: [
        { Description: "Internal Firewall Policy", "Technical Specification": "Layer 7 inspection enabled", Comments: "" },
        { Description: "DMZ Access Rules", "Technical Specification": "Strict outbound only", Comments: "" }
      ],
    },
    {
      type: "signature",
      title: "Approval Signatures",
      fields: [
        { label: "Engineer Name", value: "" },
        { label: "Role", value: "Security Architect" },
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
      downloadFile(blob, `Firewall_${meta.customer || "Config"}.docx`);
    } catch (err) {
      console.error("Failed to generate document:", err);
      alert("Error generating document.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-12 pb-20">
      <header className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-4xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
            Firewall Deployment
          </h1>
          <p className="text-zinc-500 font-medium italic">Automated Document Generator</p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
        >
          Generate Word (.docx)
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Company Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Customer Name</label>
          <input
            className="w-full bg-white dark:bg-zinc-950 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            placeholder="Client Name..."
            value={meta.customer}
            onChange={(e) => setMeta({ ...meta, customer: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document Title</label>
          <input
            className="w-full bg-white dark:bg-zinc-950 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            placeholder="Title..."
            value={meta.title}
            onChange={(e) => setMeta({ ...meta, title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Effective Date</label>
          <input
            type="date"
            className="w-full bg-white dark:bg-zinc-950 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            value={meta.date}
            onChange={(e) => setMeta({ ...meta, date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Page Border</label>
          <div className="flex bg-white dark:bg-zinc-950 border rounded-xl p-1 gap-1">
            <button
              onClick={() => setMeta({ ...meta, hasBorder: true })}
              className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${meta.hasBorder ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            >
              ON
            </button>
            <button
              onClick={() => setMeta({ ...meta, hasBorder: false })}
              className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${!meta.hasBorder ? "bg-zinc-400 text-white" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            >
              OFF
            </button>
          </div>
        </div>
      </section>

      <DynamicForm sections={sections} setSections={setSections} />
    </div>
  );
}
