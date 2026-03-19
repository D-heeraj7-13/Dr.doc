"use client";

import React from "react";
import TableInput from "./TableInput";

interface Section {
  type: "text" | "table" | "signature";
  title?: string;
  content?: string;
  columns?: string[];
  rows?: Record<string, any>[];
  fields?: string[];
}

interface DynamicFormProps {
  sections: Section[];
  setSections: (sections: Section[]) => void;
}

export default function DynamicForm({ sections, setSections }: DynamicFormProps) {
  const updateSection = (index: number, updated: Section) => {
    const next = [...sections];
    next[index] = updated;
    setSections(next);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {sections.map((section, i) => (
        <div key={i} className="relative group/section">
          {/* Main Section Delete Button */}
          <button 
            className="absolute -left-12 top-0 hidden group-hover/section:flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm z-20 cursor-pointer" 
            onClick={() => removeSection(i)}
            title="Delete Section"
          >
            ✕
          </button>
          
          {section.type === "text" && (
            <div className="space-y-2 p-6 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
              <input
                className="text-lg font-black uppercase tracking-tight bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded outline-none w-full"
                value={section.title || "Text Section"}
                onChange={(e) => updateSection(i, { ...section, title: e.target.value })}
              />
              <textarea
                className="w-full p-4 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[140px] transition-all text-zinc-700 dark:text-zinc-300"
                placeholder="Enter content..."
                value={section.content || ""}
                onChange={(e) => updateSection(i, { ...section, content: e.target.value })}
              />
            </div>
          )}

          {section.type === "table" && (
            <TableInput
              section={section as any}
              setSection={(updated) => updateSection(i, updated as any)}
            />
          )}

          {section.type === "signature" && (
            <div className="space-y-4 p-6 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm transition-all">
              <div className="flex justify-between items-center">
                <input
                  className="text-lg font-black uppercase tracking-tight bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded outline-none w-1/2"
                  value={section.title || "Signatures"}
                  onChange={(e) => updateSection(i, { ...section, title: e.target.value })}
                />
                <button 
                  onClick={() => {
                    const updatedFields = [...(section.fields || []), { label: "New Field", value: "" }];
                    updateSection(i, { ...section, fields: updatedFields });
                  }}
                  className="text-[10px] font-bold bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors uppercase tracking-widest"
                >
                  + Add Signatory
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 border border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 relative">
                {(section.fields || []).map((field, idx) => (
                  <div key={idx} className="space-y-2 group/field relative">
                    <button 
                      onClick={() => {
                        const updatedFields = (section.fields || []).filter((_, fIdx) => fIdx !== idx);
                        updateSection(i, { ...section, fields: updatedFields });
                      }}
                      className="absolute -top-3 -right-3 hidden group-hover/field:flex bg-red-500 text-white w-6 h-6 rounded-full items-center justify-center text-[10px] z-10 shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-zinc-900"
                      title="Remove Signatory"
                    >
                      ✕
                    </button>
                    <input
                      className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-transparent border-none focus:ring-1 focus:ring-blue-300 rounded outline-none w-full"
                      value={field.label}
                      onChange={(e) => {
                        const updatedFields = [...(section.fields || [])];
                        updatedFields[idx] = { ...field, label: e.target.value };
                        updateSection(i, { ...section, fields: updatedFields });
                      }}
                    />
                    <input
                      className="w-full bg-white dark:bg-zinc-950 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-zinc-700 dark:text-zinc-300"
                      placeholder={`Enter ${field.label}...`}
                      value={field.value || ""}
                      onChange={(e) => {
                        const updatedFields = [...(section.fields || [])];
                        updatedFields[idx] = { ...field, value: e.target.value };
                        updateSection(i, { ...section, fields: updatedFields });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
