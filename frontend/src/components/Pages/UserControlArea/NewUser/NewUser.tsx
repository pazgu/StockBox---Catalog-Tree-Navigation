import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useUser } from "../../../../context/UserContext";
import { toast } from "sonner";
import { User } from "../../../../types/types"
import { LucideX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const userSchema = z.object({
  userName: z
    .string()
    .min(1, "שם משתמש הוא שדה חובה")
    .min(2, "שם משתמש חייב להכיל לפחות 2 תווים")
    .regex(
      /^[א-תa-zA-Z\s]+$/,
      "שם משתמש יכול להכיל רק אותיות, מספרים וקו תחתון"
    ),

  email: z
    .string()
    .min(1, "כתובת מייל היא שדה חובה")
    .email("פורמט מייל לא תקין")
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "כתובת מייל לא תקינה"
    ),
  companyName: z.string().optional(),
  role: z
    .string()
    .min(1, "סוג משתמש הוא שדה חובה")
    .refine((val) => val === "viewer" || val === "editor", {
      message: "סוג משתמש לא חוקי",
    }),
});

type UserFormData = z.infer<typeof userSchema>;

const NewUser: React.FC = () => {
  const { role, addUser } = useUser();
  const navigate = useNavigate();
  const goToAllUsers = () => {
    navigate("/AllUsers");
  };
  useEffect(() => {
    if (role !== "editor") {
      navigate("/");
    }
  }, [navigate, role]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      const newUser: User = {
        firstName: "",
        lastName: "",
        userName: data.userName,
        email: data.email,
        role: data.role as "editor" | "viewer",
        approved: false,
        requestSent: false,
      };

      addUser(newUser);

      reset();
      toast.success("משתמש נוסף בהצלחה!");
      navigate("/AllUsers");
    } catch (error) {
      console.error("שגיאה בשליחת הנתונים:", error);
      toast.error("שגיאה בשליחת נתונים");
    }
  };

  return (
    <div className="flex justify-center items-start pt-36 w-full box-border top-16">
      <motion.div
        className="bg-white scale-90 origin-top transform-gpu border border-gray-200 rounded-lg shadow-2xl px-5 py-3 h-auto w-[90%] flex flex-col relative max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-4 rtl">
          <div className="order-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex justify-center items-center border border-gray-200">
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="16" r="6" fill="#6B7280" />
                <path
                  d="M8 32c0-6.627 5.373-12 12-12s12 5.373 12 12"
                  fill="#6B7280"
                />
              </svg>
            </div>
          </div>
          <h2 className="m-0 text-lg font-bold text-[#0a2340]">
            הוספת משתמש חדש
          </h2>
        </div>
        <LucideX
          onClick={goToAllUsers}
          className="absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700"
        />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-row rtl text-right gap-12 justify-center"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col min-w-[320px] max-w-[380px]">
              <label
                htmlFor="userName"
                className="mb-2 text-sm font-semibold text-gray-700 rtl text-right"
              >
                שם משתמש
              </label>
              <input
                {...register("userName")}
                type="text"
                id="userName"
                className={`py-3 px-4 border rounded-lg text-base outline-none transition-all duration-200 rtl text-right bg-white min-h-6 leading-6 ${
                  errors.userName
                    ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                    : "border-gray-300 focus:border-[#0D305B] focus:shadow-[0_0_0_3px_rgba(13,48,91,0.1)]"
                }`}
              />
              {errors.userName && (
                <motion.span
                  className="text-red-500 text-[13px] mt-1.5 block text-right rtl font-medium opacity-100 transition-opacity duration-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.userName.message}
                </motion.span>
              )}
            </div>

            <div className="flex flex-col min-w-[320px] max-w-[380px]">
              <label
                htmlFor="email"
                className="mb-2 text-sm font-semibold text-gray-700 rtl text-right"
              >
                כתובת מייל
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                placeholder="yourname@gmail.com"
                className={`py-3 px-4 border rounded-lg text-base outline-none transition-all duration-200 rtl text-right bg-white min-h-6 leading-6 placeholder:text-gray-400 placeholder:rtl placeholder:text-right placeholder:text-base ${
                  errors.email
                    ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                    : "border-gray-300 focus:border-[#0D305B] focus:shadow-[0_0_0_3px_rgba(13,48,91,0.1)]"
                }`}
              />
              {errors.email && (
                <motion.span
                  className="text-red-500 text-[13px] mt-1.5 block text-right rtl font-medium opacity-100 transition-opacity duration-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.email.message}
                </motion.span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col w-[200px]">
              <label
                htmlFor="role"
                className="mb-2 text-sm font-semibold text-gray-700 rtl text-right"
              >
                סוג משתמש
              </label>
              <div className="relative">
                <select
                  {...register("role")}
                  id="role"
                  className={`cursor-pointer py-3 px-4 pl-10 border rounded-lg text-base outline-none transition-all duration-200 rtl text-right bg-white min-h-6 leading-6 appearance-none w-full ${
                    errors.role
                      ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                      : "border-gray-300 focus:border-[#0D305B] focus:shadow-[0_0_0_3px_rgba(13,48,91,0.1)]"
                  }`}
                  style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%23374151" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "left 12px center",
                    backgroundSize: "20px",
                  }}
                >
                  <option value="">בחר סוג</option>
                  <option value="editor">מנהל</option>
                  <option value="viewer">משתמש</option>
                </select>
              </div>
              {errors.role && (
                <motion.span
                  className="text-red-500 text-[13px] mt-1.5 block text-right rtl font-medium opacity-100 transition-opacity duration-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errors.role.message}
                </motion.span>
              )}
            </div>

            <div className="flex flex-col w-[200px]">
              <label
                htmlFor="companyName"
                className="mb-2 text-sm font-semibold text-gray-700 rtl text-right"
              >
                שייך לקבוצה
              </label>
              <select
                {...register("companyName")}
                id="companyName"
                className="cursor-pointer py-3 px-4 pl-10 border border-gray-300 rounded-lg text-base outline-none transition-all duration-200 rtl text-right bg-white min-h-6 leading-6 appearance-none focus:border-[#0D305B] focus:shadow-[0_0_0_3px_rgba(13,48,91,0.1)]"
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%23374151" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "left 12px center",
                  backgroundSize: "20px",
                }}
              >
                <option value="">בחר קבוצה</option>
                <option value="company1">קבוצה 1</option>
                <option value="company2">קבוצה 2</option>
                <option value="company3">קבוצה 3</option>
              </select>
            </div>
          </div>
        </form>

        <motion.button
          type="submit"
          className={`mt-6 bg-[#0D305B] text-white py-3 px-8 text-base font-semibold border-none rounded-lg cursor-pointer transition-all duration-200 self-center w-auto min-w-[140px] hover:bg-[#0a2340] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(13,48,91,0.3)] ${
            isSubmitting ? "opacity-70 cursor-not-allowed transform-none" : ""
          }`}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting ? "מוסיף..." : "הוסף משתמש"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NewUser;
