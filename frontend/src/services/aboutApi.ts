import axios from "axios";

const BASE_URL = "http://localhost:4000";

export type BlockType = "intro" | "features" | "bullets" | "paragraph";

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

export const aboutApi = {
  get: async (): Promise<AboutResponse> => {
    const res = await axios.get(`${BASE_URL}/about`);
    return res.data;
  },

  replace: async (payload: {
    blocks: AboutBlock[];
    images: string[];
  }): Promise<AboutResponse> => {
    const res = await axios.put(`${BASE_URL}/about`, payload);
    return res.data;
  },

  saveBlock: async (
    blockId: string,
    payload: AboutBlock
  ): Promise<AboutResponse> => {
    const res = await axios.patch(`${BASE_URL}/about/blocks/${blockId}`, payload);
    return res.data;
  },
};
