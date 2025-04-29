import express from "express";
import { upload } from "../controllers/measure.controller";
import { validateUploadRequest } from "../middlewares/validation.middleware";

const router = express.Router();

router.post("/upload", validateUploadRequest, upload);

export default router;