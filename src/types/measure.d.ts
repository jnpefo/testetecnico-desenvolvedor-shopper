export type MeasureType = "WATER" | "GAS";

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
