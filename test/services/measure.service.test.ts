import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadMeasure, listMeasuresByCustomer, confirmMeasure } from '../../src/services/measure.service';
import {
    createMeasure,
    findExistingMeasureInMonth,
    findMeasuresByCustomer,
    updateMeasure,
    Measure,
    MeasureType,
} from '../../src/models/measure.model';
import { getMeasureFromGemini } from '../../src/services/gemini.service';
import { ValidationError } from '../../src/utils/error.util';
import { UploadRequest } from '../../src/types/measure';

vi.mock('../../src/models/measure.model');
vi.mock('../../src/services/gemini.service');

describe('Measure Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('uploadMeasure', () => {
        it('should throw ValidationError if a measure already exists in the current month', async () => {
            const mockUploadRequest: UploadRequest = {
                customer_code: 'TEST_CUSTOMER',
                measure_type: MeasureType.WATER,
                measure_datetime: new Date().toISOString(),
                image: 'base64image',
            };
            const mockExistingMeasure: Measure = {
                measure_uuid: 'existing_uuid',
                customer_code: 'TEST_CUSTOMER',
                measure_datetime: new Date(),
                measure_type: MeasureType.WATER,
                image_url: 'existing_url',
                measure_value: 100,
                has_confirmed: false,
            };
            (findExistingMeasureInMonth as ReturnType<typeof vi.fn>).mockReturnValue(mockExistingMeasure);

            await expect(uploadMeasure(mockUploadRequest)).rejects.toThrowError(
                new ValidationError('DOUBLE_REPORT', 'Leitura do mês já realizada', 409)
            );
            expect(findExistingMeasureInMonth).toHaveBeenCalledWith(
                'TEST_CUSTOMER',
                MeasureType.WATER,
                expect.any(Date)
            );
            expect(getMeasureFromGemini).not.toHaveBeenCalled();
            expect(createMeasure).not.toHaveBeenCalled();
        });

        it('should call Gemini API and create a new measure if no existing measure is found', async () => {
            const mockUploadRequest: UploadRequest = {
                customer_code: 'TEST_CUSTOMER',
                measure_type: MeasureType.GAS,
                measure_datetime: new Date('2025-05-05T10:00:00.000Z').toISOString(),
                image: 'base64image',
            };
            const mockGeminiResponse = {
                image_url: 'gemini_url',
                measure_value: 120,
            };
            const mockNewMeasure: Measure = {
                measure_uuid: 'new_uuid',
                customer_code: 'TEST_CUSTOMER',
                measure_datetime: new Date('2025-05-05T10:00:00.000Z'),
                measure_type: MeasureType.GAS,
                image_url: 'gemini_url',
                measure_value: 120,
                has_confirmed: false,
            };
            (findExistingMeasureInMonth as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
            (getMeasureFromGemini as ReturnType<typeof vi.fn>).mockResolvedValue(mockGeminiResponse);
            (createMeasure as ReturnType<typeof vi.fn>).mockReturnValue(mockNewMeasure);

            const uploadResponse = await uploadMeasure(mockUploadRequest);

            expect(findExistingMeasureInMonth).toHaveBeenCalledWith(
                'TEST_CUSTOMER',
                MeasureType.GAS,
                expect.any(Date)
            );
            expect(getMeasureFromGemini).toHaveBeenCalledWith('base64image');
            expect(createMeasure).toHaveBeenCalledWith({
                customer_code: 'TEST_CUSTOMER',
                measure_datetime: new Date('2025-05-05T10:00:00.000Z'),
                measure_type: MeasureType.GAS,
                image_url: 'gemini_url',
                measure_value: 120,
            });
            expect(uploadResponse).toEqual({
                image_url: 'gemini_url',
                measure_value: 120,
                measure_uuid: 'new_uuid',
            });
        });

        it('should throw the error if getMeasureFromGemini fails', async () => {
            const mockUploadRequest: UploadRequest = {
                customer_code: 'TEST_CUSTOMER',
                measure_type: MeasureType.WATER,
                measure_datetime: new Date().toISOString(),
                image: 'base64image',
            };
            const mockError = new Error('Gemini API error');
            (findExistingMeasureInMonth as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
            (getMeasureFromGemini as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

            await expect(uploadMeasure(mockUploadRequest)).rejects.toThrowError(mockError);
            expect(findExistingMeasureInMonth).toHaveBeenCalled();
            expect(getMeasureFromGemini).toHaveBeenCalledWith('base64image');
            expect(createMeasure).not.toHaveBeenCalled();
        });
    });

    describe('listMeasuresByCustomer', () => {
        it('should call findMeasuresByCustomer with the provided customer_code and measure_type', () => {
            const mockCustomerCode = 'TEST_CUSTOMER';
            const mockMeasureType = MeasureType.WATER;
            const mockMeasures: Measure[] = [];
            (findMeasuresByCustomer as ReturnType<typeof vi.fn>).mockReturnValue(mockMeasures);

            const result = listMeasuresByCustomer(mockCustomerCode, mockMeasureType);

            expect(findMeasuresByCustomer).toHaveBeenCalledWith(mockCustomerCode, mockMeasureType);
            expect(result).toEqual(mockMeasures);
        });

        it('should call findMeasuresByCustomer with the provided customer_code and undefined measure_type if not provided', () => {
            const mockCustomerCode = 'TEST_CUSTOMER';
            const mockMeasures: Measure[] = [];
            (findMeasuresByCustomer as ReturnType<typeof vi.fn>).mockReturnValue(mockMeasures);

            const result = listMeasuresByCustomer(mockCustomerCode);

            expect(findMeasuresByCustomer).toHaveBeenCalledWith(mockCustomerCode, undefined);
            expect(result).toEqual(mockMeasures);
        });
    });

    describe('confirmMeasure', () => {
        it('should call updateMeasure with the provided measure_uuid and confirmed_value', async () => {
            const mockMeasureUuid = 'test_uuid';
            const mockConfirmedValue = 150;
            (updateMeasure as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

            await confirmMeasure(mockMeasureUuid, mockConfirmedValue);

            expect(updateMeasure).toHaveBeenCalledWith(mockMeasureUuid, mockConfirmedValue);
        });

        it('should throw the error if updateMeasure fails', async () => {
            const mockMeasureUuid = 'test_uuid';
            const mockConfirmedValue = 150;
            const mockError = new Error('Database update failed');
            (updateMeasure as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

            await expect(confirmMeasure(mockMeasureUuid, mockConfirmedValue)).rejects.toThrowError(mockError);
            expect(updateMeasure).toHaveBeenCalledWith(mockMeasureUuid, mockConfirmedValue);
        });
    });
});
