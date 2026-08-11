import { extractPdfText } from "./pdf.service.js";

export const extractText = async (file) => {
  const extension = file.originalname
    .split(".")
    .pop()
    .toLowerCase();

  switch (extension) {
    case "pdf":
      return await extractPdfText(file.buffer);

    case "doc":
    case "docx":
      throw new Error("DOC/DOCX extraction not implemented yet.");

    case "ppt":
    case "pptx":
      throw new Error("PPT/PPTX extraction not implemented yet.");

    case "jpg":
    case "jpeg":
    case "png":
    case "webp":
      throw new Error("Image OCR not implemented yet.");

    default:
      throw new Error("Unsupported file type.");
  }
};