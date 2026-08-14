import os from "os";
import path from "path";
import fs from "fs/promises";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const PPTX2Json = require("pptx2json");

export const extractPptxText = async (buffer) => {
  const tempFile = path.join(
    os.tmpdir(),
    `study-guru-${Date.now()}.pptx`
  );

  try {
    await fs.writeFile(tempFile, buffer);

    const parser = new PPTX2Json();
    const json = await parser.toJson(tempFile);

    const textParts = [];

    const extractStrings = (value) => {
      if (typeof value === "string") {
        textParts.push(value);
        return;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          extractStrings(item);
        }
        return;
      }

      if (value && typeof value === "object") {
        for (const [key, item] of Object.entries(value)) {
          // Avoid collecting obvious non-text binary data.
          if (
            key.toLowerCase().includes("image") ||
            key.toLowerCase().includes("media") ||
            key.toLowerCase().includes("binary")
          ) {
            continue;
          }

          extractStrings(item);
        }
      }
    };

    extractStrings(json);

    return textParts
      .map((text) => text.trim())
      .filter(Boolean)
      .join("\n");
  } finally {
    await fs.rm(tempFile, { force: true });
  }
};