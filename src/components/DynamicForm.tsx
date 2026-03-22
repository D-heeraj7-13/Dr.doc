"use client";

import React from "react";
import TableInput from "./TableInput";

interface Section {
  id: string;
  type: "text" | "table" | "signature" | "image";
  title?: string;
  content?: string;
  columns?: string[];
  rows?: Record<string, any>[];
  fields?: { label: string; value: string }[];
  image?: string | null;
  layout: any;
}

interface DynamicFormProps {
  section: Section;
  index: number;
  updateSection: (index: number, updated: Section) => void;
  removeSection: (index: number) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, sectionId?: string) => void;
}

export default function DynamicForm({ section, index, updateSection, removeSection, handleImageUpload }: DynamicFormProps) {
  if (!section) return null;
  return (
    <div className="relative group/section h-full overflow-hidden bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
      <div className="absolute top-2 right-2 flex gap-2 z-30 opacity-0 group-hover/section:opacity-100 transition-opacity">
        <div className="drag-handle cursor-move bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
            <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
          </svg>
        </div>
        <button className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors" onClick={() => removeSection(index)}>
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="h-full p-4 flex flex-col">
        <input className="font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tight bg-transparent border-none outline-none mb-2" value={section.title} onChange={(e) => updateSection(index, { ...section, title: e.target.value })} />

        {section.type === "text" && (
          <textarea className="flex-1 w-full p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl outline-none resize-none text-sm" placeholder="Content..." value={section.content} onChange={(e) => updateSection(index, { ...section, content: e.target.value })} />
        )}

        {section.type === "table" && (
          <div className="h-full overflow-auto">
             <TableInput section={section as any} setSection={(updated) => updateSection(index, updated as any)} />
          </div>
        )}

        {section.type === "image" && (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50/30 overflow-hidden relative">
            {section.image ? (
              <img src={section.image} alt="Preview" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center p-4">
                <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Upload PNG/JPG</p>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, section.id)} className="text-[10px] text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-indigo-100 file:text-indigo-600 cursor-pointer" />
              </div>
            )}
            {section.image && (
              <button onClick={() => updateSection(index, { ...section, image: null })} className="absolute top-2 left-2 bg-black/50 text-white p-1 rounded-md text-[8px] uppercase font-bold backdrop-blur-sm">Replace</button>
            )}
          </div>
        )}

        {section.type === "signature" && (
          <div className="flex-1">
            <div className="flex justify-end mb-2">
               <button onClick={() => updateSection(index, { ...section, fields: [...(section.fields || []), { label: "Role", value: "" }] })} className="text-[8px] font-bold bg-indigo-500 text-white px-2 py-1 rounded-full uppercase tracking-widest">+ Signatory</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {(section.fields || []).map((f, idx) => (
                <div key={idx} className="space-y-1">
                  <input className="text-[9px] font-bold text-zinc-400 uppercase border-none bg-transparent outline-none w-full" value={f.label} onChange={(e) => {
                    const next = [...(section.fields || [])];
                    next[idx] = { ...f, label: e.target.value };
                    updateSection(index, { ...section, fields: next });
                  }} />
                  <input className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 p-2 rounded-lg text-xs outline-none" value={f.value} onChange={(e) => {
                    const next = [...(section.fields || [])];
                    next[idx] = { ...f, value: e.target.value };
                    updateSection(index, { ...section, fields: next });
                  }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
