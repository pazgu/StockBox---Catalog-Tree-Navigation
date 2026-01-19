import { environment } from "../environments/environment.development";
import api from "../services/axios";

import axios, { InternalAxiosRequestConfig } from "axios";

let isRenewing = false;
let renewQueue: ((token: string) => void)[] = [];

export async function tokenRenewInterceptor(
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> {
  let token = localStorage.getItem("token");
  console.log("🚀 Interceptor triggered for URL:", config.url);

  if (!token) return config;

  const tokenExp = getTokenExpiration(token);
  const now = Date.now() / 1000;

  if (tokenExp - now < 2 * 24 * 60 * 60) {
    if (!isRenewing) {
      isRenewing = true;
      try {
        const newToken = await renewToken(token);
        localStorage.setItem("token", newToken);
        console.log("Token renewed", newToken);
        renewQueue.forEach((cb) => cb(newToken));
        renewQueue = [];
        token = newToken;
      } catch (err) {
        console.error("Token renewal failed", err);
      } finally {
        isRenewing = false;
      }
    } else {
      await new Promise<string>((resolve) => {
        renewQueue.push(resolve);
      }).then((newToken) => {
        token = newToken;
      });
    }
  }

  if (!config.headers) {
    config.headers = config.headers ?? {};
  }
  (config.headers as any).Authorization = `Bearer ${token}`;

  return config;
}

function getTokenExpiration(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp;
  } catch {
    return 0;
  }
}

async function renewToken(token: string): Promise<string> {
  const response = await axios.post<{ accessToken: string }>(
    `${environment.API_URL}/auth/renew`, 
    { token },
    {
      withCredentials: true, 
    }
  );

  return response.data.accessToken;
}
