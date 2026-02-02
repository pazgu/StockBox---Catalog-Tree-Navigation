import axios from "./axios";
import type { SearchResponse } from "../types/types";
import { environment } from "../environments/environment.development";
import api from "./axios";
class SearchService {
  private apiBaseUrl = environment.API_URL;

  async getDropdownResults(query: string) {
    const token = localStorage.getItem("token");

    const res = await api.get<SearchResponse>(
      `${this.apiBaseUrl}/search/dropdown`,
      {
        params: { q: query, limit: 3 },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.data;
  }

  async getFullSearch(query: string, page: number = 1, limit: number = 20) {
    const token = localStorage.getItem("token");

    const res = await api.get<SearchResponse>(`${this.apiBaseUrl}/search`, {
      params: {
        q: query,
        page: page,
        limit: limit,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  }
}

export const searchService = new SearchService();
