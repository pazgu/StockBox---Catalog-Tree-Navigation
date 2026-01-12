import { cloudinary } from './cloudinary';

interface CloudinaryDeleteResult {
  result: string;
}

export async function deleteFromCloudinary(
  publicId: string,
): Promise<{ success: boolean }> {
  try {
    const result = (await cloudinary.uploader.destroy(
      publicId,
    )) as CloudinaryDeleteResult;
    return { success: result.result === 'ok' };
  } catch (error) {
    console.error(`Cloudinary delete error for ${publicId}:`, error);
    throw error;
  }
}
