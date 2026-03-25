import { tokenRenewInterceptor } from "../interceptors/tokenRenewal.interceptor";
import { environment } from "../environments/environment.development";
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL: environment.API_URL,
  withCredentials: true,
});
api.interceptors.request.use(tokenRenewInterceptor);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const code = (error.response?.data as any)?.code;

    if (status === 403) {
      if (code === "USER_NOT_APPROVED_REQUEST_NOT_SENT") {
        const emailTo = "Superstockbox@outlook.com";
        const subject = encodeURIComponent("בקשה לאישור משתמש");
        const body = encodeURIComponent(
          "שלום,\n\nאני מבקש אישור משתמש למערכת StockBox.\n\nתודה"
        );

        window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
      }
      if(code === "USER_IS_BLOCKED"){
        toast.error("המשתמש שלך חסום, אין אפשרות להתחבר")
      }
    }

    return Promise.reject(error);
  }
);

export default api;
