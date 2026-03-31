

// minimal-test-border.ts

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";

async function minimalBorderTest() {
  const doc = new Document({
    sections: [{
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top:    { style: BorderStyle.SINGLE, size: 36, color: "0000FF" }, // blue thick
            bottom: { style: BorderStyle.SINGLE, size: 36, color: "0000FF" },
            left:   { style: BorderStyle.SINGLE, size: 36, color: "0000FF" },
            right:  { style: BorderStyle.SINGLE, size: 36, color: "0000FF" },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph("← This blue border should be visible around the page in Google Docs →"),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  // download logic here (file-saver or a tags etc.)
}
