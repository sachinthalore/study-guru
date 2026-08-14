import { extractPdfText } from "./pdf.service.js";
import { extractDocxText } from "./docx.service.js";
import { extractPptxText } from "./pptx.service.js";
import { extractTextFile } from "./text.service.js";
import { extractExcelText } from "./excel.service.js";
import { extractImageText } from "./image.service.js";
import { extractDocText } from "./doc.service.js";
import { extractPptText } from "./ppt.service.js";
export const extractText = async (file) => {
  const extension = file.originalname
    .split(".")
    .pop()
    .toLowerCase();

  switch (extension) {
    case "pdf":
      return await extractPdfText(file.buffer);

    case "docx":
      return await extractDocxText(file.buffer);

    case "doc":
      return await extractDocText(file.buffer);

    case "pptx":
      return await extractPptxText(file.buffer);

    case "ppt":
      return await extractPptText(file.buffer);
      
     
    case "txt":
    case "md":
    case "csv":
      return await extractTextFile(file.buffer);
    case "xls":
    case "xlsx":
      return await extractExcelText(file.buffer);

    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
      return await extractImageText(file.buffer);

    default:
      throw new Error("Unsupported file type.");
  }
};