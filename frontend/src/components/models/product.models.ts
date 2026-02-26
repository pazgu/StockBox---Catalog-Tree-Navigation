export type CustomFieldDto = {
  _id: string;
  title: string;
  type: "bullets" | "content";
  bullets?: string[];
  content?: string;
};

export type UploadFileDto = {
  _id: string;
  link: string;
};

export type UploadFolderDto = {
  _id: string;
  folderName: string;
  files: UploadFileDto[];
};

export type UploadGroupDto = {
  _id: string;
  title: string;
  folders: UploadFolderDto[];
};

export interface ProductDataDto {
  _id: string;
  productName: string;
  productImages: string[];
  productDescription?: string;
  productPath: Array<string>;
  customFields: CustomFieldDto[];
  uploadFolders: UploadGroupDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductDto {
  _id?: string;
  productName: string;
  productImages?: string[];
  productDescription?: string;
  productPath: Array<string>;
  customFields?: CustomFieldDto[];
  uploadFolders?: UploadGroupDto[];
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProductPayload = {
  productName: string;
  productPath: string;
  productDescription?: string;
  customFields?: Record<string, any>;
  imageFile?: File;
  allowAll: boolean;
};

export interface UpdateProductPayload {
  productName?: string;
  productDescription?: string;
  productPath?: string;
  productImages?: (string | File)[];
  customFields?: Array<{
    _id?: string;
    title: string;
    type: "bullets" | "content";
    bullets?: string[];
    content?: string;
  }>;
  uploadFolders?: Array<{
    _id?: string;
    title: string;
    folders: Array<{
      _id?: string;
      folderName: string;
      files: Array<{
        _id?: string;
        link?: string;
        file?: File;
      }>;
    }>;
  }>;
}
