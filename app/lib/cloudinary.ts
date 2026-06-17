import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts the public_id from a Cloudinary URL.
 * Example: https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/image_name.jpg
 * Returns: folder/image_name
 */
export function extractPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;

  try {
    // Split by '/upload/' to get the part after it
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    // The part after '/upload/' looks like 'v12345678/folder/public_id.jpg'
    const afterUpload = parts[1];
    
    // Remove the version (if present) e.g., 'v12345678/'
    const segments = afterUpload.split('/');
    const startIndex = segments[0].startsWith('v') && !isNaN(Number(segments[0].substring(1))) ? 1 : 0;
    
    const publicIdWithExtension = segments.slice(startIndex).join('/');
    
    // Remove extension
    const publicId = publicIdWithExtension.split('.')[0];
    
    return publicId;
  } catch (error) {
    console.error('Error extracting Cloudinary public_id:', error);
    return null;
  }
}

/**
 * Deletes an image from Cloudinary using its URL.
 */
export async function deleteCloudinaryImage(url: string) {
  const publicId = extractPublicId(url);
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary delete result for ${publicId}:`, result);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

/**
 * Deletes multiple images from Cloudinary.
 */
export async function deleteCloudinaryImages(urls: any) {
  // Ensure urls is an array
  const safeUrls = Array.isArray(urls) ? urls : [];
  const publicIds = safeUrls
    .filter(url => typeof url === 'string')
    .map(url => extractPublicId(url))
    .filter(Boolean) as string[];
  if (publicIds.length === 0) return;

  try {
    // uploader.destroy only takes one ID at a time, but we can use api.delete_resources
    // for multiple. However, destroyer is safer for single ones.
    // Let's use a loop for now or api.delete_resources if we want batch.
    const results = await Promise.all(
      publicIds.map(id => cloudinary.uploader.destroy(id))
    );
    console.log('Cloudinary batch delete results:', results);
    return results;
  } catch (error) {
    console.error('Cloudinary batch delete error:', error);
    throw error;
  }
}
