import { MeasureType } from "../types/measure";

export interface Measure {
    measure_uuid: string;
    customer_code: string;
    measure_datetime: Date;
    measure_type: MeasureType;
    image_url: string;
    measure_value: number;
    has_confirmed: boolean;
}

const measures: Measure[] = []; // Simulando o banco de dados em memória

export const createMeasure = (measure: Omit<Measure, "measure_uuid" | "has_confirmed">): Measure => {
    const measure_uuid = crypto.randomUUID();  // Using crypto module to generate UUID
    const newMeasure: Measure = { ...measure, measure_uuid, has_confirmed: false };
    measures.push(newMeasure);
    return newMeasure;
};

export const findExistingMeasureInMonth = (
    customer_code: string,
    measure_type: MeasureType,
    measure_datetime: Date
): Measure | undefined => {
    const startOfMonth = new Date(measure_datetime.getFullYear(), measure_datetime.getMonth(), 1);
    const endOfMonth = new Date(measure_datetime.getFullYear(), measure_datetime.getMonth() + 1, 0);

    return measures.find(
        (m) =>
            m.customer_code === customer_code &&
            m.measure_type === measure_type &&
            m.measure_datetime >= startOfMonth &&
            m.measure_datetime <= endOfMonth
    );
};

export const findMeasuresByCustomer = (
    customer_code: string,
    measure_type?: MeasureType
): Measure[] => {
    let filteredMeasures = measures.filter((m) => m.customer_code === customer_code);

    if (measure_type) {
        filteredMeasures = filteredMeasures.filter(
            (m) => m.measure_type.toUpperCase() === measure_type.toUpperCase()
        );
    }

    return filteredMeasures;
};

export const updateMeasure = async (
    measure_uuid: string,
    confirmed_value: number
): Promise<void> => {
    const measureIndex = measures.findIndex((m) => m.measure_uuid === measure_uuid);

    if (measureIndex === -1) {
        const error: any = new Error("Leitura não encontrada");
        error.errorCode = "MEASURE_NOT_FOUND";
        error.statusCode = 404;
        throw error;
    }

    if (measures[measureIndex].has_confirmed) {
        const error: any = new Error("Leitura já confirmada");
        error.errorCode = "CONFIRMATION_DUPLICATE";
        error.statusCode = 409;
        throw error;
    }

    measures[measureIndex] = { ...measures[measureIndex], measure_value: confirmed_value, has_confirmed: true };
};

export { MeasureType };
