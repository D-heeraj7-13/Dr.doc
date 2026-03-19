"use client";

import React from "react";

interface TableSection {
  type: "table";
  title?: string;
  columns: string[];
  rows: Record<string, any>[];
}

interface TableInputProps {
  section: TableSection;
  setSection: (section: TableSection) => void;
}

export default function TableInput({ section, setSection }: TableInputProps) {
  const addRow = () => {
    const newRow: Record<string, string> = {};
    section.columns.forEach(col => { if(col !== "Sr No") newRow[col] = ""; });
    setSection({
      ...section,
      rows: [...section.rows, newRow],
    });
  };

  const removeRow = (index: number) => {
    const updated = section.rows.filter((_, i) => i !== index);
    setSection({ ...section, rows: updated });
  };

  const updateCell = (index: number, col: string, value: string) => {
    const updated = [...section.rows];
    updated[index] = { ...updated[index], [col]: value };
    setSection({ ...section, rows: updated });
  };

  const updateHeader = (colIdx: number, newValue: string) => {
    if (colIdx === 0) return; // Don't edit "Sr No"
    const oldName = section.columns[colIdx];
    const newColumns = [...section.columns];
    newColumns[colIdx] = newValue;

    // Update all rows to use the new key name
    const newRows = section.rows.map(row => {
      const newRow = { ...row };
      newRow[newValue] = row[oldName];
      delete newRow[oldName];
      return newRow;
    });

    setSection({ ...section, columns: newColumns, rows: newRows });
  };

  const addColumn = () => {
    const newColName = `Column ${section.columns.length}`;
    setSection({
      ...section,
      columns: [...section.columns, newColName],
      rows: section.rows.map(row => ({ ...row, [newColName]: "" }))
    });
  };

  return (
    <div className="space-y-4 p-6 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm transition-all">
      <div className="flex justify-between items-center px-1">
        <input 
          className="text-lg font-black uppercase tracking-tight bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded outline-none w-1/2"
          value={section.title || "Data Table"}
          onChange={(e) => setSection({...section, title: e.target.value})}
        />
        <button 
          onClick={addColumn}
          className="text-[10px] font-bold bg-zinc-800 text-white px-3 py-1 rounded-full hover:bg-black transition-colors uppercase tracking-widest"
        >
          + Add Column
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800/50">
              {section.columns.map((col, idx) => (
                <th key={idx} className="p-3 border-b border-zinc-200 dark:border-zinc-700">
                  {idx === 0 ? (
                    <span className="font-black text-[10px] uppercase text-zinc-400">{col}</span>
                  ) : (
                    <input 
                      className="font-black text-[10px] uppercase tracking-widest bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded outline-none w-full"
                      value={col}
                      onChange={(e) => updateHeader(idx, e.target.value)}
                    />
                  )}
                </th>
              ))}
              <th className="p-3 border-b border-zinc-200 dark:border-zinc-700 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, i) => (
              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors group">
                <td className="p-3 border-b border-zinc-100 dark:border-zinc-800 text-center font-bold text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/10 w-12">
                  {i + 1}
                </td>
                {section.columns.slice(1).map((col) => (
                  <td key={col} className="p-3 border-b border-zinc-100 dark:border-zinc-800">
                    <input
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded outline-none text-zinc-700 dark:text-zinc-300"
                      placeholder="..."
                      value={row[col] || ""}
                      onChange={(e) => updateCell(i, col, e.target.value)}
                    />
                  </td>
                ))}
                <td className="p-3 border-b border-zinc-100 dark:border-zinc-800 text-center">
                  <button
                    onClick={() => removeRow(i)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Remove Row"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <button
        onClick={addRow}
        className="w-full py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-all font-bold uppercase text-[10px] tracking-widest"
      >
        + Insert New Row
      </button>
    </div>
  );
}
