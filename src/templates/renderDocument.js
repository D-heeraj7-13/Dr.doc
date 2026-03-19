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
  HeightRule,
  BorderStyle,
  PageBorderDisplay,
  PageBorderOffsetFrom,
  PageBorderZOrder,
} from "docx";

const safe = (val) => (val === null || val === undefined ? "N/A" : String(val));

/* 🟡 HEADER RENDER */
const renderHeader = (meta) => {
  const children = [];

  // Handle Logo
  if (meta.logo) {
    try {
      children.push(
        new ImageRun({
          data: meta.logo,
          transformation: { width: 120, height: 60 },
        })
      );
    } catch (e) {
      console.error("Logo render failed", e);
    }
  }

  // Title
  children.push(
    new TextRun({
      text: safe(meta.title).toUpperCase(),
      bold: true,
      size: 32,
      color: "2563eb",
      break: meta.logo ? 1 : 0,
    })
  );

  // Customer & Date
  children.push(
    new TextRun({
      text: `CLIENT: ${safe(meta.customer || "INTERNAL")}`,
      bold: true,
      size: 20,
      color: "666666",
      break: 1,
    })
  );

  children.push(
    new TextRun({
      text: `DATE: ${safe(meta.date)}`,
      size: 16,
      color: "999999",
      break: 1,
    })
  );

  return new Paragraph({
    spacing: { after: 400 },
    children: children,
  });
};

/* 🟡 TABLE RENDER */
const renderTable = (section) => {
  const columns = section.columns || [];
  const rows = section.rows || [];

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
      // Header Row
      new TableRow({
        tableHeader: true,
        children: columns.map(
          (col) =>
            new TableCell({
              shading: { fill: "f2f2f2" },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: safe(col), bold: true, size: 20 })],
                }),
              ],
            })
        ),
      }),
      // Data Rows
      ...rows.map(
        (row, i) =>
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: String(i + 1), size: 18 })],
                  }),
                ],
              }),
              ...columns.slice(1).map(
                (col) =>
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: safe(row[col]), size: 18 })],
                      }),
                    ],
                  })
              ),
            ],
          })
      ),
    ],
  });
};

/* 🟡 SIGNATURE RENDER */
const renderSignature = (section) => {
  const fields = section.fields || [];
  return new Table({
    width: { size: 100, type: "percentage" },
    borders: {
      top: { style: "nil" },
      bottom: { style: "nil" },
      left: { style: "nil" },
      right: { style: "nil" },
      insideHorizontal: { style: "nil" },
      insideVertical: { style: "nil" },
    },
    rows: [
      new TableRow({
        children: fields.map(
          (f) =>
            new TableCell({
              borders: {
                bottom: { style: "single", size: 1, color: "000000" },
              },
              padding: { top: 400, bottom: 100, left: 100, right: 100 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: safe(f.value),
                      bold: true,
                      size: 20,
                      color: "2563eb",
                    }),
                  ],
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: safe(f.label), size: 14, color: "666666" }),
                  ],
                }),
              ],
            })
        ),
      }),
    ],
  });
};

/* 🟡 TEXT SECTION RENDER (Handles Multiline) */
const renderTextSection = (section) => {
  const lines = safe(section.content).split("\n");
  
  return [
    new Paragraph({
      spacing: { before: 400, after: 200 },
      children: [
        new TextRun({ text: safe(section.title).toUpperCase(), bold: true, size: 24 }),
      ],
    }),
    ...lines.map(line => new Paragraph({
      children: [new TextRun({ text: line, size: 20 })],
      spacing: { after: 100 }
    }))
  ];
};

/* 🟡 SECTION ROUTER */
const renderSection = (section) => {
  switch (section.type) {
    case "table":
      return [
        new Paragraph({
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({ text: safe(section.title).toUpperCase(), bold: true, size: 24 }),
          ],
        }),
        renderTable(section),
      ];

    case "text":
      return renderTextSection(section);

    case "signature":
      return [
        new Paragraph({
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({ text: safe(section.title).toUpperCase(), bold: true, size: 24 }),
          ],
        }),
        renderSignature(section),
      ];

    default:
      return [new Paragraph("")];
  }
};

/* 🟡 MAIN EXPORT */
export const generateDoc = async (schema) => {
  const borderStyle = schema.meta.hasBorder
    ? {
        display: PageBorderDisplay.ALL_PAGES,
        offsetFrom: PageBorderOffsetFrom.PAGE,
        zOrder: PageBorderZOrder.FRONT,
        top: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 24 },
        bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 24 },
        left: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 24 },
        right: { style: BorderStyle.SINGLE, size: 12, color: "000000", space: 24 },
      }
    : undefined;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            borders: borderStyle,
          },
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
        children: [
          renderHeader(schema.meta),
          ...schema.sections.flatMap(renderSection),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};
