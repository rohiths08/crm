import { Router } from 'express';
import { upload } from '../middlewares/upload.js';
import { handleImport } from '../controllers/import.controller.js';

const router = Router();

router.post('/import', upload.single('file'), handleImport);

export default router;
