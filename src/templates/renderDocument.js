import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  Footer,
  PageNumber,
  AlignmentType,
  BorderStyle,
  PageBorderDisplay,
  PageBorderOffsetFrom,
  PageBorderZOrder,
  WidthType,
  Header,
} from "docx";

const safe = (val) => (val === null || val === undefined ? "" : String(val));

/* ====================== SMALL HEADER (Right Aligned on all pages) ====================== */
const renderHeader = (meta) => {
  const children = [];

  if (meta.logo) {
    try {
      children.push(new ImageRun({ data: meta.logo, transformation: { width: 110, height: 55 } }));
    } catch (e) {}
  }

  children.push(new TextRun({ text: safe(meta.title), bold: true, size: 26, color: "1e40af", break: 1 }));

  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 200 },
    children,
  });
};

/* ====================== FIRST PAGE - Big Logo + Meta Table ====================== */
const renderFirstPage = (meta) => {
  const children = [];

  // Big Centered Logo
  if (meta.logo) {
    try {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 280 },
          children: [new ImageRun({ data: meta.logo, transformation: { width: 280, height: 140 } })],
        })
      );
    } catch (e) {}
  }

  // Customer Name
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: safe(meta.customer || "L&T Finance Ltd."), size: 28, color: "1e40af", bold: true })],
    })
  );

  // Main Title (Big Blue)
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 350 },
      children: [new TextRun({ text: safe(meta.title).toUpperCase(), size: 32, color: "1e40af", bold: true })],
    })
  );

  // Meta Information Table
  const metaData = [
    ["Title", safe(meta.title)],
    ["Category", "Customer Requirement"],
    ["Customer Name", safe(meta.customer)],
    ["Date", safe(meta.date)],
    ["Created By", safe(meta.createdBy || "")],
  ];

  const metaTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: "94a3b8" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "94a3b8" },
      left: { style: BorderStyle.SINGLE, size: 6, color: "94a3b8" },
      right: { style: BorderStyle.SINGLE, size: 6, color: "94a3b8" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "e2e8f0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "e2e8f0" },
    },
    rows: metaData.map(([label, value]) =>
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: "f1f5f9" },
            width: { size: 28, type: WidthType.PERCENTAGE },
            padding: { top: 85, bottom: 85, left: 100, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22 })] })],
          }),
          new TableCell({
            padding: { top: 85, bottom: 85, left: 80, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: value, size: 22 })] })],
          }),
        ],
      })
    ),
  });

  children.push(metaTable);
  children.push(new Paragraph({ spacing: { after: 450 } })); // Good space before TOC on next page

  return children;
};

/* ====================== TABLE OF CONTENTS (Only Once on Page 2) ====================== */
const renderTOC = () => [
  new Paragraph({
    spacing: { after: 180 },
    children: [new TextRun({ text: "Table of Contents", bold: true, size: 28, color: "1e40af" })],
  }),
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: "94a3b8" },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: "94a3b8" },
      left: { style: BorderStyle.SINGLE, size: 8, color: "94a3b8" },
      right: { style: BorderStyle.SINGLE, size: 8, color: "94a3b8" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "e2e8f0" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, padding: { top: 80, bottom: 80 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Sr. No.", bold: true, size: 22 })] })] }),
          new TableCell({ width: { size: 85, type: WidthType.PERCENTAGE }, padding: { top: 80, bottom: 80 }, children: [new Paragraph({ children: [new TextRun({ text: "Contents", bold: true, size: 22 })] })] }),
        ],
      }),
      new TableRow({ children: [new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1" })] })] }), new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ children: [new TextRun({ text: "Perimeter Firewall Design" })] })] })] }),
      new TableRow({ children: [new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "2" })] })] }), new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ children: [new TextRun({ text: "Scope of Work" })] })] })] }),
      new TableRow({ children: [new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3" })] })] }), new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ children: [new TextRun({ text: "Handover" })] })] })] }),
      new TableRow({ children: [new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4" })] })] }), new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ children: [new TextRun({ text: "Project Closure" })] })] })] }),
    ],
  }),
  new Paragraph({ spacing: { after: 400 } }), // Good space after TOC
];

/* ====================== RENDER OTHER SECTIONS ====================== */
const renderComponent = (section) => {
  const titlePara = new Paragraph({
    spacing: { before: 200, line: 300, after: 240 },
    children: [new TextRun({ text: safe(section.title).toUpperCase(), bold: true, size: 28, color: "1e40af" })],
  });

  if (section.type === "text") {
    const lines = safe(section.content).split("\n");
    const paras = lines.filter(l => l.trim()).map(line =>
      new Paragraph({ children: [new TextRun({ text: line, size: 22 })], spacing: { line: 260, after: 120 } })
    );
    return [titlePara, ...paras];
  }

  if (section.type === "table") {
    const cols = section.columns || ["Sr No.", "Description", "SOW", "Comments"];
    const rows = section.rows || [];

    const headerRow = new TableRow({
      tableHeader: true,
      children: cols.map(c => new TableCell({
        shading: { fill: "e2e8f0" },
        padding: { top: 100, bottom: 100, left: 80, right: 80 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: safe(c), bold: true, size: 22 })] })],
      })),
    });

    const dataRows = rows.length > 0 ? rows.map((r, i) => new TableRow({
      children: cols.map(col => new TableCell({
        shading: { fill: i % 2 === 0 ? "ffffff" : "f8fafc" },
        padding: { top: 90, bottom: 90, left: 80, right: 80 },
        children: [new Paragraph({
          alignment: col.toLowerCase().includes("sr") ? AlignmentType.CENTER : AlignmentType.LEFT,
          children: [new TextRun({ text: safe(r[col]) || "", size: 21 })],
        })],
      })),
    })) : [];

    return [titlePara, new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 8, color: "94a3b8" },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: "94a3b8" },
        left: { style: BorderStyle.SINGLE, size: 8, color: "94a3b8" },
        right: { style: BorderStyle.SINGLE, size: 8, color: "94a3b8" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "e2e8f0" },
        insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "e2e8f0" },
      },
      rows: [headerRow, ...dataRows],
    })];
  }

  if (section.type === "signature") {
    const fields = section.fields || [];
    return [titlePara, new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { all: { style: BorderStyle.NIL } },
      rows: [new TableRow({
        children: fields.map(f => new TableCell({
          borders: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "475569" } },
          padding: { top: 160, bottom: 100, left: 60, right: 60 },
          children: [
            new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: safe(f.value) || " ", size: 24 })] }),
            new Paragraph({ children: [new TextRun({ text: safe(f.label).toUpperCase(), size: 18, bold: true })] }),
          ],
        })),
      })],
    })];
  }

  return [titlePara];
};

/* ====================== MAIN GENERATE FUNCTION ====================== */
export const generateDoc = async (schema) => {
  
// 🟢 REQUIRED — holds only real content (no TOC, no cover)
const bodyChildren = [];
  // Add remaining sections from your state
  const sorted = [...schema.sections]
  .filter(s => !s.title?.toLowerCase().includes("table of contents")) // 🟢 REMOVE DUPLICATE TOC
  .sort((a, b) => (a.layout?.y || 0) - (b.layout?.y || 0));

  const rows = [];
  let currentRow = [];
  let lastY = -1;

  sorted.forEach((s) => {
    if (currentRow.length === 0 || Math.abs((s.layout?.y || 0) - lastY) < 1) {
      currentRow.push(s);
      lastY = s.layout?.y || 0;
    } else {
      rows.push(currentRow);
      currentRow = [s];
      lastY = s.layout?.y || 0;
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);

  rows.forEach((rowItems) => {
    rowItems.sort((a, b) => (a.layout?.x || 0) - (b.layout?.x || 0));
    const cells = [];
    let curX = 0;

    rowItems.forEach((item) => {
      const layout = item.layout || { x: 0, y: 0, w: 12, h: 8 };

      if (layout.x > curX) {
        cells.push(new TableCell({ width: { size: Math.round(((layout.x - curX) / 12) * 100), type: WidthType.PERCENTAGE }, children: [new Paragraph("")], borders: { all: { style: BorderStyle.NIL } } }));
      }

      cells.push(new TableCell({
        width: { size: Math.round((layout.w / 12) * 100), type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" }, bottom: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" }, left: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" }, right: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" } },
        shading: { fill: "fafbfc" },
        padding: { top: 180, bottom: 180, left: 180, right: 180 },
        children: renderComponent(item),
      }));
      curX = layout.x + layout.w;
    });

    if (curX < 12) {
      cells.push(new TableCell({ width: { size: Math.round(((12 - curX) / 12) * 100), type: WidthType.PERCENTAGE }, children: [new Paragraph("")], borders: { all: { style: BorderStyle.NIL } } }));
    }

    const rowHeight = rowItems.reduce((acc, item) => Math.max(acc, item.layout?.h || 8), 8);

    bodyChildren.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { all: { style: BorderStyle.NIL } },
      rows: [new TableRow({ children: cells, height: { value: rowHeight * 520, rule: "atLeast" } })],
    }));

    bodyChildren.push(new Paragraph({}));
  });

 const doc = new Document({
  sections: [
    // 🟢 FIRST PAGE (COVER)
    {
      properties: {
        page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
      },
      children: [
        ...renderFirstPage(schema.meta),
      ],
    },

    // 🟢 SECOND PAGE (TOC)
    {
      properties: {},
      headers: {
        default: new Header({ children: [renderHeader(schema.meta)] }),
      },
      children: [
        ...renderTOC(),
      ],
    },

    // 🟢 MAIN CONTENT
    {
      properties: {},
      headers: {
        default: new Header({ children: [renderHeader(schema.meta)] }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: "Page ", size: 18 }),
                PageNumber.CURRENT,
                new TextRun({ text: " of ", size: 18 }),
                PageNumber.TOTAL_PAGES,
              ],
            }),
          ],
        }),
      },
      children: bodyChildren
    },
  ],
});

  return await Packer.toBlob(doc);
};