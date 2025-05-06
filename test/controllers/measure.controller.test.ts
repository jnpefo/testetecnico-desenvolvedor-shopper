import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../../src/app';
import { listMeasuresByCustomer, confirmMeasure, uploadMeasure } from '../../src/services/measure.service';
import { ValidationError } from '../../src/utils/error.util';

vi.mock('../../src/services/measure.service');
vi.mock('../../src/middlewares/validation.middleware', () => ({
    validateUploadRequest: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe('Measure Controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('upload', () => {
        it('should return 200 and the upload response on successful upload', async () => {
            const mockUploadRequest = {
                customer_code: 'TEST_CUSTOMER',
                measure_type: 'WATER',
                measure_datetime: new Date().toISOString(),
                image: 'base64image',
            };
            const mockUploadResponse = {
                image_url: 'uploaded_url',
                measure_value: 150,
                measure_uuid: 'uuid123',
            };

            (uploadMeasure as ReturnType<typeof vi.fn>).mockResolvedValue(mockUploadResponse);

            const response = await request(app)
                .post('/measures/upload')
                .send(mockUploadRequest)
                .expect(200);

            expect(response.body).toEqual(mockUploadResponse);
            expect(uploadMeasure).toHaveBeenCalledWith(mockUploadRequest);
        });

        it('should return 400 when uploadMeasure throws a ValidationError', async () => {
            const mockUploadRequest = {
                customer_code: 'INVALID',
                measure_type: 'WATER',
                measure_datetime: new Date().toISOString(),
                image: 'invalid_image',
            };

            (uploadMeasure as ReturnType<typeof vi.fn>).mockRejectedValue(
                new ValidationError('INVALID_UPLOAD', 'Erro na validação da imagem', 400)
            );

            const response = await request(app)
                .post('/measures/upload')
                .send(mockUploadRequest)
                .expect(400);

            expect(response.body).toEqual({
                error_code: 'INVALID_UPLOAD',
                error_description: 'Erro na validação da imagem',
            });
        });

        it('should return 500 when uploadMeasure throws a generic error', async () => {
            const mockUploadRequest = {
                customer_code: 'TEST_CUSTOMER',
                measure_type: 'WATER',
                measure_datetime: new Date().toISOString(),
                image: 'base64image',
            };

            (uploadMeasure as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Falha inesperada'));

            const response = await request(app)
                .post('/measures/upload')
                .send(mockUploadRequest)
                .expect(500);

            expect(response.body).toEqual({
                error_code: 'INTERNAL_ERROR',
                error_description: 'Falha inesperada',
            });
        });
    });

    describe('list', () => {
        it('should return 200 and the list of measures when found', async () => {
            const customerCode = 'TEST_CUSTOMER';
            const mockMeasures = [{ value: 100, datetime: '2025-01-01T00:00:00Z' }];
            (listMeasuresByCustomer as ReturnType<typeof vi.fn>).mockReturnValue(mockMeasures);

            const response = await request(app)
                .get(`/measures/${customerCode}/list`)
                .expect(200);

            expect(response.body).toEqual({
                customer_code: customerCode,
                measures: mockMeasures,
            });
            expect(listMeasuresByCustomer).toHaveBeenCalledWith(customerCode, undefined);
        });

        it('should return 404 when no measures are found', async () => {
            (listMeasuresByCustomer as ReturnType<typeof vi.fn>).mockReturnValue([]);

            const response = await request(app)
                .get('/measures/TEST_CUSTOMER/list')
                .expect(404);

            expect(response.body).toEqual({
                error_code: 'MEASURES_NOT_FOUND',
                error_description: 'Nenhuma leitura encontrada',
            });
        });

        it('should return 400 when measure_type is invalid', async () => {
            const response = await request(app)
                .get('/measures/TEST_CUSTOMER/list?measure_type=ELECTRICITY')
                .expect(400);

            expect(response.body).toEqual({
                error_code: 'INVALID_TYPE',
                error_description: 'Tipo de medição não permitida',
            });
        });
    });

    describe('confirm', () => {
        it('should return 200 when confirmation is successful', async () => {
            (confirmMeasure as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            const response = await request(app)
                .patch('/measures/confirm')
                .send({ measure_uuid: 'uuid123', confirmed_value: 123 })
                .expect(200);

            expect(response.body).toEqual({ success: true });
            expect(confirmMeasure).toHaveBeenCalledWith('uuid123', 123);
        });

        it('should return 400 when measure_uuid is missing or invalid', async () => {
            const response = await request(app)
                .patch('/measures/confirm')
                .send({ confirmed_value: 123 })
                .expect(400);

            expect(response.body.error_code).toBe('INVALID_DATA');
        });

        it('should return 400 when confirmed_value is missing or invalid', async () => {
            const response = await request(app)
                .patch('/measures/confirm')
                .send({ measure_uuid: 'uuid123' })
                .expect(400);

            expect(response.body.error_code).toBe('INVALID_DATA');
        });

        it('should return 500 on unexpected error', async () => {
            (confirmMeasure as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Something went wrong'));

            const response = await request(app)
                .patch('/measures/confirm')
                .send({ measure_uuid: 'uuid123', confirmed_value: 123 })
                .expect(500);

            expect(response.body).toEqual({
                error_code: 'INTERNAL_ERROR',
                error_description: 'Something went wrong',
            });
        });
    });

    describe('confirm', () => {
        it('should return 200 when confirmation is successful', async () => {
            (confirmMeasure as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            const response = await request(app)
                .patch('/measures/confirm')
                .send({ measure_uuid: 'uuid123', confirmed_value: 123 })
                .expect(200);

            expect(response.body).toEqual({ success: true });
            expect(confirmMeasure).toHaveBeenCalledWith('uuid123', 123);
        });

        it('should return 400 when measure_uuid is missing or invalid', async () => {
            const response = await request(app)
                .patch('/measures/confirm')
                .send({ confirmed_value: 123 })
                .expect(400);

            expect(response.body.error_code).toBe('INVALID_DATA');
        });

        it('should return 400 when confirmed_value is missing or invalid', async () => {
            const response = await request(app)
                .patch('/measures/confirm')
                .send({ measure_uuid: 'uuid123' })
                .expect(400);

            expect(response.body.error_code).toBe('INVALID_DATA');
        });

        it('should return 500 on unexpected error', async () => {
            (confirmMeasure as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Something went wrong'));

            const response = await request(app)
                .patch('/measures/confirm')
                .send({ measure_uuid: 'uuid123', confirmed_value: 123 })
                .expect(500);

            expect(response.body).toEqual({
                error_code: 'INTERNAL_ERROR',
                error_description: 'Something went wrong',
            });
        });
    });
});
