import { TextDecoder } from "util";

export const extractTextFile = async (buffer) => {
  const decoder = new TextDecoder("utf-8", {
    fatal: false,
  });

  return decoder.decode(buffer).trim();
};