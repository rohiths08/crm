import multer from 'multer';
import { AppError } from './errorHandler.js';

import os from 'os';

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const ALLOWED_MIMES = ['text/csv', 'application/vnd.ms-excel', 'text/plain', 'application/csv', 'text/x-csv'];
const ALLOWED_EXTS = ['.csv', '.tsv', '.txt'];

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

  if (ALLOWED_MIMES.includes(file.mimetype) || ALLOWED_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError(400, `Invalid file type "${file.mimetype}". Only CSV files are accepted.`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
