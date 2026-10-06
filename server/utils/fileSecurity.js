import sharp from "sharp";
import ApiError from "./apiError.js";
import JSZip from "jszip";

import CFB from "cfb";

const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const OLE_SIGNATURE = Buffer.from([
  0xd0, 0xcf, 0x11, 0xe0,
  0xa1, 0xb1, 0x1a, 0xe1,
]);
const PDF_SIGNATURE = Buffer.from("%PDF-");
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47,
  0x0d, 0x0a, 0x1a, 0x0a,
]);

const matchesSignature = (buffer, signature, offset = 0) => {
  if (buffer.length < offset + signature.length) {
    return false;
  }

  return buffer.subarray(
    offset,
    offset + signature.length
  ).equals(signature);
};

const isJpeg = (buffer) => {
  return (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
};

const isWebp = (buffer) => {
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
};

const validateZipOfficeFile = async (buffer, requiredFile) => {
    if (!matchesSignature(buffer, ZIP_SIGNATURE)) {
      return false;
    }
  
    try {
      const zip = await JSZip.loadAsync(buffer);
  
      const requiredFiles = [
        "[Content_Types].xml",
        "_rels/.rels",
        requiredFile,
      ];
  
      return requiredFiles.every((file) => zip.file(file));
    } catch {
      return false;
    }
  };

  const detectOleOfficeType = (buffer) => {
    if (!matchesSignature(buffer, OLE_SIGNATURE)) {
      return null;
    }
  
    try {
      const cfb = CFB.read(buffer, { type: "buffer" });
  
      const streamNames = cfb.FullPaths.map((path) =>
        path.toLowerCase()
      );
  
      // Word document
      if (
        streamNames.some((name) =>
          name.includes("worddocument")
        )
      ) {
        return "doc";
      }
  
      // Excel workbook
      if (
        streamNames.some((name) =>
          name.includes("workbook")
        )
      ) {
        return "xls";
      }
  
      // PowerPoint presentation
      if (
        streamNames.some((name) =>
          name.includes("powerpoint document")
        )
      ) {
        return "ppt";
      }
  
      return null;
    } catch {
      return null;
    }
  };

const isTextFile = (buffer) => {
  // Reject obvious binary/null-byte content.
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));

  return !sample.includes(0x00);
};

const validateImageContent = async (buffer, extension) => {
  try {
    const metadata = await sharp(buffer).metadata();

    if (!metadata.format) {
      throw new Error("Unknown image format.");
    }

    const actualFormat = metadata.format.toLowerCase();

    const formatMap = {
      jpg: ["jpeg"],
      jpeg: ["jpeg"],
      png: ["png"],
      webp: ["webp"],
    };

    if (!formatMap[extension]?.includes(actualFormat)) {
      throw new Error("Image format does not match file extension.");
    }
  } catch {
    throw new ApiError(
      400,
      "Invalid or corrupted image file."
    );
  }
};

export const validateFileContent = async (file) => {
  if (!file?.buffer || !file?.originalname || !file?.mimetype) {
    throw new ApiError(400, "Invalid uploaded file.");
  }

  const extension = file.originalname
    .split(".")
    .pop()
    .toLowerCase();

  switch (extension) {
    case "pdf":
      if (!matchesSignature(file.buffer, PDF_SIGNATURE)) {
        throw new ApiError(400, "Invalid PDF file.");
      }
      break;

      case "doc":
        case "ppt":
        case "xls": {
          const detectedType = detectOleOfficeType(file.buffer);
        
          if (detectedType !== extension) {
            throw new ApiError(
              400,
              `Invalid ${extension.toUpperCase()} file.`
            );
          }
        
          break;
        }

      case "docx":
        case "pptx":
        case "xlsx": {
          const requiredFileMap = {
            docx: "word/document.xml",
            pptx: "ppt/presentation.xml",
            xlsx: "xl/workbook.xml",
          };
        
          const isValidOfficeFile = await validateZipOfficeFile(
            file.buffer,
            requiredFileMap[extension]
          );
        
          if (!isValidOfficeFile) {
            throw new ApiError(
              400,
              `Invalid ${extension.toUpperCase()} file.`
            );
          }
        
          break;
        }

    case "jpg":
    case "jpeg":
      if (!isJpeg(file.buffer)) {
        throw new ApiError(400, "Invalid JPEG image.");
      }

      await validateImageContent(file.buffer, extension);
      break;

    case "png":
      if (!matchesSignature(file.buffer, PNG_SIGNATURE)) {
        throw new ApiError(400, "Invalid PNG image.");
      }

      await validateImageContent(file.buffer, extension);
      break;

    case "webp":
      if (!isWebp(file.buffer)) {
        throw new ApiError(400, "Invalid WEBP image.");
      }

      await validateImageContent(file.buffer, extension);
      break;

    case "txt":
    case "md":
    case "csv":
      if (!isTextFile(file.buffer)) {
        throw new ApiError(
          400,
          "Invalid text file."
        );
      }
      break;

    default:
      throw new ApiError(
        400,
        "Unsupported file type."
      );
  }

  return true;
};
