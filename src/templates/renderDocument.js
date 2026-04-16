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
  PageBorderDisplay,
  PageBorderOffsetFrom,
  PageBorderZOrder,
} from "docx";
const safe = (val) => (val === null || val === undefined ? "" : String(val));
const DEFAULT_COVER_LOGO = "/cover-logo.png";
function cleanBase64(base64) {
  if (!base64) return "";
  return base64.replace(/^data:image\/\w+;base64,/, "");
}

function imageToUint8Array(image) {
  if (!image) return new Uint8Array();

  if (image instanceof Uint8Array) {
    return image;
  }

  if (image instanceof ArrayBuffer) {
    return new Uint8Array(image);
  }

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

/* ====================== SMALL HEADER ====================== */
const renderHeader = (meta) => {
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

/* ====================== FIRST PAGE ====================== */
const renderFirstPage = (meta) => {
  const children = [];
  const coverLogoData = meta.coverLogoData;

  if (coverLogoData) {
    try {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 920, after: 0 },
          children: [new ImageRun({
            data: coverLogoData,
            transformation: { width: 350, height: 285 },
          })],
        })
      );
    } catch (e) {
      console.error("First page big logo failed", e);
    }
  } else {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1160, after: 120 },
        children: [new TextRun({
          text: safe(meta.title).toUpperCase(),
          size: 34,
          color: "1e40af",
          bold: true,
        })],
      })
    );
  }

  children.push(new Paragraph({ spacing: { after: 500 } }));

  return children;
};

const loadDefaultCoverLogo = async () => {
  try {
    const response = await fetch(DEFAULT_COVER_LOGO);
    if (!response.ok) {
      return null;
    }
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (e) {
    console.error("Default cover logo failed", e);
    return null;
  }
};

/* ====================== TABLE OF CONTENTS ====================== */
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
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            padding: { top: 80, bottom: 80 },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "Sr. No.", bold: true, size: 22 })],
            })],
          }),
          new TableCell({
            width: { size: 85, type: WidthType.PERCENTAGE },
            padding: { top: 80, bottom: 80 },
            children: [new Paragraph({
              children: [new TextRun({ text: "Contents", bold: true, size: 22 })],
            })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1" })] })] }),
          new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ children: [new TextRun({ text: "Perimeter Firewall Design" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "2" })] })] }),
          new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ children: [new TextRun({ text: "Scope of Work" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3" })] })] }),
          new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ children: [new TextRun({ text: "Handover" })] })] }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4" })] })] }),
          new TableCell({ padding: { top: 70, bottom: 70 }, children: [new Paragraph({ children: [new TextRun({ text: "Project Closure" })] })] }),
        ],
      }),
    ],
  }),
  new Paragraph({ spacing: { after: 400 } }),
];
/* ====================== RENDER COMPONENT (with Image Fix) ====================== */
const renderComponent = (section) => {
  const titlePara = new Paragraph({
    spacing: { before: 300, after: 200, line: 300 },
    children: [
      new TextRun({
        text: safe(section.title).toUpperCase(),
        bold: true,
        size: 28,
        color: "1e40af",
      }),
    ],
  });
  if (section.type === "text") {
    const lines = safe(section.content || "").split("\n");
    const paras = lines
      .filter((l) => l.trim())
      .map(
        (line) =>
          new Paragraph({
            children: [new TextRun({ text: line, size: 22 })],
            spacing: { before: 60, after: 120, line: 260 },
          })
      );
    return [titlePara, ...paras];
  }

  if (section.type === "image" && section.image) {
    try {
      const imgData = imageToUint8Array(section.image);

      const colWidth = (section.layout?.w || 6) / 12;
      const pageWidth = 900; // approx usable width in px

      const imgWidth = Math.round(pageWidth * colWidth);
      const imgHeight = Math.round(imgWidth * 0.6);
      return [
        titlePara,
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 180 },
          children: [
            new ImageRun({
              data: imgData,
              transformation: { width: imgWidth, height: imgHeight },
            }),
          ],
        }),
      ];
    } catch (e) {
      console.error("Image failed", e);
      return [titlePara, new Paragraph({ children: [new TextRun({ text: "Image failed to load", color: "ef4444" })] })];
    }
  }
  if (section.type === "table") {
    // ... your existing table rendering logic (it's mostly fine)
    // Just make sure borders are clean
    const cols = section.columns || ["Sr No", "Column 1", "Column 2", "Column 3"];
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
            children: [
              new Paragraph({
                children: [new TextRun({ text: safe(r[col]) || "", size: 21 })],
              }),
            ],
          })
        ),
      })
    );

    return [
      titlePara,
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { all: { style: BorderStyle.SINGLE, size: 10, color: "94a3b8" } }, // clean outer border
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
// Replace your entire generateDoc function with this improved version

export const generateDoc = async (schema) => {
  const { meta, sections } = schema;
  const uploadedLogoData = meta?.logo ? imageToUint8Array(meta.logo) : null;
  const coverLogoData =
    uploadedLogoData && uploadedLogoData.length > 0
      ? uploadedLogoData
      : await loadDefaultCoverLogo();

  // Sort sections by Y position (top to bottom)
  const sortedSections = [...sections].sort((a, b) =>
    (a.layout?.y || 0) - (b.layout?.y || 0)
  );

  const bodyChildren = [];

  let i = 0;
  while (i < sortedSections.length) {
    const currentY = sortedSections[i].layout?.y || 0;
    const rowSections = [];

    // Collect all sections on the same "row" (same or very close Y)
    while (i < sortedSections.length && Math.abs((sortedSections[i].layout?.y || 0) - currentY) < 2) {
      rowSections.push(sortedSections[i]);
      i++;
    }
    const maxH = Math.max(...rowSections.map((s) => s.layout?.h || 6));

    if (rowSections.length === 1) {
      // Single section - full width
      const section = rowSections[0];
      bodyChildren.push(...renderComponent(section));
      bodyChildren.push(new Paragraph({ spacing: { after: 240 } }));
    }
    else {
      // Multiple sections side-by-side → use Table for row
      rowSections.sort((a, b) => (a.layout?.x || 0) - (b.layout?.x || 0));

      const cells = [];

      rowSections.forEach((section) => {
        const widthPercent = Math.round(((section.layout?.w || 6) / 12) * 100);

        cells.push(
          new TableCell({
            width: { size: widthPercent, type: WidthType.PERCENTAGE },
            borders: { all: { style: BorderStyle.NIL } },   // <--- Clean: No ugly borders
            padding: { top: 120, bottom: 120, left: 80, right: 80 },
            children: renderComponent(section),
          })
        );
      });

      // Add empty cell if total width < 12
      const totalW = rowSections.reduce((sum, s) => sum + (s.layout?.w || 6), 0);
      if (totalW < 12) {
        cells.push(
          new TableCell({
            width: { size: Math.round(((12 - totalW) / 12) * 100), type: WidthType.PERCENTAGE },
            borders: { all: { style: BorderStyle.NIL } },
            children: [new Paragraph("")],
          })
        );
      }

      bodyChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { all: { style: BorderStyle.NIL } },   // No outer border mess
          rows: [
            new TableRow({
              children: cells,
              height: { value: maxH * 300, rule: "atLeast" },
            }),
          ],
        })
      );

      bodyChildren.push(new Paragraph({ spacing: { after: 180 } }));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
            size: { width: 11906, height: 16838 }, // A4
            borders: {
              pageBorders: {
                display: PageBorderDisplay.FIRST_PAGE,
                offsetFrom: PageBorderOffsetFrom.TEXT,
                zOrder: PageBorderZOrder.BACK,
              },
              pageBorderTop: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
              pageBorderRight: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
              pageBorderBottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
              pageBorderLeft: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
            },
          },
        },
        children: renderFirstPage({ ...meta, coverLogoData }),
      },
      {
        properties: {},
        headers: { default: new Header({ children: [renderHeader(meta)] }) },
        children: renderTOC(),
      },
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } }
        },
        headers: { default: new Header({ children: [renderHeader(meta)] }) },
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