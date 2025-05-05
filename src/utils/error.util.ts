export class ValidationError extends Error {
    constructor(
        public errorCode: string,
        message: string,
        public statusCode: number
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}
