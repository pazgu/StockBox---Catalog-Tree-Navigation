import { environment } from "../environments/environment.development";

const isValidImageUrl = (value?: string | null): boolean => {
  if (!value) return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  if (
    trimmed === "/placeholder.png" ||
    trimmed === "/placeholder-image.png" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return false;
  }

  return true;
};

export const getSafeProductImage = (
  images?: Array<string | null | undefined>,
  singleImage?: string | null,
): string => {
  const firstValidFromArray = images?.find((img) => isValidImageUrl(img));
  if (firstValidFromArray) return firstValidFromArray.trim();

  if (isValidImageUrl(singleImage)) return singleImage!.trim();

  return environment.DEFAULT_PRODUCT_IMAGE_URL;
};

export const getSafeCategoryImage = (image?: string | null): string => {
  if (isValidImageUrl(image)) return image!.trim();

  return environment.DEFAULT_CATEGORY_IMAGE_URL;
};