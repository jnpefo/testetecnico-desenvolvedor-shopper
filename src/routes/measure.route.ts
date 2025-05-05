import express from 'express';
import { confirm, list, upload } from '../controllers/measure.controller';
import { validateUploadRequest } from '../middlewares/validation.middleware';

const router = express.Router();

router.post('/upload', validateUploadRequest, upload);
router.get('/:customer_code/list', list);
router.patch('/confirm', confirm);

export default router;
