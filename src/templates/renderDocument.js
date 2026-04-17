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
  WidthType,
  Header,
} from "docx";
import { HeadingLevel } from "docx";

const safe = (val) => (val === null || val === undefined ? "" : String(val));

const DEFAULT_COVER_LOGO = "/cover-logo.png";

function cleanBase64(base64) {
  if (!base64) return "";
  return base64.replace(/^data:image\/\w+;base64,/, "");
}

function imageToUint8Array(image) {
  if (!image) return new Uint8Array();

  if (image instanceof Uint8Array) return image;
  if (image instanceof ArrayBuffer) return new Uint8Array(image);
  if (ArrayBuffer.isView(image)) {
    return new Uint8Array(image.buffer, image.byteOffset, image.byteLength);
  }

  const cleaned = cleanBase64(String(image));
  const binary = atob(cleaned);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
/* ====================== NEW TOC HEADER (you can customize this) ====================== */
const renderTOCHeader = (meta) => {
  const children = [];

  if (meta.logo) {
    try {
      const imgData = imageToUint8Array(meta.logo);
      children.push(
        new ImageRun({
          data: imgData,
          transformation: { width: 110, height: 55 },
        })
      );
    } catch (e) {}
  }

  // You can make TOC header different — e.g. bigger title, different text, or "Table of Contents" label
  children.push(new TextRun({
    text: safe(meta.title),
    bold: true,
    size: 28,           // slightly bigger
    color: "1e40af",
    break: 1,
  }));

  children.push(new TextRun({
    text: "TABLE OF CONTENTS",
    bold: true,
    size: 24,
    color: "334155",
    break: 1,
  }));

  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 240 },
    children,
  });
};
/* ====================== HEADER & FIRST PAGE ====================== */
const renderHeader = (meta) => {
  const children = [];

  if (meta.logo) {
    try {
      const imgData = imageToUint8Array(meta.logo);
      children.push(new ImageRun({ data: imgData, transformation: { width: 110, height: 55 } }));
    } catch (e) {
      console.error("Header logo failed", e);
    }
  }

  children.push(new TextRun({
    text: safe(meta.title),
    bold: true,
    size: 26,
    color: "1e40af",
    break: 1,
  }));

  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 200 },
    children,
  });
};

const renderFirstPage = (meta) => {
  const children = [];
  const coverLogoData = meta.coverLogoData;

  if (coverLogoData) {
    try {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 920, after: 0 },
        children: [new ImageRun({ data: coverLogoData, transformation: { width: 350, height: 285 } })],
      }));
    } catch (e) {
      console.error("First page big logo failed", e);
    }
  } else {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1160, after: 120 },
      children: [new TextRun({ text: safe(meta.title).toUpperCase(), size: 34, color: "1e40af", bold: true })],
    }));
  }

  children.push(new Paragraph({ spacing: { after: 500 } }));
  return children;
};

const loadDefaultCoverLogo = async () => {
  try {
    const response = await fetch(DEFAULT_COVER_LOGO);
    if (!response.ok) return null;
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (e) {
    console.error("Default cover logo failed", e);
    return null;
  }
};

/* ====================== MANUAL TOC ====================== */
const renderManualTOC = (tocText) => [   // ← Fixed: removed ": string"
  new Paragraph({
    text: "Table of Contents",
    heading: HeadingLevel.HEADING_1,
    spacing: { after: 200 },
  }),
  ...tocText.split("\n").map((line) =>
    new Paragraph({
      text: line.trim(),
      spacing: { before: 60, after: 60, line: 260 },
      indent: { left: 240 },
    })
  ),
  new Paragraph({ text: "", pageBreakBefore: true }),
];

/* ====================== RENDER COMPONENT ====================== */
const renderComponent = (section) => {
  const titlePara = new Paragraph({
    text: safe(section.title),
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 200 },
  });

  if (section.type === "text") {
    const lines = safe(section.content || "").split("\n");
    const paras = lines
      .filter((l) => l.trim())
      .map((line) =>
        new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
          spacing: { before: 60, after: 120, line: 260 },
        })
      );
    return [titlePara, ...paras];
  }

  if (section.type === "table") {
    const cols = section.columns || [];
    const rows = section.rows || [];

    const headerRow = new TableRow({
      tableHeader: true,
      children: cols.map((c) =>
        new TableCell({
          shading: { fill: "e2e8f0" },
          borders: { all: { style: BorderStyle.SINGLE, size: 8, color: "94a3b8" } },
          padding: { top: 120, bottom: 120, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: safe(c), bold: true, size: 22 })],
            }),
          ],
        })
      ),
    });

    const dataRows = rows.map((r, i) =>
      new TableRow({
        children: cols.map((col) =>
          new TableCell({
            borders: { all: { style: BorderStyle.SINGLE, size: 6, color: "cbd5e1" } },
            shading: { fill: i % 2 === 0 ? "ffffff" : "f8fafc" },
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: safe(r[col]) || "", size: 21 })] })],
          })
        ),
      })
    );

    return [
      titlePara,
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { all: { style: BorderStyle.SINGLE, size: 10, color: "94a3b8" } },
        rows: [headerRow, ...dataRows],
      }),
    ];
  }

  if (section.type === "signature") {
    const fields = section.fields || [];
    return [titlePara, new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { all: { style: BorderStyle.NIL } },
      rows: [new TableRow({
        children: fields.map((f) =>
          new TableCell({
            borders: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "475569" } },
            padding: { top: 160, bottom: 100, left: 60, right: 60 },
            children: [
              new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: safe(f.value) || " ", size: 24 })] }),
              new Paragraph({ children: [new TextRun({ text: safe(f.label).toUpperCase(), size: 18, bold: true })] }),
            ],
          })
        ),
      })],
    })];
  }

  return [titlePara];
};

/* ====================== MAIN GENERATE FUNCTION ====================== */
export const generateDoc = async (schema) => {
  const { meta, sections } = schema;

  const tocSection = sections.find((section) => section.id === "toc");
  const tocText = safe(tocSection?.content || "");
  const tocChildren = renderManualTOC(tocText);

  const uploadedLogoData = meta?.logo ? imageToUint8Array(meta.logo) : null;
  const coverLogoData = uploadedLogoData && uploadedLogoData.length > 0
    ? uploadedLogoData
    : await loadDefaultCoverLogo();

  // Build main body content (your existing loop)
  const sortedSections = sections
    .filter((section) => section.id !== "toc")
    .sort((a, b) => (a.layout?.y || 0) - (b.layout?.y || 0));
  const bodyChildren = [];

  let i = 0;
  while (i < sortedSections.length) {
    const currentY = sortedSections[i].layout?.y || 0;
    const rowSections = [];

    while (i < sortedSections.length && Math.abs((sortedSections[i].layout?.y || 0) - currentY) < 2) {
      rowSections.push(sortedSections[i]);
      i++;
    }

    if (rowSections.length === 1) {
      const section = rowSections[0];
      bodyChildren.push(...renderComponent(section));
      bodyChildren.push(new Paragraph({ spacing: { after: 240 } }));
    } else {
      // your multi-column logic here (keep as is)
      rowSections.sort((a, b) => (a.layout?.x || 0) - (b.layout?.x || 0));
      const cells = rowSections.map(section => {
        const widthPercent = Math.round(((section.layout?.w || 6) / 12) * 100);
        return new TableCell({
          width: { size: widthPercent, type: WidthType.PERCENTAGE },
          borders: { all: { style: BorderStyle.NIL } },
          padding: { top: 120, bottom: 120, left: 80, right: 80 },
          children: renderComponent(section),
        });
      });

      bodyChildren.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { all: { style: BorderStyle.NIL } },
        rows: [new TableRow({ children: cells })],
      }));
      bodyChildren.push(new Paragraph({ spacing: { after: 180 } }));
    }
  }

  const doc = new Document({
    sections: [
      // 1. COVER PAGE - No header, No border
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        },
        children: renderFirstPage({ ...meta, coverLogoData }),
      },

      // 2. TOC PAGE - Uses NEW TOC Header + Border
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
            borders: meta.hasBorder ? {
              pageBorderTop:    { style: BorderStyle.SINGLE, size: 12, color: "000000" },
              pageBorderRight:  { style: BorderStyle.SINGLE, size: 12, color: "000000" },
              pageBorderBottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
              pageBorderLeft:   { style: BorderStyle.SINGLE, size: 12, color: "000000" },
            } : undefined,
          },
        },
        headers: {
          default: new Header({ children: [renderTOCHeader(meta)] }),   // ← Different Header for TOC
        },
        children: tocChildren,
      },

      // 3. MAIN CONTENT PAGES - Uses Normal Header + Page Numbering
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
            borders: meta.hasBorder ? {
              pageBorderTop:    { style: BorderStyle.SINGLE, size: 12, color: "000000" },
              pageBorderRight:  { style: BorderStyle.SINGLE, size: 12, color: "000000" },
              pageBorderBottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
              pageBorderLeft:   { style: BorderStyle.SINGLE, size: 12, color: "000000" },
            } : undefined,
          },
        },
        headers: {
          default: new Header({ children: [renderHeader(meta)] }),     // ← Normal Header
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun("Page "),
                  PageNumber.CURRENT,
                  new TextRun(" of "),
                  PageNumber.TOTAL_PAGES,
                ],
              }),
            ],
          }),
        },
        children: bodyChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
};