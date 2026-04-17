"use client";

import React, { useEffect, useMemo, useState } from "react";
import { generateDoc } from "../../src/templates/renderDocument";
import { downloadFile } from "../../src/utils/downloadDoc";
import DynamicForm from "../../src/components/DynamicForm";
import { Responsive, WidthProvider } from "react-grid-layout/legacy";
import type { LayoutItem } from "react-grid-layout/legacy";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const GridLayout = WidthProvider(Responsive);

const normalizeHeading = (line: string) =>
  line.replace(/^\s*\d+[.)]\s*/, "").trim();

const buildTocContent = (titles: string[]) =>
  titles.map((title, index) => `${index + 1}. ${title}`).join("\n");

const sectionExistsByTitle = (sections: any[], title: string) =>
  sections.some(
    (section) =>
      section.id !== "toc" &&
      section.type !== "signature" &&
      String(section.title || "").trim().toLowerCase() === title.toLowerCase()
  );

const syncTocSection = (sections: any[]) => {
  const tocIndex = sections.findIndex((section) => section.id === "toc");
  if (tocIndex < 0) return sections;

  const titles = sections
    .filter((section) => section.id !== "toc" && section.type !== "signature")
    .map((section) => String(section.title || "").trim())
    .filter(Boolean);

  const next = [...sections];
  next[tocIndex] = {
    ...next[tocIndex],
    content: buildTocContent(titles),
  };
  return next;
};

const insertTextSectionBelowAcceptance = (sections: any[], title: string) => {
  const acceptanceIndex = sections.findIndex((section) => section.id === "acceptance");
  const acceptanceSection = acceptanceIndex >= 0 ? sections[acceptanceIndex] : null;
  const baseY = acceptanceSection
    ? (acceptanceSection.layout?.y || 0) + (acceptanceSection.layout?.h || 0) + 1
    : Math.max(...sections.map((section) => (section.layout?.y || 0) + (section.layout?.h || 0)), 0) + 1;

  const newSectionHeight = 6;
  const shiftBy = newSectionHeight + 1;
  const nextSection = {
    id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: "text",
    title,
    content: "",
    layout: { x: 0, y: baseY, w: 12, h: newSectionHeight },
  };

  const shifted = sections.map((section) => {
    if (section.id === "toc") return section;
    const y = section.layout?.y || 0;
    if (y >= baseY) {
      return {
        ...section,
        layout: {
          ...section.layout,
          y: y + shiftBy,
        },
      };
    }
    return section;
  });

  if (acceptanceIndex >= 0) {
    return [
      ...shifted.slice(0, acceptanceIndex + 1),
      nextSection,
      ...shifted.slice(acceptanceIndex + 1),
    ];
  }

  return [...shifted, nextSection];
};

export default function SowPage() {
  const [meta, setMeta] = useState<any>({
    title: "Project Scope of Work (SOW)",
    customer: "L&T Finance Ltd.",
    date: new Date().toISOString().split("T")[0],
    createdBy: "Atharva Sathe",
    logo: null,
    hasBorder: true,
  });

  const [sections, setSections] = useState<any[]>([
    {
      id: "toc",
      type: "text",
      title: "Table of Contents",
      content: "",
      layout: { x: 0, y: 0, w: 12, h: 6 }
    },
    {
      id: "objectives",
      type: "text",
      title: "Project Objectives",
      content: `1. Define project implementation scope\n2. Confirm delivery milestones and responsibilities\n3. Ensure formal acceptance criteria are agreed`,
      layout: { x: 0, y: 7, w: 12, h: 6 }
    },
    {
      id: "deliverables",
      type: "table",
      title: "Deliverables Schedule",
      columns: ["Sr No", "Milestone", "Deadline", "Responsibility"],
      rows: [
        { "Sr No": "1", Milestone: "Requirements Finalization", Deadline: "Week 1", Responsibility: "Project Manager" },
        { "Sr No": "2", Milestone: "Implementation", Deadline: "Week 2", Responsibility: "Engineering Team" },
        { "Sr No": "3", Milestone: "Testing and Validation", Deadline: "Week 3", Responsibility: "QA Team" },
        { "Sr No": "4", Milestone: "Handover and Sign-off", Deadline: "Week 4", Responsibility: "Delivery Lead" }
      ],
      layout: { x: 0, y: 14, w: 12, h: 14 }
    },
    {
      id: "acceptance",
      type: "text",
      title: "Formal Acceptance",
      content:
        "By signing this document, the client acknowledges that the work detailed above has been completed as per the agreed Scope of Work (SOW) and is deemed satisfactory.",
      layout: { x: 0, y: 30, w: 12, h: 6 }
    },
    {
      id: "signoff",
      type: "signature",
      title: "Project Sign-off",
      fields: [
        { label: "Name", value: "" },
        { label: "Role", value: "" },
        { label: "Signature", value: "" },
        { label: "Date", value: "" },
      ],
      layout: { x: 0, y: 37, w: 12, h: 8 }
    },
  ]);

  useEffect(() => {
    setSections((prev) => syncTocSection(prev));
  }, []);

  const updateSection = (idx: number, updated: any) => {
    setSections((prev) => {
      const next = [...prev];
      next[idx] = updated;
      return syncTocSection(next);
    });
  };

  const generateHeadersFromTocRows = () => {
    setSections((prev) => {
      const tocSection = prev.find((section) => section.id === "toc");
      if (!tocSection) return prev;

      const requestedHeadings = String(tocSection.content || "")
        .split("\n")
        .map(normalizeHeading)
        .filter(Boolean);

      let next = [...prev];
      requestedHeadings.forEach((heading) => {
        if (!sectionExistsByTitle(next, heading)) {
          next = insertTextSectionBelowAcceptance(next, heading);
        }
      });

      return syncTocSection(next);
    });
  };

  const addSectionBelowAcceptance = () => {
    setSections((prev) => {
      const next = insertTextSectionBelowAcceptance(prev, "New Section Header");
      return syncTocSection(next);
    });
  };

  const displaySections = useMemo(() => sections, [sections]);
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMeta({ ...meta, logo: event.target?.result as ArrayBuffer });
      };
      reader.readAsArrayBuffer(file);
    }
  };
  
  const handleDownload = async () => {
    try {
      const blob = await generateDoc({ meta, sections: displaySections });
      downloadFile(blob, `SOW_${meta.customer || "Project"}.docx`);
    } catch (err) {
      console.error("Failed to generate document:", err);
      alert("Error generating document. Check console for details.");
    }
  };
  const removeSection = (idx: number) => {
    setSections((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return syncTocSection(next);
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12 pb-20">
      <header className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-4xl font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
            SOW Generator
          </h1>
          <p className="text-zinc-500 font-medium italic">Automated Professional Document Generator</p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
        >
          Generate Word (.docx)
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Company Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Customer Name</label>
          <input
            className="w-full bg-white dark:bg-zinc-950 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
            value={meta.customer}
            onChange={(e) => setMeta({ ...meta, customer: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Document Title</label>
          <input
            className="w-full bg-white dark:bg-zinc-950 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
            value={meta.title}
            onChange={(e) => setMeta({ ...meta, title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Effective Date</label>
          <input
            type="date"
            className="w-full bg-white dark:bg-zinc-950 border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all"
            value={meta.date}
            onChange={(e) => setMeta({ ...meta, date: e.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Page Border</label>
          <div className="flex bg-white dark:bg-zinc-950 border rounded-xl p-1 gap-1 h-[50px]">
            <button
              onClick={() => setMeta({ ...meta, hasBorder: true })}
              className={`flex-1 py-1 text-[10px] font-black rounded-lg transition-all ${meta.hasBorder ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
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
      </section>
      <section className="flex flex-col md:flex-row gap-3 md:items-center md:justify-end">
         
        <button
          onClick={addSectionBelowAcceptance}
          className="w-full md:w-auto py-2 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl       bg-blue-600 hover:bg-blue-700 text-white"
        >
          + Add Section Below Formal Acceptance
        </button>
      </section>
      <div className="flex justify-left">
       <section className="w-full p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
  <GridLayout
    layouts={{
      lg: sections.map((s) => ({
        i: s.id,
        ...s.layout,
      })),
    }}
    cols={{ lg: 12 }}
    breakpoints={{ lg: 1200 }}
    rowHeight={30}
    draggableHandle=".drag-handle"
    onLayoutChange={(newLayout) => {
      const layoutItems = newLayout as readonly LayoutItem[];
      const updated = sections.map((sec) => {
        const l = layoutItems.find((x) => x.i === sec.id);
        return l ? { ...sec, layout: l } : sec;
      });
      setSections(updated);
    }}
  >
   {displaySections.map((section, index) => (
              <div key={section.id}>
                <DynamicForm
                  section={section}
                  index={index}
                  updateSection={updateSection}
                  removeSection={removeSection}
                  handleImageUpload={() => {}}
                />
              </div>
            ))}
  </GridLayout>
</section>
    </div>        
    </div>
  );
}
