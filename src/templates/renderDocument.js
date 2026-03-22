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
  VerticalAlign,
} from "docx";

const safe = (val) => (val === null || val === undefined ? "N/A" : String(val));

/* 🟡 HEADER RENDER */
const renderHeader = (meta) => {
  const children = [];

  if (meta.logo) {
    try {
      children.push(
        new ImageRun({
          data: meta.logo,
          transformation: { width: 100, height: 50 },
        })
      );
    } catch (e) {
      console.error("Logo render failed", e);
    }
  }

  children.push(
    new TextRun({
      text: safe(meta.title).toUpperCase(),
      bold: true,
      size: 28,
      color: "4f46e5", // indigo-600
      break: meta.logo ? 1 : 0,
    })
  );

  children.push(
    new TextRun({
      text: `CLIENT: ${safe(meta.customer || "INTERNAL")}`,
      bold: true,
      size: 18,
      color: "4b5563", // zinc-600
      break: 1,
    })
  );

  children.push(
    new TextRun({
      text: `DATE: ${safe(meta.date)}`,
      size: 14,
      color: "9ca3af", // zinc-400
      break: 1,
    })
  );

  return new Paragraph({
    spacing: { after: 300 },
    children: children,
  });
};

/* 🟡 TABLE RENDER */
const renderTable = (section) => {
  const columns = section.columns || [];
  const rows = section.rows || [];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "e5e7eb" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "e5e7eb" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "e5e7eb" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "e5e7eb" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "e5e7eb" },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "e5e7eb" },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: columns.map(
          (col) =>
            new TableCell({
              shading: { fill: "f9fafb" },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: safe(col).toUpperCase(), bold: true, size: 14, color: "374151" })],
                }),
              ],
            })
        ),
      }),
      ...rows.map(
        (row, i) =>
          new TableRow({
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: String(i + 1), size: 14, color: "6b7280" })],
                  }),
                ],
              }),
              ...columns.slice(1).map(
                (col) =>
                  new TableCell({
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: safe(row[col]), size: 14, color: "111827" })],
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
  return [
    new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({ text: safe(section.title).toUpperCase(), bold: true, size: 16, color: "111827" }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NIL },
        bottom: { style: BorderStyle.NIL },
        left: { style: BorderStyle.NIL },
        right: { style: BorderStyle.NIL },
        insideHorizontal: { style: BorderStyle.NIL },
        insideVertical: { style: BorderStyle.NIL },
      },
      rows: [
        new TableRow({
          children: fields.map(
            (f) =>
              new TableCell({
                borders: {
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
                },
                padding: { top: 200, bottom: 50, left: 50, right: 50 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: safe(f.value),
                        bold: true,
                        size: 14,
                        color: "4f46e5",
                      }),
                    ],
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: safe(f.label).toUpperCase(), size: 10, color: "6b7280" }),
                    ],
                  }),
                ],
              })
          ),
        }),
      ],
    })
  ];
};

/* 🟡 TEXT SECTION RENDER */
const renderTextSection = (section) => {
  const lines = safe(section.content).split("\n");
  
  return [
    new Paragraph({
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({ text: safe(section.title).toUpperCase(), bold: true, size: 16, color: "111827" }),
      ],
    }),
    ...lines.map(line => new Paragraph({
      children: [new TextRun({ text: line, size: 14, color: "374151" })],
      spacing: { after: 50 }
    }))
  ];
};

/* 🟡 MAIN COMPONENT ROUTER */
const renderComponent = (section) => {
  let content = [];
  switch (section.type) {
    case "table":
      content = [
        new Paragraph({
          spacing: { before: 100, after: 100 },
          children: [
            new TextRun({ text: safe(section.title).toUpperCase(), bold: true, size: 16, color: "111827" }),
          ],
        }),
        renderTable(section),
      ];
      break;
    case "text":
      content = renderTextSection(section);
      break;
    case "signature":
      content = renderSignature(section);
      break;
    default:
      content = [new Paragraph("")];
  }

  // Wrap in a table cell to provide the component border seen in preview
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            padding: { top: 200, bottom: 200, left: 200, right: 200 },
            shading: { fill: "ffffff" },
            children: content,
          }),
        ],
      }),
    ],
  });
};

/* 🟡 GRID LAYOUT RENDERER */
const renderGridLayout = (sections) => {
  const sortedSections = [...sections].sort((a, b) => {
    if (a.layout.y !== b.layout.y) return a.layout.y - b.layout.y;
    return a.layout.x - b.layout.x;
  });

  const rows = [];
  let currentRow = [];
  let lastY = -1;

  sortedSections.forEach((s) => {
    if (currentRow.length === 0 || Math.abs(s.layout.y - lastY) < 1) {
      currentRow.push(s);
      lastY = s.layout.y;
    } else {
      rows.push(currentRow);
      currentRow = [s];
      lastY = s.layout.y;
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);

  const children = [];

  rows.forEach((row) => {
    row.sort((a, b) => a.layout.x - b.layout.x);

    const cells = [];
    let currentX = 0;

    row.forEach((s) => {
      if (s.layout.x > currentX) {
        cells.push(new TableCell({
          width: { size: ((s.layout.x - currentX) / 12) * 100, type: WidthType.PERCENTAGE },
          children: [],
          borders: {
            top: { style: BorderStyle.NIL },
            bottom: { style: BorderStyle.NIL },
            left: { style: BorderStyle.NIL },
            right: { style: BorderStyle.NIL },
          }
        }));
      }

      cells.push(new TableCell({
        width: { size: (s.layout.w / 12) * 100, type: WidthType.PERCENTAGE },
        children: [renderComponent(s)],
        borders: {
          top: { style: BorderStyle.NIL },
          bottom: { style: BorderStyle.NIL },
          left: { style: BorderStyle.NIL },
          right: { style: BorderStyle.NIL },
        },
      }));

      currentX = s.layout.x + s.layout.w;
    });

    if (currentX < 12) {
      cells.push(new TableCell({
        width: { size: ((12 - currentX) / 12) * 100, type: WidthType.PERCENTAGE },
        children: [],
        borders: {
          top: { style: BorderStyle.NIL },
          bottom: { style: BorderStyle.NIL },
          left: { style: BorderStyle.NIL },
          right: { style: BorderStyle.NIL },
        }
      }));
    }

    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NIL },
        bottom: { style: BorderStyle.NIL },
        left: { style: BorderStyle.NIL },
        right: { style: BorderStyle.NIL },
        insideHorizontal: { style: BorderStyle.NIL },
        insideVertical: { style: BorderStyle.NIL },
      },
      rows: [new TableRow({ children: cells })],
    }));
    
    // Vertical spacing between grid rows
    children.push(new Paragraph({ spacing: { before: 200 } }));
  });

  return children;
};

/* 🟡 MAIN EXPORT */
export const generateDoc = async (schema) => {
  // Correct docx v9 structure for page borders
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
            margin: {
              top: 720,
              right: 720,
              bottom: 720,
              left: 720,
            },
          },
          pageBorders: borderStyle,
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
          ...renderGridLayout(schema.sections),
        ],
      },
    ],
  });
  return await Packer.toBlob(doc);
};
