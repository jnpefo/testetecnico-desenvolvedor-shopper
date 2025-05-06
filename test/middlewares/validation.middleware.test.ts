import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { isValid, parseISO } from 'date-fns';
import { Buffer } from 'node:buffer';
import { validateUploadRequest } from '../../src/middlewares/validation.middleware';
import { ValidationError } from '../../src/utils/error.util';

vi.mock('validator');
vi.mock('date-fns');
vi.mock('node:buffer');

describe('validateUploadRequest Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRequest = {
            body: {},
        };
        mockResponse = {};
        mockNext = vi.fn();
    });

    it('should call next() if the upload request is valid', () => {
        mockRequest.body = {
            image: 'valid_base64_string',
            customer_code: 'ABC123XYZ',
            measure_datetime: new Date().toISOString(),
            measure_type: 'WATER',
        };
        (Buffer.from as ReturnType<typeof vi.fn>).mockReturnValue({ toString: vi.fn().mockReturnValue('valid_base64_string') });
        (validator.isAlphanumeric as ReturnType<typeof vi.fn>).mockReturnValue(true);
        (parseISO as ReturnType<typeof vi.fn>).mockReturnValue(new Date());
        (isValid as ReturnType<typeof vi.fn>).mockReturnValue(true);

        validateUploadRequest(
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    describe('Image Validation', () => {
        it('should call next() with ValidationError if image is not a string', () => {
            mockRequest.body.image = 123;

            validateUploadRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(new ValidationError('INVALID_DATA', 'Invalid image (must be base64 string)', 400));
        });

        it('should call next() with ValidationError if image is not a valid base64 string', () => {
            mockRequest.body.image = 'invalid-base64';
            (Buffer.from as ReturnType<typeof vi.fn>).mockImplementation(() => { throw new Error('Invalid base64'); });

            validateUploadRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(new ValidationError('INVALID_DATA', 'Invalid image (must be base64 string)', 400));
        });

        it('should call next() with ValidationError if image size exceeds limit', () => {
            const oversizedImage = 'a'.repeat(5 * 1024 * 1024 + 1);
            mockRequest.body.image = oversizedImage;
            (Buffer.from as ReturnType<typeof vi.fn>).mockReturnValue({ toString: vi.fn().mockReturnValue(oversizedImage) });

            validateUploadRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(new ValidationError('INVALID_DATA', 'Image size exceeds limit', 400));
        });

        it('should call next() with ValidationError if customer_code is not a string', () => {
            mockRequest.body = {
                image: 'valid_base64_string',
                customer_code: 123,
                measure_datetime: new Date().toISOString(),
                measure_type: 'WATER',
            };
            (Buffer.from as ReturnType<typeof vi.fn>).mockReturnValue({ toString: vi.fn().mockReturnValue('valid_base64_string') });
        
            validateUploadRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
        
            expect(mockNext).toHaveBeenCalledWith(new ValidationError('INVALID_DATA', 'Invalid customer_code (must be string)', 400));
        });

        it('should call next() with ValidationError if customer_code is too long', () => {
            mockRequest.body = {
                image: 'valid_base64_string',
                customer_code: 'A'.repeat(51),
                measure_datetime: new Date().toISOString(),
                measure_type: 'WATER',
            };
            (Buffer.from as ReturnType<typeof vi.fn>).mockReturnValue({ toString: vi.fn().mockReturnValue('valid_base64_string') });
        
            validateUploadRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
        
            expect(mockNext).toHaveBeenCalledWith(new ValidationError('INVALID_DATA', 'Customer code too long', 400));
        });

        it('should call next() with ValidationError if customer_code is not alphanumeric', () => {
            mockRequest.body = {
                image: 'valid_base64_string',
                customer_code: 'ABC-123',
                measure_datetime: new Date().toISOString(),
                measure_type: 'WATER',
            };
            (Buffer.from as ReturnType<typeof vi.fn>).mockReturnValue({ toString: vi.fn().mockReturnValue('valid_base64_string') });
            (validator.isAlphanumeric as ReturnType<typeof vi.fn>).mockReturnValue(false);
        
            validateUploadRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
        
            expect(mockNext).toHaveBeenCalledWith(new ValidationError('INVALID_DATA', 'Customer code must be alphanumeric', 400));
            expect(validator.isAlphanumeric).toHaveBeenCalledWith('ABC-123');
        });

        it('should call next() with ValidationError if measure_datetime is not a string', () => {
            mockRequest.body = {
                image: 'valid_base64_string',
                customer_code: 'TEST_CODE',
                measure_datetime: new Date(),
                measure_type: 'WATER',
            };
            (Buffer.from as ReturnType<typeof vi.fn>).mockReturnValue({ toString: vi.fn().mockReturnValue('valid_base64_string') });
            (validator.isAlphanumeric as ReturnType<typeof vi.fn>).mockReturnValue(true);
        
            validateUploadRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
        
            expect(mockNext).toHaveBeenCalledWith(new ValidationError('INVALID_DATA', 'Invalid measure_datetime (must be a string)', 400));
        });

        it('should call next() with ValidationError if measure_datetime is not a valid ISO 8601 format', () => {
            mockRequest.body = {
                image: 'valid_base64_string',
                customer_code: 'TEST_CODE',
                measure_datetime: 'invalid-datetime',
                measure_type: 'WATER',
            };
            (Buffer.from as ReturnType<typeof vi.fn>).mockReturnValue({ toString: vi.fn().mockReturnValue('valid_base64_string') });
            (validator.isAlphanumeric as ReturnType<typeof vi.fn>).mockReturnValue(true);
            (parseISO as ReturnType<typeof vi.fn>).mockReturnValue(new Date('invalid'));
            (isValid as ReturnType<typeof vi.fn>).mockReturnValue(false);
        
            validateUploadRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
        
            expect(mockNext).toHaveBeenCalledWith(new ValidationError('INVALID_DATA', 'Invalid measure_datetime format (must be ISO 8601)', 400));
            expect(parseISO).toHaveBeenCalledWith('invalid-datetime');
            expect(isValid).toHaveBeenCalledWith(new Date('invalid'));
        });

        it('should call next() with ValidationError if measure_type is not WATER or GAS', () => {
            mockRequest.body = {
                image: 'valid_base64_string',
                customer_code: 'TEST_CODE',
                measure_datetime: new Date().toISOString(),
                measure_type: 'INVALID',
            };
            (Buffer.from as ReturnType<typeof vi.fn>).mockReturnValue({ toString: vi.fn().mockReturnValue('valid_base64_string') });
            (validator.isAlphanumeric as ReturnType<typeof vi.fn>).mockReturnValue(true);
            (parseISO as ReturnType<typeof vi.fn>).mockReturnValue(new Date());
            (isValid as ReturnType<typeof vi.fn>).mockReturnValue(true);
        
            validateUploadRequest(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );
        
            expect(mockNext).toHaveBeenCalledWith(new ValidationError('INVALID_DATA', 'Invalid measure_type (must be WATER or GAS)', 400));
        });
    });
});