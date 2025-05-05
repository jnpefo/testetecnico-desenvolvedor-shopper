import {
    createMeasure,
    findExistingMeasureInMonth,
    Measure,
    MeasureType,
    findMeasuresByCustomer,
    updateMeasure
} from '../models/measure.model';
import { getMeasureFromGemini } from './gemini.service';
import { ValidationError } from '../utils/error.util';
import { UploadRequest, UploadResponse } from '../types/measure';

export const uploadMeasure = async (
    uploadRequest: UploadRequest
): Promise<UploadResponse> => {
    const { customer_code, measure_type, measure_datetime, image } = uploadRequest;

    // Validar se já existe uma leitura no mês
    const existingMeasure = findExistingMeasureInMonth(
        customer_code,
        measure_type,
        new Date(measure_datetime)
    );
    if (existingMeasure) {
        throw new ValidationError('DOUBLE_REPORT', 'Leitura do mês já realizada', 409);
    }

    // Obter a medida da API do Gemini
    const measureFromGemini = await getMeasureFromGemini(image);

    // Criar a medida no "banco de dados"
    const newMeasure = createMeasure({
        customer_code,
        measure_datetime: new Date(measure_datetime),
        measure_type,
        image_url: measureFromGemini.image_url,
        measure_value: measureFromGemini.measure_value,
    });

    const uploadResponse: UploadResponse = {
        image_url: newMeasure.image_url,
        measure_value: newMeasure.measure_value,
        measure_uuid: newMeasure.measure_uuid,
    };

    return uploadResponse;
};

export const listMeasuresByCustomer = (
    customer_code: string,
    measure_type?: MeasureType
): Measure[] => {
    return findMeasuresByCustomer(customer_code, measure_type);
};

export const confirmMeasure = async (
    measure_uuid: string,
    confirmed_value: number
): Promise<void> => {
    await updateMeasure(measure_uuid, confirmed_value);
};
