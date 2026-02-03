import { environment } from "../environments/environment.development";

import axios, { InternalAxiosRequestConfig } from "axios";

let isRenewing = false;
let renewQueue: ((token: string) => void)[] = [];

export async function tokenRenewInterceptor(
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
  let token = localStorage.getItem("token");

  if (!token) return config;
  if (
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/renew")
  ) {
    return config;
  }
  const tokenExp = getTokenExpiration(token);
  const now = Date.now() / 1000;

  if (tokenExp - now < 2 * 24 * 60 * 60) {
    if (!isRenewing) {
      isRenewing = true;
      try {
        const newToken = await renewToken(token);
        localStorage.setItem("token", newToken);
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
  config.headers = config.headers ?? {};
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
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    },
  );

  return response.data.accessToken;
}
