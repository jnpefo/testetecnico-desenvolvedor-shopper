import { Request, Response } from 'express';
import { uploadMeasure, listMeasuresByCustomer, confirmMeasure } from '../services/measure.service.js';
import { MeasureType, UploadRequest } from '../types/measure.js';
import { ValidationError } from '../utils/error.util.js';

export const upload = async (req: Request, res: Response) => {
    try {
        const uploadRequest = req.body as UploadRequest;
        const uploadResponse = await uploadMeasure(uploadRequest);

        res.status(200).json(uploadResponse);
    } catch (error: unknown) {
        let statusCode = 500;
        let errorCode = 'INTERNAL_ERROR';
        let errorDescription = 'Internal server error';

        if (error instanceof ValidationError) {
            statusCode = error.statusCode;
            errorCode = error.errorCode;
            errorDescription = error.message;
        } else if (error instanceof Error) {
            errorDescription = error.message;
        }

        res.status(statusCode).json({
            error_code: errorCode,
            error_description: errorDescription,
        });
    }
};

export const list = async (req: Request, res: Response) => {
    try {
        const customer_code = req.params.customer_code;
        const measure_type = req.query.measure_type as MeasureType | undefined;

        if (measure_type && measure_type.toUpperCase() !== 'WATER' && measure_type.toUpperCase() !== 'GAS') {
            throw new ValidationError('INVALID_TYPE', 'Tipo de medição não permitida', 400);
        }

        const measures = listMeasuresByCustomer(customer_code, measure_type);

        if (measures.length === 0) {
            res.status(404).json({
                error_code: 'MEASURES_NOT_FOUND',
                error_description: 'Nenhuma leitura encontrada',
            });
        }

        res.status(200).json({ customer_code, measures });
    } catch (error: unknown) {
        let statusCode = 500;
        let errorCode = 'INTERNAL_ERROR';
        let errorDescription = 'Internal server error';

        if (error instanceof ValidationError) {
            statusCode = error.statusCode;
            errorCode = error.errorCode;
            errorDescription = error.message;
        } else if (error instanceof Error) {
            errorDescription = error.message;
        }

        res.status(statusCode).json({
            error_code: errorCode,
            error_description: errorDescription,
        });
    }
};

export const confirm = async (req: Request, res: Response) => {
    try {
        const { measure_uuid, confirmed_value } = req.body;

        if (typeof measure_uuid !== 'string') {
            throw new ValidationError('INVALID_DATA', 'Invalid measure_uuid (must be a string)', 400);
        }

        if (typeof confirmed_value !== 'number') {
            throw new ValidationError('INVALID_DATA', 'Invalid confirmed_value (must be a number)', 400);
        }

        await confirmMeasure(measure_uuid, confirmed_value);

        res.status(200).json({ success: true });
    } catch (error: unknown) {
        let statusCode = 500;
        let errorCode = 'INTERNAL_ERROR';
        let errorDescription = 'Internal server error';

        if (error instanceof ValidationError) {
            statusCode = error.statusCode;
            errorCode = error.errorCode;
            errorDescription = error.message;
        } else if (error instanceof Error) {
            errorDescription = error.message;
        }

        res.status(statusCode).json({
            error_code: errorCode,
            error_description: errorDescription,
        });
    }
};
