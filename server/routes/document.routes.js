import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {
  validateUploadDocument,
  validateUpdateDocument,
  validateDocumentId,
} from "../validators/document.validator.js";
import {
  uploadDocumentController,
  getAllDocuments,
  getSingleDocument,
  updateDocumentController,
  deleteDocumentController,
  reprocessDocumentAIController,
} from "../controllers/document.controller.js";
import { validateUploadedFileContent } from "../middleware/file-security.middleware.js";


const router = Router();

router.post(
  "/upload",
  authenticate,
  upload.single("document"),
  validateUploadedFileContent,
  validateUploadDocument,
  uploadDocumentController
);

router.get("/", authenticate, getAllDocuments);

router.get(
  "/:id",
  authenticate,
  validateDocumentId,
  getSingleDocument
);

router.patch(
  "/:id",
  authenticate,
  validateDocumentId,
  validateUpdateDocument,
  updateDocumentController
);

router.delete(
  "/:id",
  authenticate,
  validateDocumentId,
  deleteDocumentController
);

router.post(
  "/:id/reprocess-ai",
  authenticate,
  validateDocumentId,
  reprocessDocumentAIController
);

export default router;