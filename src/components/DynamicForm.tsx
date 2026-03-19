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
        <div key={i} className="relative group">
          <div className="absolute -left-10 top-0 hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 hover:text-red-700 transition-colors cursor-pointer" onClick={() => removeSection(i)}>
            ✕
          </div>
          
          {section.type === "text" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">{section.title || "Text Section"}</label>
              <textarea
                className="w-full p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px] transition-all"
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
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">{section.title || "Signatures"}</label>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 relative">
                {(section.fields || []).map((field, idx) => (
                  <div key={idx} className="space-y-2 group/field relative">
                    <button 
                      onClick={() => {
                        const updatedFields = section.fields?.filter((_, fIdx) => fIdx !== idx);
                        updateSection(i, { ...section, fields: updatedFields });
                      }}
                      className="absolute -top-2 -right-2 hidden group-hover/field:flex bg-red-500 text-white w-5 h-5 rounded-full items-center justify-center text-[8px] z-10"
                    >
                      ✕
                    </button>
                    <input
                      className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-transparent border-none focus:ring-1 focus:ring-blue-300 rounded outline-none w-full"
                      value={field.label}
                      onChange={(e) => {
                        const updatedFields = [...(section.fields || [])];
                        updatedFields[idx] = { ...field, label: e.target.value };
                        updateSection(i, { ...section, fields: updatedFields });
                      }}
                    />
                    <input
                      className="w-full bg-white dark:bg-zinc-950 border p-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
