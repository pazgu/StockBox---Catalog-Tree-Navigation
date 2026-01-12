import { AboutBlock, AboutResponse } from "../components/models/about.models";
import { environment } from "../environments/environment.development";
import axios from "axios";
const BASE_URL = environment.API_URL;

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

  uploadImages: async (files: File[]): Promise<AboutResponse> => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f)); 

  const res = await axios.post(`${BASE_URL}/about/images`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
},

replaceImageAt: async (index: number, file: File): Promise<AboutResponse> => {
  const form = new FormData();
  form.append("file", file);

  const res = await axios.put(`${BASE_URL}/about/images/${index}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
},

deleteImageAt: async (index: number): Promise<AboutResponse> => {
  const res = await axios.delete(`${BASE_URL}/about/images/${index}`);
  return res.data;
},

clearImages: async (): Promise<AboutResponse> => {
  const res = await axios.delete(`${BASE_URL}/about/images`);
  return res.data;
},


};
