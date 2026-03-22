"use client";

import React from "react";
import TableInput from "./TableInput";

interface Section {
  id: string;
  type: "text" | "table" | "signature";
  title?: string;
  content?: string;
  columns?: string[];
  rows?: Record<string, any>[];
  fields?: { label: string; value: string }[];
  layout: any;
}

interface DynamicFormProps {
  section: Section;
  index: number;
  updateSection: (index: number, updated: Section) => void;
  removeSection: (index: number) => void;
}

export default function DynamicForm({ section, index, updateSection, removeSection }: DynamicFormProps) {
  return (
    <div className="relative group/section h-full overflow-hidden">
      {/* Drag Handle & Delete Button Container */}
      <div className="absolute top-2 right-2 flex gap-2 z-30 opacity-0 group-hover/section:opacity-100 transition-opacity">
        <div className="drag-handle cursor-move bg-indigo-500 text-white p-2 rounded-lg shadow-lg hover:bg-indigo-600 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
            <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
          </svg>
        </div>
        <button 
          className="bg-red-500 text-white p-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors cursor-pointer" 
          onClick={() => removeSection(index)}
          title="Delete Section"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div className="h-full">
        {section.type === "text" && (
          <div className="h-full space-y-2 p-6 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm flex flex-col">
            <input
              className="text-lg font-black uppercase tracking-tight bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded outline-none w-full"
              value={section.title || "Text Section"}
              onChange={(e) => updateSection(index, { ...section, title: e.target.value })}
            />
            <textarea
              className="flex-1 w-full p-4 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-zinc-700 dark:text-zinc-300 resize-none"
              placeholder="Enter content..."
              value={section.content || ""}
              onChange={(e) => updateSection(index, { ...section, content: e.target.value })}
            />
          </div>
        )}

        {section.type === "table" && (
          <div className="h-full overflow-auto">
            <TableInput
              section={section as any}
              setSection={(updated) => updateSection(index, updated as any)}
            />
          </div>
        )}

        {section.type === "signature" && (
          <div className="h-full space-y-4 p-6 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm transition-all overflow-auto">
            <div className="flex justify-between items-center pr-20">
              <input
                className="text-lg font-black uppercase tracking-tight bg-transparent border-none focus:ring-1 focus:ring-indigo-500 rounded outline-none w-1/2"
                value={section.title || "Signatures"}
                onChange={(e) => updateSection(index, { ...section, title: e.target.value })}
              />
              <button 
                onClick={() => {
                  const updatedFields = [...(section.fields || []), { label: "New Field", value: "" }];
                  updateSection(index, { ...section, fields: updatedFields });
                }}
                className="text-[10px] font-bold bg-indigo-500 text-white px-3 py-1 rounded-full hover:bg-indigo-600 transition-colors uppercase tracking-widest"
              >
                + Add Signatory
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 relative">
              {(section.fields || []).map((field, idx) => (
                <div key={idx} className="space-y-2 group/field relative">
                  <button 
                    onClick={() => {
                      const updatedFields = (section.fields || []).filter((_, fIdx) => fIdx !== idx);
                      updateSection(index, { ...section, fields: updatedFields });
                    }}
                    className="absolute -top-2 -right-2 hidden group-hover/field:flex bg-red-500 text-white w-5 h-5 rounded-full items-center justify-center text-[10px] z-10 shadow-md hover:scale-110 transition-all cursor-pointer border-2 border-white dark:border-zinc-900"
                    title="Remove Signatory"
                  >
                    ✕
                  </button>
                  <input
                    className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-transparent border-none focus:ring-1 focus:ring-indigo-300 rounded outline-none w-full"
                    value={field.label}
                    onChange={(e) => {
                      const updatedFields = [...(section.fields || [])];
                      updatedFields[idx] = { ...field, label: e.target.value };
                      updateSection(index, { ...section, fields: updatedFields });
                    }}
                  />
                  <input
                    className="w-full bg-white dark:bg-zinc-950 border p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-zinc-700 dark:text-zinc-300"
                    placeholder={`Enter ${field.label}...`}
                    value={field.value || ""}
                    onChange={(e) => {
                      const updatedFields = [...(section.fields || [])];
                      updatedFields[idx] = { ...field, value: e.target.value };
                      updateSection(index, { ...section, fields: updatedFields });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
