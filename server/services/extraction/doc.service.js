import { createRequire } from "module";

const require = createRequire(import.meta.url);
const WordExtractor = require("word-extractor");

export const extractDocText = async (buffer) => {
  const extractor = new WordExtractor();

  const document = await extractor.extract(buffer);

  return document.getBody().trim();
};