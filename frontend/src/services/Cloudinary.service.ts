export interface UploadResult {
  url: string;
  public_id: string;
  originalName: string;
  size: number;
  type: string;
}

export const CloudinaryService = {
  uploadFile: async (file: File, folder = "products") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      "product_uploads"
    );
    formData.append("folder", folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dbludqv2z/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data = await res.json();

    const result = {
      url: data.secure_url,
      publicId: data.public_id,
      size: data.bytes,
      type: data.resource_type,  
      originalName: data.original_name,
    };
    console.log("Cloudinary upload result:", result);
    return result;
  },
};

