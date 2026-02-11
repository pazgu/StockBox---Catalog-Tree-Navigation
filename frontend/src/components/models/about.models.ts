

export type BlockType = "intro" | "features" | "bullets" | "paragraph" | "cta";

export type AboutBlock = {
  id: string;
  type: BlockType;
  data: any;
};

export type AboutResponse = {
  blocks: AboutBlock[];
  images: string[];
  updatedAt: string;
};
