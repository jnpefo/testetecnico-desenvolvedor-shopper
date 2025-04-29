import { Request, Response } from "express";
import { uploadMeasure } from "../services/measure.service";
import { UploadRequest } from "../types/measure";

export const upload = async (req: Request, res: Response) => {
    try {
        const uploadRequest = req.body as UploadRequest;
        const uploadResponse = await uploadMeasure(uploadRequest);
        res.status(200).json(uploadResponse);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            error_code: error.errorCode || "INTERNAL_ERROR",
            error_description: error.message || "Internal server error",
        });
    }
};