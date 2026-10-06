import { validateFileContent } from "../utils/fileSecurity.js";

export const validateUploadedFileContent = async (req, res, next) => {
  try {
    await validateFileContent(req.file);
    next();
  } catch (error) {
    next(error);
  }
};