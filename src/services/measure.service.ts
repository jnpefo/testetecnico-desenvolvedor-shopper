import { createMeasure, findExistingMeasureInMonth } from "../models/measure.model";
import { getMeasureFromGemini, generateTemporaryImageUrl } from "./gemini.service";
import { ValidationError } from "../utils/error.util";
import { UploadRequest, UploadResponse } from "../types/measure";

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
        throw new ValidationError("DOUBLE_REPORT", "Leitura do mês já realizada", 409);
    }

    // Obter a medida da API do Gemini
    const measure_value = await getMeasureFromGemini(image);

    // Gerar um link temporário para a imagem
    const image_url = await generateTemporaryImageUrl();

    // Criar a medida no "banco de dados"
    const newMeasure = createMeasure({
        customer_code,
        measure_datetime: new Date(measure_datetime),
        measure_type,
        image_url,
        measure_value,
    });

    const uploadResponse: UploadResponse = {
        image_url: newMeasure.image_url,
        measure_value: newMeasure.measure_value,
        measure_uuid: newMeasure.measure_uuid,
    };

    return uploadResponse;
};