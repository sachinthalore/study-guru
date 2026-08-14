import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pptToText = require("ppt-to-text");

export const extractPptText = async (buffer) => {
  try {
    const result = await pptToText.readBuffer(buffer);

    const text = pptToText.utils.toTextString(result);

    return text.trim();
  } catch (error) {
    console.error("PPT Extraction Error:", error);

    throw new Error("Failed to extract text from PPT file.");
  }
};