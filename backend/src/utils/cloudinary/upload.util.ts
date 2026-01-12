import { cloudinary } from './cloudinary';
import { UploadApiResponse } from 'cloudinary';

export function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload failed'));
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}
