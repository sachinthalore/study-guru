import mammoth from "mammoth";

export const extractDocxText = async (buffer) => {
  const result = await mammoth.extractRawText({
    buffer,
  });

  return result.value.trim();
};