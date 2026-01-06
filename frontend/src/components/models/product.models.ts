export type CustomFieldDto = {
  _id: string;
  title: string;
  type: 'bullets' | 'content';
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
  productPath: string;
  customFields: CustomFieldDto[];
  uploadFolders: UploadGroupDto[];
  createdAt: string;
  updatedAt: string;
}
