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

/* ====================== SMALL HEADER LOGO (Right Aligned - All Pages) ====================== */
const renderHeader = (meta) => {
  const children = [];

  if (meta.logo) {
    try {
      children.push(
        new ImageRun({
          data: meta.logo,
          transformation: { width: 110, height: 55 },
        })
      );
    } catch (e) {
      console.error("Header logo error:", e);
    }
  }

  children.push(
    new TextRun({
      text: safe(meta.title),
      bold: true,
      size: 26,
      color: "1e40af",
      break: 1,
    })
  );

  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 200 },
    children,
  });
};

/* ====================== FIRST PAGE - BIG CENTERED LOGO ====================== */
const renderFirstPageHeader = (meta) => {
  const parts = [];

  if (meta.logo) {
    try {
      parts.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [
            new ImageRun({
              data: meta.logo,
              transformation: { width: 280, height: 140 },   // Big logo
            }),
          ],
        })
      );
    } catch (e) {}
  }

  parts.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
      children: [new TextRun({ text: safe(meta.customer || "L&T Finance Ltd."), size: 28, color: "1e40af", bold: true })],
    })
  );

  parts.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: safe(meta.title).toUpperCase(), size: 32, color: "1e40af", bold: true })],
    })
  );

  return parts;
};

/* ====================== META INFORMATION TABLE ====================== */
const renderMetaTable = (meta) => {
  const data = [
    ["Title", safe(meta.title)],
    ["Category", "Customer Requirement"],
    ["Customer Name", safe(meta.customer)],
    ["Date", safe(meta.date)],
    ["Created By", safe(meta.createdBy || "")],
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: "94a3b8" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "94a3b8" },
      left: { style: BorderStyle.SINGLE, size: 6, color: "94a3b8" },
      right: { style: BorderStyle.SINGLE, size: 6, color: "94a3b8" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "e2e8f0" },
      insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "e2e8f0" },
    },
    rows: data.map(([label, value]) => 
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: "f1f5f9" },
            width: { size: 28, type: WidthType.PERCENTAGE },
            padding: { top: 90, bottom: 90, left: 100, right: 80 },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22 })] })],
          }),
          new TableCell({
            padding: { top: 90, bottom: 90, left: 80, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: value, size: 22 })] })],
          }),
        ],
      })
    ),
  });
};

/* ====================== RENDER COMPONENT (Table, Text, Signature) ====================== */
const renderComponent = (section) => {
  const titlePara = new Paragraph({
    spacing: { line: 280, after: 200 },
    children: [new TextRun({ text: safe(section.title).toUpperCase(), bold: true, size: 28, color: "1e40af" })],
  });

  if (section.type === "text") {
    const lines = safe(section.content).split("\n");
    const contentParas = lines
      .filter((l) => l.trim())
      .map((line) =>
        new Paragraph({
          children: [new TextRun({ text: line, size: 22, color: "1f2937" })],
          spacing: { line: 260, after: 120 },
        })
      );
    return [titlePara, ...(contentParas.length > 0 ? contentParas : [new Paragraph({ text: " " })])];
  }

  if (section.type === "table") {
    const cols = section.columns || ["Sr No.", "Description", "SOW", "Comments"];
    const rows = section.rows || [];

    const headerRow = new TableRow({
      tableHeader: true,
      children: cols.map((c) =>
        new TableCell({
          shading: { fill: "e2e8f0" },
          padding: { top: 100, bottom: 100, left: 80, right: 80 },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: safe(c), bold: true, size: 22 })] })],
        })
      ),
    });

    const dataRows = rows.length > 0
      ? rows.map((r, i) =>
          new TableRow({
            children: cols.map((col) =>
              new TableCell({
                shading: { fill: i % 2 === 0 ? "ffffff" : "f8fafc" },
                padding: { top: 90, bottom: 90, left: 80, right: 80 },
                children: [
                  new Paragraph({
                    alignment: col.toLowerCase().includes("sr") ? AlignmentType.CENTER : AlignmentType.LEFT,
                    children: [new TextRun({ text: safe(r[col]) || "", size: 21 })],
                  }),
                ],
              })
            ),
          })
        )
      : [new TableRow({ children: [new TableCell({ columnSpan: cols.length, children: [new Paragraph({ text: "No data" })] })] })];

    return [
      titlePara,
      new Table({
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
      }),
    ];
  }

  if (section.type === "signature") {
    const fields = section.fields || [];
    return [
      titlePara,
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL }, insideHorizontal: { style: BorderStyle.NIL }, insideVertical: { style: BorderStyle.NIL } },
        rows: [
          new TableRow({
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
          }),
        ],
      }),
    ];
  }

  return [titlePara];
};

/* ====================== MAIN GENERATE FUNCTION ====================== */
export const generateDoc = async (schema) => {
  const sorted = [...schema.sections].sort((a, b) => (a.layout?.y || 0) - (b.layout?.y || 0));

  const bodyChildren = [
    ...renderFirstPageHeader(schema.meta),
    new Paragraph({ spacing: { after: 300 } }),
    renderMetaTable(schema.meta),
    new Paragraph({ spacing: { after: 400 } }),
  ];

  // Add all normal sections
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
        cells.push(new TableCell({ width: { size: Math.round(((layout.x - curX) / 12) * 100), type: WidthType.PERCENTAGE }, children: [new Paragraph("")], borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } } }));
      }

      cells.push(
        new TableCell({
          width: { size: Math.round((layout.w / 12) * 100), type: WidthType.PERCENTAGE },
          borders: { top: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" }, bottom: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" }, left: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" }, right: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" } },
          shading: { fill: "fafbfc" },
          padding: { top: 180, bottom: 180, left: 180, right: 180 },
          children: renderComponent(item),
        })
      );
      curX = layout.x + layout.w;
    });

    if (curX < 12) {
      cells.push(new TableCell({ width: { size: Math.round(((12 - curX) / 12) * 100), type: WidthType.PERCENTAGE }, children: [new Paragraph("")], borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } } }));
    }

    const rowHeight = rowItems.reduce((acc, item) => Math.max(acc, item.layout?.h || 8), 8);

    bodyChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL }, insideVertical: { style: BorderStyle.NIL }, insideHorizontal: { style: BorderStyle.NIL } },
        rows: [new TableRow({ children: cells, height: { value: rowHeight * 520, rule: "atLeast" } })],
      })
    );
    bodyChildren.push(new Paragraph({ spacing: { after: 300 } }));
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
          pageBorders: schema.meta.hasBorder
            ? {
                display: PageBorderDisplay.ALL_PAGES,
                zOrder: PageBorderZOrder.FRONT,
                offsetFrom: PageBorderOffsetFrom.PAGE,
                top: { style: BorderStyle.SINGLE, size: 24, color: "000000" },
                bottom: { style: BorderStyle.SINGLE, size: 24, color: "000000" },
                left: { style: BorderStyle.SINGLE, size: 24, color: "000000" },
                right: { style: BorderStyle.SINGLE, size: 24, color: "000000" },
              }
            : undefined,
        },
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
        children: bodyChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
};