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
} from "docx";

const safe = (val) => val || "N/A";

/* 🟡 NEW: HEADER RENDER */
const renderHeader = (meta) => {
  return new Paragraph({
    spacing: { after: 400 },
    children: [
      meta.logo
        ? new ImageRun({
            data: meta.logo,
            transformation: { width: 120, height: 60 },
          })
        : new TextRun(""),
      new TextRun({
        text: `\n${safe(meta.title).toUpperCase()}`,
        bold: true,
        size: 32,
        color: "2563eb",
      }),
      new TextRun({
        text: `\nCLIENT: ${safe(meta.customer || "INTERNAL")}`,
        bold: true,
        size: 20,
        color: "666666",
      }),
      new TextRun({
        text: `\nDATE: ${safe(meta.date)}`,
        size: 16,
        color: "999999",
      }),
      new TextRun("\n"),
    ],
  });
};

/* 🟡 NEW: TABLE RENDER */
const renderTable = (section) => {
  return new Table({
    width: { size: 100, type: "percentage" },
    borders: {
      top: { style: "single", size: 1, color: "000000" },
      bottom: { style: "single", size: 1, color: "000000" },
      left: { style: "single", size: 1, color: "000000" },
      right: { style: "single", size: 1, color: "000000" },
      insideHorizontal: { style: "single", size: 1, color: "000000" },
      insideVertical: { style: "single", size: 1, color: "000000" },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: (section.columns || []).map(
          (col) =>
            new TableCell({
              shading: { fill: "f2f2f2" },
              verticalAlign: "center",
              children: [
                new Paragraph({
                  alignment: "center",
                  children: [new TextRun({ text: col, bold: true, size: 20 })],
                }),
              ],
            })
        ),
      }),

      ...(section.rows || []).map((row, i) =>
        new TableRow({
          children: [
            new TableCell({
              verticalAlign: "center",
              children: [new Paragraph({ alignment: "center", text: String(i + 1) })],
            }),
            ...(section.columns || []).slice(1).map(
              (col) =>
                new TableCell({
                  children: [new Paragraph({ text: safe(row[col]), size: 18 })],
                })
            ),
          ],
        })
      ),
    ],
  });
};

/* 🟡 NEW: SIGNATURE */
const renderSignature = (section) => {
  return new Table({
    width: { size: 100, type: "percentage" },
    rows: [
      new TableRow({
        children: (section.fields || []).map(
          (f) =>
            new TableCell({
              borders: {
                top: { style: "nil" },
                bottom: { style: "single", size: 1, color: "000000" },
                left: { style: "nil" },
                right: { style: "nil" },
              },
              padding: { top: 200, bottom: 200 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: safe(f.value), 
                      bold: true, 
                      size: 24,
                      color: "2563eb" 
                    }),
                    new TextRun({ text: "\n", size: 12 }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: f.label, size: 14, color: "666666" }),
                  ],
                }),
              ],
            })
        ),
      }),
    ],
  });
};

/* 🟡 NEW: SECTION ROUTER */
const renderSection = (section) => {
  const commonSpacing = { before: 400, after: 200 };

  switch (section.type) {
    case "table":
      return [
        new Paragraph({
          text: section.title || "DATA TABLE",
          bold: true,
          size: 24,
          ...commonSpacing,
        }),
        renderTable(section),
      ];

    case "text":
      return [
        new Paragraph({
          text: section.title || "SECTION",
          bold: true,
          size: 24,
          ...commonSpacing,
        }),
        new Paragraph({
          text: section.content || "N/A",
          spacing: { after: 200 },
        }),
      ];

    case "signature":
      return [
        new Paragraph({
          text: section.title || "SIGNATURES",
          bold: true,
          size: 24,
          ...commonSpacing,
        }),
        renderSignature(section),
      ];

    default:
      return [new Paragraph("")];
  }
};

/* 🟡 MAIN EXPORT */
export const generateDoc = async (schema) => {
  const doc = new Document({
    sections: [
      {
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: "right",
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
        children: [
          renderHeader(schema.meta),
          ...schema.sections.flatMap(renderSection),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};