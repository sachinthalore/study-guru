import { createWorker } from "tesseract.js";

export const extractImageText = async (buffer) => {
  const worker = await createWorker("eng");

  try {
    const {
      data: { text },
    } = await worker.recognize(buffer);

    return text.trim();
  } finally {
    await worker.terminate();
  }
};