import axios from "./axios"; // This should be your axios instance with the interceptor
import type { SearchResponse } from "../types/types";
import { environment } from "../environments/environment.development";
class SearchService {
  private apiBaseUrl = environment.API_URL;

  async getDropdownResults(query: string) {
    const token = localStorage.getItem("token");
    
    const res = await axios.get<SearchResponse>(`${this.apiBaseUrl}/search/dropdown`, {
      params: { q: query },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  }

  async getFullSearch(query: string) {
    const token = localStorage.getItem("token");

    const res = await axios.get<SearchResponse>(`${this.apiBaseUrl}/search`, {
      params: { 
        q: query
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  }
}

export const searchService = new SearchService();