import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../utils/error.util";

const isBase64 = (str: string): boolean => {
    try {
        Buffer.from(str, 'base64').toString('base64') === str;
        return true;
    } catch (e) {
        return false;
    }
};

export const validateUploadRequest = (
    req: Request,
    _: Response,
    next: NextFunction
) => {
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    if (typeof image !== "string" || !isBase64(image)) {
        return next(new ValidationError("INVALID_DATA", "Invalid image (must be base64 string)", 400));
    }

    if (typeof customer_code !== "string") {
        return next(new ValidationError("INVALID_DATA", "Invalid customer_code (must be string)", 400));
    }

    if (typeof measure_datetime !== "string" || isNaN(Date.parse(measure_datetime))) {
        return next(new ValidationError("INVALID_DATA", "Invalid measure_datetime (must be a valid datetime string)", 400));
    }

    if (measure_type !== "WATER" && measure_type !== "GAS") {
        return next(new ValidationError("INVALID_DATA", "Invalid measure_type (must be WATER or GAS)", 400));
    }

    next();
};
