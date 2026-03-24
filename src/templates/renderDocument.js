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
      children.push(new ImageRun({ data: meta.logo, transformation: { width: 120, height: 60 } }));
      children.push(new TextRun({ text: "", break: 1 }));
    } catch (e) {
      console.error("Header logo failed", e);
    }
  }
  
  children.push(new TextRun({ text: safe(meta.title).toUpperCase(), bold: true, size: 32, color: "4f46e5" }));
  children.push(new TextRun({ text: safe(meta.customer || "INTERNAL"), size: 20, color: "4f46e5", bold: true, break: 1 }));
  children.push(new TextRun({ text: `DATE: ${safe(meta.date)}`, size: 14, color: "6b7280", break: 1 }));

  return new Paragraph({ spacing: { after: 400, line: 360 }, children });
};

/* 🟡 GRID COMPONENTS */
const renderComponent = (section) => {
  const titlePara = new Paragraph({
    spacing: { line: 240, after: 150 },
    children: [new TextRun({ text: safe(section.title).toUpperCase(), bold: true, size: 16, color: "4f46e5" })]
  });

  if (section.type === "text") {
    const lines = safe(section.content).split("\n");
    const contentParas = lines.filter(l => l.trim()).map(line => new Paragraph({ 
      children: [new TextRun({ text: line, size: 12, color: "1f2937" })], 
      spacing: { line: 240, after: 100 },
      alignment: AlignmentType.LEFT
    }));
    return [titlePara, ...(contentParas.length > 0 ? contentParas : [new Paragraph({ text: " " })])];
  }

  if (section.type === "image" && section.image) {
    try {
      // Better image sizing based on section layout
      const imgW = Math.round((section.layout.w / 12) * 400);
      const imgH = Math.round(section.layout.h * 30);
      
      return [
        titlePara,
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 150 },
          children: [
            new ImageRun({
              data: section.image,
              transformation: { width: Math.max(imgW, 200), height: Math.max(imgH, 150) },
            })
          ]
        })
      ];
    } catch (e) {
      console.error("Image rendering error:", e);
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
          top: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" }, 
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" }, 
          left: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" }, 
          right: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" }, 
          insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" }, 
          insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" } 
        },
        rows: [
          new TableRow({
            tableHeader: true,
            children: cols.map(c => new TableCell({ 
              shading: { fill: "f0f4f8" }, 
              padding: { top: 80, bottom: 80, left: 60, right: 60 },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: safe(c), bold: true, size: 12, color: "1f2937" })] })] 
            }))
          }),
          ...(rows.length > 0 ? rows.map((r, i) => new TableRow({
            children: [
              new TableCell({ 
                shading: { fill: "ffffff" },
                padding: { top: 70, bottom: 70, left: 60, right: 60 },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(i + 1), size: 11, color: "6b7280" })] })] 
              }),
              ...cols.slice(1).map(c => new TableCell({ 
                shading: { fill: "ffffff" },
                padding: { top: 70, bottom: 70, left: 60, right: 60 },
                children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: safe(r[c]) || "", size: 11, color: "374151" })] })] 
              }))
            ]
          })) : [new TableRow({ children: [new TableCell({ columnSpan: cols.length, shading: { fill: "f9fafb" }, padding: { top: 100, bottom: 100, left: 60, right: 60 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No data rows", size: 10, color: "9ca3af" })] })] })] })])
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
              borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "d1d5db" } },
              padding: { top: 150, bottom: 100 },
              children: [
                new Paragraph({ 
                  spacing: { after: 200 },
                  children: [new TextRun({ text: safe(f.value) || " ", bold: false, size: 12, color: "1f2937" })] 
                }),
                new Paragraph({ 
                  children: [new TextRun({ text: safe(f.label).toUpperCase() || "SIGNATORY", size: 9, color: "6b7280" })] 
                })
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
          top: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" }, 
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" }, 
          left: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" }, 
          right: { style: BorderStyle.SINGLE, size: 6, color: "e5e7eb" } 
        },
        shading: { fill: "fafbfc" },
        padding: { top: 200, bottom: 200, left: 200, right: 200 },
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
        height: { value: rowHeight * 500, rule: "atLeast" }
      })]
    }));
    children.push(new Paragraph({ spacing: { after: 300 } }));
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
