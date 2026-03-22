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
} from "docx";

const safe = (val) => (val === null || val === undefined ? "" : String(val));

/* 🟡 HEADER */
const renderHeader = (meta) => {
  const children = [];
  if (meta.logo) {
    try {
      children.push(new ImageRun({ data: meta.logo, transformation: { width: 100, height: 50 } }));
    } catch (e) {
      console.error("Header logo failed", e);
    }
  }
  children.push(new TextRun({ text: safe(meta.title).toUpperCase(), bold: true, size: 28, color: "4f46e5", break: meta.logo ? 1 : 0 }));
  children.push(new TextRun({ text: `CLIENT: ${safe(meta.customer || "INTERNAL")}`, bold: true, size: 18, color: "4b5563", break: 1 }));
  children.push(new TextRun({ text: `DATE: ${safe(meta.date)}`, size: 14, color: "9ca3af", break: 1 }));

  return new Paragraph({ spacing: { after: 300 }, children });
};

/* 🟡 GRID COMPONENTS */
const renderComponent = (section) => {
  const titlePara = new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text: safe(section.title).toUpperCase(), bold: true, size: 14, color: "111827" })]
  });

  if (section.type === "text") {
    const lines = safe(section.content).split("\n");
    const contentParas = lines.map(line => new Paragraph({ 
      children: [new TextRun({ text: line || " ", size: 12, color: "374151" })], 
      spacing: { after: 50 } 
    }));
    return [titlePara, ...contentParas];
  }

  if (section.type === "image" && section.image) {
    try {
      // Ensure dimensions are integers
      const imgW = Math.round((section.layout.w / 12) * 500);
      const imgH = Math.round(section.layout.h * 25);
      
      return [
        titlePara,
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: section.image,
              transformation: { width: imgW, height: imgH },
            })
          ]
        })
      ];
    } catch (e) {
      return [titlePara, new Paragraph({ children: [new TextRun({ text: "Image Error", size: 10, color: "ef4444" })] })];
    }
  }

  if (section.type === "table") {
    const cols = section.columns || ["No Data"];
    const rows = section.rows || [];
    return [
      titlePara,
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { 
          top: { style: BorderStyle.SINGLE, size: 1 }, 
          bottom: { style: BorderStyle.SINGLE, size: 1 }, 
          left: { style: BorderStyle.SINGLE, size: 1 }, 
          right: { style: BorderStyle.SINGLE, size: 1 }, 
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1 }, 
          insideVertical: { style: BorderStyle.SINGLE, size: 1 } 
        },
        rows: [
          new TableRow({
            tableHeader: true,
            children: cols.map(c => new TableCell({ 
              shading: { fill: "f9fafb" }, 
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: safe(c), bold: true, size: 11 })] })] 
            }))
          }),
          ...(rows.length > 0 ? rows.map((r, i) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(i + 1), size: 11 })] })] }),
              ...cols.slice(1).map(c => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: safe(r[c]), size: 11 })] })] }))
            ]
          })) : [new TableRow({ children: [new TableCell({ columnSpan: cols.length, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No data rows", size: 10 })] })] })] })])
        ]
      })
    ];
  }

  if (section.type === "signature") {
    const fields = section.fields || [];
    return [
      titlePara,
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { 
          top: { style: BorderStyle.NIL }, 
          bottom: { style: BorderStyle.NIL }, 
          left: { style: BorderStyle.NIL }, 
          right: { style: BorderStyle.NIL }, 
          insideHorizontal: { style: BorderStyle.NIL }, 
          insideVertical: { style: BorderStyle.NIL } 
        },
        rows: [
          new TableRow({
            children: fields.length > 0 ? fields.map(f => new TableCell({
              borders: { bottom: { style: BorderStyle.SINGLE, size: 1 } },
              padding: { top: 100, bottom: 50 },
              children: [
                new Paragraph({ children: [new TextRun({ text: safe(f.value) || " ", bold: true, size: 12, color: "4f46e5" })] }),
                new Paragraph({ children: [new TextRun({ text: safe(f.label).toUpperCase() || "SIGNATORY", size: 9, color: "6b7280" })] })
              ]
            })) : [new TableCell({ children: [new Paragraph(" ")] })]
          })
        ]
      })
    ];
  }
  return [titlePara, new Paragraph(" ")];
};

/* 🟡 MAIN RENDER */
export const generateDoc = async (schema) => {
  const sorted = [...schema.sections].sort((a, b) => (a.layout?.y || 0) - (b.layout?.y || 0));

  const rows = [];
  let currentRow = [];
  let lastY = -1;

  sorted.forEach(s => {
    if (currentRow.length === 0 || Math.abs((s.layout?.y || 0) - lastY) < 1) {
      currentRow.push(s);
      lastY = (s.layout?.y || 0);
    } else {
      rows.push(currentRow);
      currentRow = [s];
      lastY = (s.layout?.y || 0);
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);

  const children = [renderHeader(schema.meta)];

  rows.forEach(rowItems => {
    rowItems.sort((a, b) => (a.layout?.x || 0) - (b.layout?.x || 0));
    const cells = [];
    let curX = 0;

    rowItems.forEach(item => {
      const layout = item.layout || { x: 0, y: 0, w: 12, h: 6 };
      
      if (layout.x > curX) {
        cells.push(new TableCell({
          width: { size: Math.round(((layout.x - curX) / 12) * 100), type: WidthType.PERCENTAGE },
          children: [new Paragraph("")],
          borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } }
        }));
      }

      cells.push(new TableCell({
        width: { size: Math.round((layout.w / 12) * 100), type: WidthType.PERCENTAGE },
        borders: { 
          top: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" }, 
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" }, 
          left: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" }, 
          right: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" } 
        },
        padding: { top: 150, bottom: 150, left: 150, right: 150 },
        children: renderComponent(item)
      }));
      curX = layout.x + layout.w;
    });

    if (curX < 12) {
      cells.push(new TableCell({
        width: { size: Math.round(((12 - curX) / 12) * 100), type: WidthType.PERCENTAGE },
        children: [new Paragraph("")],
        borders: { top: { style: BorderStyle.NIL }, bottom: { style: BorderStyle.NIL }, left: { style: BorderStyle.NIL }, right: { style: BorderStyle.NIL } }
      }));
    }

    const rowHeight = rowItems.reduce((acc, item) => Math.max(acc, item.layout?.h || 6), 0);

    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: { 
        top: { style: BorderStyle.NIL }, 
        bottom: { style: BorderStyle.NIL }, 
        left: { style: BorderStyle.NIL }, 
        right: { style: BorderStyle.NIL }, 
        insideVertical: { style: BorderStyle.NIL }, 
        insideHorizontal: { style: BorderStyle.NIL } 
      },
      rows: [new TableRow({ 
        children: cells,
        height: { value: rowHeight * 400, rule: "atLeast" }
      })]
    }));
    children.push(new Paragraph({ spacing: { after: 150 } }));
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } },
        pageBorders: schema.meta.hasBorder ? {
          display: PageBorderDisplay.ALL_PAGES,
          zOrder: PageBorderZOrder.FRONT,
          offsetFrom: PageBorderOffsetFrom.PAGE,
          top: { style: BorderStyle.SINGLE, size: 24, color: "000000" },
          bottom: { style: BorderStyle.SINGLE, size: 24, color: "000000" },
          left: { style: BorderStyle.SINGLE, size: 24, color: "000000" },
          right: { style: BorderStyle.SINGLE, size: 24, color: "000000" },
        } : undefined,
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Page ", size: 18 }), PageNumber.CURRENT, new TextRun({ text: " of ", size: 18 }), PageNumber.TOTAL_PAGES] })]
        })
      },
      children
    }]
  });

  return await Packer.toBlob(doc);
};
