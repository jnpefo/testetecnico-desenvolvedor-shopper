import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/error.util';
import validator from 'validator';
import { isValid, parseISO } from 'date-fns';
import { Buffer } from 'node:buffer';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const CUSTOMER_CODE_MAX_LENGTH = 50;

const isBase64 = (str: string): boolean => {
    try {
        Buffer.from(str, 'base64').toString('base64') === str;
        return true;
    } catch (error: unknown) {
        if (error) { 
            return false;
        } else {
            return false;
        }
    }
};

export const validateUploadRequest = (
    req: Request,
    _: Response,
    next: NextFunction
) => {
    const { image, customer_code, measure_datetime, measure_type } = req.body;

    // Validação da Imagem
    if (typeof image !== 'string' || !isBase64(image)) {
        return next(new ValidationError('INVALID_DATA', 'Invalid image (must be base64 string)', 400));
    }
    if (image.length > MAX_IMAGE_SIZE) {
        return next(new ValidationError('INVALID_DATA', 'Image size exceeds limit', 400));
    }

    // Validação do Customer Code
    if (typeof customer_code !== 'string') {
        return next(new ValidationError('INVALID_DATA', 'Invalid customer_code (must be string)', 400));
    }
    if (customer_code.length > CUSTOMER_CODE_MAX_LENGTH) {
        return next(new ValidationError('INVALID_DATA', 'Customer code too long', 400));
    }
    if (!validator.isAlphanumeric(customer_code)) {
        return next(new ValidationError('INVALID_DATA', 'Customer code must be alphanumeric', 400));
    }

    // Validação da Data e Hora
    if (typeof measure_datetime !== 'string') {
        return next(new ValidationError('INVALID_DATA', 'Invalid measure_datetime (must be a string)', 400));
    }

    const parsedDate = parseISO(measure_datetime);
    if (!isValid(parsedDate)) {
        return next(new ValidationError('INVALID_DATA', 'Invalid measure_datetime format (must be ISO 8601)', 400));
    }

    // Validação do Tipo de Medida
    if (measure_type !== 'WATER' && measure_type !== 'GAS') {
        return next(new ValidationError('INVALID_DATA', 'Invalid measure_type (must be WATER or GAS)', 400));
    }

    next();
};
