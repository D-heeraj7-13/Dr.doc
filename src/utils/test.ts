// Generates a .docx with fake page border + good internal spacing (visible in Google Docs)
// Border thickness FIXED to match screenshot style (~1.25–1.5 pt)

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";

import fs from "fs/promises"; // for Node/script run

function renderSection(section: any): Paragraph[] {
  // TODO: Implement based on your schema structure
  return [new Paragraph("Section content")];
}

function renderHeader(meta: any): Paragraph {
  // TODO: Implement based on your schema structure
  return new Paragraph("Header Lorem ipsum dolor sit amet . The graphic and typographic operators know this well, in reality all the professions dealing with the universe of communication have a stable relationship with these words, but what is it? Lorem ipsum is a dummy text without any sense `that is used in the printing and typesetting industry to fill spaces that will subsequently be occupied by real texts.  It is used to test the layout of a page, to have a preview of the final result and to evaluate the visual impact of a document without being distracted tionship with these words, but what is it? Lorem ipsum is a dummy text without any sense `that is used in the printing and typesetting industry to fill spaces that will subsequently be occupied by real texts.  It is used to test the layout of a page, to have a preview of the final result and to evaluate the visual impact of a document without being distracted tionship with these words, but what is it? Lorem ipsum is a dummy text without any sense `that is used in the printing and typesetting industry to fill spaces that will subsequently be occupied by real texts.  It is used to test the layout of a page, to have a preview of the final result and to evaluate the visual impact of a document without being distracted tionship with these words, but what is it? Lorem ipsum is a dummy text without any sense `that is used in the printing and typesetting industry to fill spaces that will subsequently be occupied by real texts.  It is used to test the layout of a page, to have a preview of the final result and to evaluate the visual impact of a document without being distracted tionship with these words, but what is it? Lorem ipsum is a dummy text without any sense `that is used in the printing and typesetting industry to fill spaces that will subsequently be occupied by real texts.  It is used to test the layout of a page, to have a preview of the final result and to evaluate the visual impact of a document without being distracted tionship with these words, but what is it? Lorem ipsum is a dummy text without any sense `that is used in the printing and typesetting industry to fill spaces that will subsequently be occupied by real texts.  It is used to test the layout of a page, to have a preview of the final result and to evaluate the visual impact of a document without being distracted tionship with these words, but what is it? Lorem ipsum is a dummy text without any sense `that is used in the printing and typesetting industry to fill spaces that will subsequently be occupied by real texts.  It is used to test the layout of a page, to have a preview of the final result and to evaluate the visual impact of a document without being distracted tionship with these words, but what is it? Lorem ipsum is a dummy text without any sense `that is used in the printing and typesetting industry to fill spaces that will subsequently be occupied by real texts.  It is used to test the layout of a page, to have a preview of the final result and to evaluate the visual impact of a document without being distracted tionship with these words, but what is it? Lorem ipsum is a dummy text without any sense `that is used in the printing and typesetting industry to fill spaces that will subsequently be occupied by real texts.  It is used to test the layout of a page, to have a preview of the final result and to evaluate the visual impact of a document without being distracted by the content. Your sections, text, tables, etc. go here and won't touch the border.  Looks much better in Google Docs / Word / LibreOffice. 123123");
}

async function generateBetterBorderTest(schema?: any) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top:    { style: BorderStyle.SINGLE, size: 12, color: "000000" },  // FIXED: thin ~1.5 pt
              bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" },
              left:   { style: BorderStyle.SINGLE, size: 12, color: "000000" },
              right:  { style: BorderStyle.SINGLE, size: 12, color: "000000" },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    // Balanced internal margins – matches screenshot spacing feel
                    margins: {
                      top:    600,    // ~0.42 inch – slightly less than before
                      bottom: 720,    // ~0.5 inch
                      left:   960,    // ~0.67 inch – good left breathing room
                      right:  960,    // symmetric
                    },
                    verticalAlign: "top",

                    children: [
                      // Small top buffer
                      new Paragraph({ spacing: { before: 200 } }),

                      // Your normal content starts here
                      renderHeader(schema?.meta),
                      ...(schema?.sections ?? []).flatMap(renderSection),

                      // Bottom buffer
                      new Paragraph({ spacing: { after: 500 } }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  await fs.writeFile("test-border-fixed-thin.docx", Buffer.from(await blob.arrayBuffer()));
  console.log("Saved: test-border-fixed-thin.docx");
}

generateBetterBorderTest().catch(console.error);