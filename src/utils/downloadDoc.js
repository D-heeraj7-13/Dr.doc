import { saveAs } from "file-saver";

export const downloadFile = (blob, name = "document.docx") => {
  saveAs(blob, name);
};