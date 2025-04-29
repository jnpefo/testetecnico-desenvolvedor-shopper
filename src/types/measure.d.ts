export type MeasureType = "WATER" | "GAS";

export interface UploadRequest {
    image: string; // base64
    customer_code: string;
    measure_datetime: string; // ISO 8601 string
    measure_type: MeasureType;
}

export interface UploadResponse {
    image_url: string;
    measure_value: number;
    measure_uuid: string;
}

export interface ErrorResponse {
    error_code: string;
    error_description: string;
}
