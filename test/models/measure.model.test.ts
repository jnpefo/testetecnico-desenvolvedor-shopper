import { describe, it, expect, beforeEach } from 'vitest';
import {
    findExistingMeasureInMonth,
    findMeasuresByCustomer,
    updateMeasure,
    createMeasure,
    Measure,
    MeasureType
} from '../../src/models/measure.model';

let measures: Measure[] = [];

const createTestMeasure = (data: Omit<Measure, 'measure_uuid' | 'has_confirmed'>): Measure => {
    const newMeasure = createMeasure(data);
    measures.push(newMeasure);
    return newMeasure;
};

beforeEach(() => {
    measures = [];
});

describe('measure.model', () => {
    it('should create a new measure with a generated UUID and has_confirmed = false', () => {
        const newMeasureData = {
            customer_code: 'TEST_CUSTOMER',
            measure_datetime: new Date('2024-01-15T10:00:00.000Z'),
            measure_type: MeasureType.WATER,
            image_url: 'test_image_url',
            measure_value: 123,
        };

        const newMeasure = createMeasure(newMeasureData);

        expect(newMeasure.measure_uuid).toBeDefined();
        expect(newMeasure.has_confirmed).toBe(false);
        expect(newMeasure).toMatchObject({
            ...newMeasureData,
            measure_uuid: expect.any(String),
            has_confirmed: false,
        });
    });

    describe('findExistingMeasureInMonth', () => {
        it('should find an existing measure in the same month', () => {
            const measure1 = createTestMeasure({
                customer_code: 'TEST_CUSTOMER',
                measure_datetime: new Date('2024-01-15T10:00:00.000Z'),
                measure_type: MeasureType.WATER,
                image_url: 'image1.jpg',
                measure_value: 100,
            });

            const foundMeasure = findExistingMeasureInMonth(
                'TEST_CUSTOMER',
                MeasureType.WATER,
                new Date('2024-01-20T10:00:00.000Z'),
                measures
            );

            expect(foundMeasure).toEqual(measure1);
        });
    });

    describe('findMeasuresByCustomer', () => {
        it('should find all measures for a customer', () => {
            const measure1 = createTestMeasure({
                customer_code: 'TEST_CUSTOMER',
                measure_datetime: new Date('2024-01-15T10:00:00.000Z'),
                measure_type: MeasureType.WATER,
                image_url: 'image1.jpg',
                measure_value: 100,
            });
            const measure2 = createTestMeasure({
                customer_code: 'TEST_CUSTOMER',
                measure_datetime: new Date('2024-02-20T12:00:00.000Z'),
                measure_type: MeasureType.GAS,
                image_url: 'image2.jpg',
                measure_value: 200,
            });
            createTestMeasure({
                customer_code: 'OTHER_CUSTOMER',
                measure_datetime: new Date('2024-03-10T15:00:00.000Z'),
                measure_type: MeasureType.WATER,
                image_url: 'image3.jpg',
                measure_value: 300,
            });

            const foundMeasures = findMeasuresByCustomer('TEST_CUSTOMER', undefined, measures);

            expect(foundMeasures).toHaveLength(2);
            expect(foundMeasures).toContainEqual(measure1);
            expect(foundMeasures).toContainEqual(measure2);
        });

        it('should find measures for a customer and specific measure type', () => {
            const measure1 = createTestMeasure({
                customer_code: 'TEST_CUSTOMER',
                measure_datetime: new Date('2024-01-15T10:00:00.000Z'),
                measure_type: MeasureType.WATER,
                image_url: 'image1.jpg',
                measure_value: 100,
            });
            createTestMeasure({
                customer_code: 'TEST_CUSTOMER',
                measure_datetime: new Date('2024-02-20T12:00:00.000Z'),
                measure_type: MeasureType.GAS,
                image_url: 'image2.jpg',
                measure_value: 200,
            });

            const foundMeasures = findMeasuresByCustomer('TEST_CUSTOMER', MeasureType.WATER, measures);

            expect(foundMeasures).toHaveLength(1);
            expect(foundMeasures).toContainEqual(measure1);
        });

        it('should return an empty array if no measures are found', () => {
            const foundMeasures = findMeasuresByCustomer('NON_EXISTING_CUSTOMER', undefined, measures);
            expect(foundMeasures).toEqual([]);
        });
    });

    describe('updateMeasure', () => {
        it('should update a measure and set has_confirmed to true', async () => {
            const measure1 = createTestMeasure({
                customer_code: 'TEST_CUSTOMER',
                measure_datetime: new Date('2024-01-15T10:00:00.000Z'),
                measure_type: MeasureType.WATER,
                image_url: 'image1.jpg',
                measure_value: 100,
            });

            await updateMeasure(measure1.measure_uuid, 200, measures);

            expect(measures[0].measure_value).toBe(200);
            expect(measures[0].has_confirmed).toBe(true);
        });

        it('should throw an error if the measure does not exist', async () => {
            await expect(updateMeasure('NON_EXISTING_UUID', 200, measures)).rejects.toThrowError('Leitura não encontrada');
        });

        it('should throw an error if the measure is already confirmed', async () => {
            const measure1 = createTestMeasure({
                customer_code: 'TEST_CUSTOMER',
                measure_datetime: new Date('2024-01-15T10:00:00.000Z'),
                measure_type: MeasureType.WATER,
                image_url: 'image1.jpg',
                measure_value: 100,
            });
            await updateMeasure(measure1.measure_uuid, 200, measures);

            await expect(updateMeasure(measure1.measure_uuid, 300, measures)).rejects.toThrowError('Leitura já confirmada');
        });
    });
});
