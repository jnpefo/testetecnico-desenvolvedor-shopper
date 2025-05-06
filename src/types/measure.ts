export enum MeasureType {
    WATER = 'WATER',
    GAS = 'GAS',
}

export interface UploadRequest {
    image: string; // base64
    customer_code: string;
    measure_datetime: string; // ISO 8601 string
    measure_type: MeasureType;
}

export interface IGetMeasureFromGemini {
    image_url: string;
    measure_value: number;
}

export interface UploadResponse extends IGetMeasureFromGemini {
    measure_uuid: string;
}

export interface ErrorResponse {
    error_code: string;
    error_description: string;
}

export class AppError extends Error {
    errorCode?: string;
    statusCode?: number;

    constructor(message: string, errorCode?: string, statusCode?: number) {
        super(message);
        this.name = 'AppError';
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
}

export interface Measure {
    measure_uuid: string;
    customer_code: string;
    measure_datetime: Date;
    measure_type: MeasureType;
    image_url: string;
    measure_value: number;
    has_confirmed: boolean;
}
