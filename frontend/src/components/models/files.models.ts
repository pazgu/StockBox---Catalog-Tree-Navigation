export interface UploadedFile {
  _id?: string;
  uiId: string;
  name: string;
  url: string;  
  size: number; 
  type?: string; 
}

export interface FileFolder {
  _id?: string;
  uiId: string;
  name: string;
  files: UploadedFile[];
}

export interface UploadGroupFrontend {
  uiId: string;
  name: string;
  folders: FileFolder[];
}
