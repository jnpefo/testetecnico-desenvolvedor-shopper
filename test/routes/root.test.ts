import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import rootRouter from '../../src/routes/health.route';

describe('Root Route', () => {
    let app: express.Express;

    beforeEach(() => {
        app = express();
        app.use('/', rootRouter);
    });

    it('should return 200 and "Server is running!!"', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.text).toBe('Server is running!!');
    });
});
