/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { diskStorage } from 'multer';
import { extname, join } from 'path';
console.log(
  'ABOUT UPLOAD DEST:',
  join(process.cwd(), 'src', 'about', 'aboutUploads', 'images'),
);

export const aboutUploadsOptions = {
  storage: diskStorage({
    destination: join(process.cwd(), 'src', 'about', 'aboutUploads', 'images'),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = extname(file.originalname) || '';
      cb(null, `${unique}${ext}`);
    },
  }),
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!file.mimetype?.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
};
