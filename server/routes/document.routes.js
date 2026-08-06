import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import {
  validateUploadDocument,
  validateUpdateDocument,
} from "../validators/document.validator.js";
import {
  uploadDocumentController,
  getAllDocuments,
  getSingleDocument,
  updateDocumentController,
  deleteDocumentController,
} from "../controllers/document.controller.js";
const router = Router();

router.post(
  "/upload",
  authenticate,
  upload.single("document"),
  validateUploadDocument,
  uploadDocumentController
);
router.get("/", authenticate, getAllDocuments);

router.get("/:id", authenticate, getSingleDocument);

router.patch(
  "/:id",
  authenticate,
  validateUpdateDocument,
  updateDocumentController
);

router.delete(
  "/:id",
  authenticate,
  deleteDocumentController
);
export default router;