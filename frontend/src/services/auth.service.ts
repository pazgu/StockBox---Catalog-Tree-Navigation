import { LoginPayload } from "../components/models/login.models";
import api from "./axios";



class AuthService {
  async login(payload: LoginPayload) {
    const res = await api.post("/auth/login", payload);

    return res;
  }
  async markRequestSent(userId: string) {
    const res = await api.patch("/auth/request-sent", { userId });
    return res.data; 
  }

   setSession(accessToken: string, user: any) {
    localStorage.setItem("token", accessToken);

    localStorage.setItem("user", JSON.stringify(user));
  }
  
}

export const authService = new AuthService();
