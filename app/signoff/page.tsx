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

// ---------- helpers ----------
const normalizeHeading = (line: string) =>
  line.replace(/^\s*\d+[.)]\s*/, "").trim();

const buildTocContent = (titles: string[]) =>
  titles.map((t, i) => `${i + 1}. ${t}`).join("\n");

const syncToc = (sections: any[]) => {
  const tocIndex = sections.findIndex((s) => s.id === "toc");
  if (tocIndex < 0) return sections;

  const titles = sections
    .filter((s) => s.id !== "toc" && s.type !== "signature")
    .map((s) => s.title?.trim())
    .filter(Boolean);

  const next = [...sections];
  next[tocIndex].content = buildTocContent(titles);
  return next;
};

const insertBelowSignoff = (sections: any[], title: string) => {
  const signoffIndex = sections.findIndex((s) => s.id === "signoff");
  const baseY =
    signoffIndex >= 0
      ? sections[signoffIndex].layout.y +
      sections[signoffIndex].layout.h +
      1
      : Math.max(...sections.map((s) => s.layout.y + s.layout.h)) + 1;

  const newSection = {
    id: `sec-${Date.now()}`,
    type: "text",
    title,
    content: "",
    layout: { x: 0, y: baseY, w: 12, h: 6 },
  };

  return [...sections, newSection];
};

// ---------- main ----------
export default function SignoffPage() {
  const [meta, setMeta] = useState<any>({
    title: "Firewall Signoff & Applied Policy Details",
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
      layout: { x: 0, y: 0, w: 12, h: 6 },
    },

    {
      id: "design",
      type: "text",
      title: "Perimeter Firewall Design",
      content: "",
      layout: { x: 0, y: 7, w: 12, h: 6 },
    },

    {
      id: "scope",
      type: "table",
      title: "Configuration & Migration Scope",
      columns: ["Sr No", "Description", "SOW", "Comments"],
      rows: [
        {
          "Sr No": "1",
          Description: "Background",
          SOW: "Perimeter Firewall – Mahape",
          Comments: "",
        },
        {
          "Sr No": "2",
          Description: "Installation",
          SOW: "Rack & setup FortiGate 400F",
          Comments: "",
        },
        {
          "Sr No": "3",
          Description: "Initial Config",
          SOW: "Hostname, timezone, admin setup",
          Comments: "",
        },
      ],
      layout: { x: 0, y: 14, w: 12, h: 12 },
    },

    {
      id: "handover",
      type: "text",
      title: "Handover",
      content:
        "Knowledge transfer session will be provided along with reports.",
      layout: { x: 0, y: 27, w: 12, h: 6 },
    },

    {
      id: "closure",
      type: "text",
      title: "Project Closure",
      content:
        "After completion and acceptance, both parties sign closure milestone.",
      layout: { x: 0, y: 34, w: 12, h: 6 },
    },

    {
      id: "acceptance",
      type: "text",
      title: "Project Signoff",
      content:
        "By signing this document, the client acknowledges the work is completed as per agreed SOW.",
      layout: { x: 0, y: 41, w: 12, h: 6 },
    },

    {
      id: "signoff",
      type: "signature",
      title: "Client Sign-off",
      fields: [
        { label: "Name", value: "" },
        { label: "Role", value: "" },
        { label: "Signature", value: "" },
        { label: "Date", value: "" },
      ],
      layout: { x: 0, y: 48, w: 12, h: 8 },
    },
  ]);

  useEffect(() => {
    setSections((prev) => syncToc(prev));
  }, []);

  const updateSection = (i: number, updated: any) => {
    setSections((prev) => {
      const next = [...prev];
      next[i] = updated;
      return syncToc(next);
    });
  };

  const addSection = () => {
    setSections((prev) => syncToc(insertBelowSignoff(prev, "New Section")));
  };

  const handleDownload = async () => {
    const blob = await generateDoc({ meta, sections });
    downloadFile(blob, `Signoff_${meta.customer}.docx`);
  };

  // ---------- UI ----------
  return (
    <div className="max-w-7xl mx-flex p-8 space-y-10">
      <header className="flex justify-between">
        <h1 className="text-3xl font-bold">Signoff Generator</h1>
        <button onClick={handleDownload} className="btn-primary">
          Generate Doc
        </button>
      </header>

      <button onClick={addSection} className="btn-outline">
        + Add Section
      </button>

      <GridLayout
        layouts={{
          lg: sections.map((s) => ({ i: s.id, ...s.layout })),
        }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={30}
        onLayoutChange={(layout) => {
          const updated = sections.map((s) => {
            const l = layout.find((x) => x.i === s.id);
            return l ? { ...s, layout: l } : s;
          });
          setSections(updated);
        }}
      >
        {sections.map((section, i) => (
          <div key={section.id}>
            <DynamicForm
              section={section}
              index={i}
              updateSection={updateSection}
              removeSection={() => { }}
              handleImageUpload={() => { }}
            />
          </div>
        ))}
      </GridLayout>
    </div>
  );
}