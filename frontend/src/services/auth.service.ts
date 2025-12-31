import axios from "./axios";

export interface LoginPayload {
  userName: string;
  email: string;
}

class AuthService {
  async login(payload: LoginPayload) {
    const res = await axios.post("/auth/login", payload);

    const { accessToken, user } = res.data;

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  }
  async markRequestSent(userId: string) {
    const res = await axios.patch("/auth/request-sent", { userId });
    return res; 
  }

   setSession(accessToken: string, user: any) {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
  }
  
}


export const authService = new AuthService();
