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
    setSection({
      ...section,
      rows: [...section.rows, {}],
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

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
      {section.title && <h3 className="text-lg font-bold">{section.title}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800">
              {section.columns.map((col) => (
                <th key={col} className="p-2 border border-zinc-300 dark:border-zinc-700 font-semibold uppercase tracking-wider text-xs">
                  {col}
                </th>
              ))}
              <th className="p-2 border border-zinc-300 dark:border-zinc-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, i) => (
              <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="p-2 border border-zinc-300 dark:border-zinc-700 text-center font-medium bg-zinc-50 dark:bg-zinc-800/30">
                  {i + 1}
                </td>
                {section.columns.slice(1).map((col) => (
                  <td key={col} className="p-2 border border-zinc-300 dark:border-zinc-700">
                    <input
                      className="w-full p-1 bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded outline-none"
                      placeholder={`Enter ${col.toLowerCase()}...`}
                      value={row[col] || ""}
                      onChange={(e) => updateCell(i, col, e.target.value)}
                    />
                  </td>
                ))}
                <td className="p-2 border border-zinc-300 dark:border-zinc-700 text-center">
                  <button
                    onClick={() => removeRow(i)}
                    className="text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
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
        className="w-full py-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-all font-medium"
      >
        + Add New Row
      </button>
    </div>
  );
}
