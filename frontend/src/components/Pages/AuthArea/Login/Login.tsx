import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { MailQuestionIcon, UserPen, Lock, User, ArrowLeft } from "lucide-react";
import { authService } from "../../../../services/auth.service";
import { toast } from "sonner";
import { boolean } from "zod";
import isEmail from "validator/lib/isEmail";

import NestedCatalogSVG from "./login.svg";
interface LoginProps {}

const Login: FC<LoginProps> = () => {
  const { setUser } = useUser();
  const [isReturningUser, setIsReturningUser] = useState<boolean | null>(null);
  const handleLogin = async () => {
  const newErrors = { firstName: false, lastName: false, userName: false, email: false };
  const newFieldErrors = { firstName: "", lastName: "", userName: "", email: "" };

  const hebrewOnly = /^[א-ת\s]+$/;
  const englishOnly = /^[a-zA-Z\s]+$/;
  const arabicOnly = /^[\u0600-\u06FF\s]+$/;
  const validChars = /^[א-תa-zA-Z\u0600-\u06FF\s]+$/;
  const validUserNameChars = /^[א-תa-zA-Z\u0600-\u06FF0-9]+$/;
  const validUserNameLang = /^[א-ת0-9]+$|^[a-zA-Z0-9]+$|^[\u0600-\u06FF0-9]+$/;

  if (!isReturningUser) {
    if (!firstName.trim()) {
      newErrors.firstName = true;
      newFieldErrors.firstName = "שם פרטי הוא שדה חובה";
    } else if (!validChars.test(firstName.trim())) {
      newErrors.firstName = true;
      newFieldErrors.firstName = "רק אותיות";
    } else if (!hebrewOnly.test(firstName.trim()) && !englishOnly.test(firstName.trim()) && !arabicOnly.test(firstName.trim())) {
      newErrors.firstName = true;
      newFieldErrors.firstName = "לא ניתן לערבב שפות";
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = true;
      newFieldErrors.firstName = "שם פרטי חייב להכיל לפחות 2 אותיות";
    }

    if (!lastName.trim()) {
      newErrors.lastName = true;
      newFieldErrors.lastName = "שם משפחה הוא שדה חובה";
    } else if (!validChars.test(lastName.trim())) {
      newErrors.lastName = true;
      newFieldErrors.lastName = "רק אותיות";
    } else if (!hebrewOnly.test(lastName.trim()) && !englishOnly.test(lastName.trim()) && !arabicOnly.test(lastName.trim())) {
      newErrors.lastName = true;
      newFieldErrors.lastName = "לא ניתן לערבב שפות";
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = true;
      newFieldErrors.lastName = "שם משפחה חייב להכיל לפחות 2 אותיות";
    }
  }

  if (!isReturningUser) {
    if (!userName.trim()) {
      newErrors.userName = true;
      newFieldErrors.userName = "שם משתמש הוא שדה חובה";
    } else if (!validUserNameChars.test(userName.trim())) {
      newErrors.userName = true;
      newFieldErrors.userName = "רק אותיות ומספרים";
    } else if (!validUserNameLang.test(userName.trim())) {
      newErrors.userName = true;
      newFieldErrors.userName = "לא ניתן לערבב שפות";
    } else if ((userName.trim().match(/[א-תa-zA-Z\u0600-\u06FF]/g) || []).length < 2) {
      newErrors.userName = true;
      newFieldErrors.userName = "חייב להכיל לפחות 2 אותיות";
    }
  } else {
    if (!userName.trim()) {
      newErrors.userName = true;
      newFieldErrors.userName = "שם משתמש הוא שדה חובה";
    }
  }
  if (!email.trim()) {
    newErrors.email = true;
    newFieldErrors.email = "כתובת מייל היא שדה חובה";
  } else if (!isEmail(email.trim())) {
    newErrors.email = true;
    newFieldErrors.email = "כתובת מייל לא תקינה";
  }

  setErrors(newErrors);
  setFieldErrors(newFieldErrors);

  if (Object.values(newErrors).some((e) => e)) return;
    try {
      const res = await authService.login({
        firstName,
        lastName,
        userName,
        email,
      });
      if (res.status === 201) {
        const { accessToken, user } = res.data;

        authService.setSession(accessToken, user);

        toast.success("התחברת בהצלחה");
        setUser(user);
        navigate("/");
      }
    } catch (error: any) {
      const code = error.response?.data?.code;
      const userId = error.response?.data?.userId;

      if (code === "USER_CREATED_NOT_APPROVED") {
        toast.info("משתמש חדש נוצר – נשלחת בקשת אישור");

        openApprovalMail();

        await authService.markRequestSent(userId);

        setFirstName("");
        setLastName("");
        setuserName("");
        setEmail("");
        setErrors({
          firstName: false,
          lastName: false,
          userName: false,
          email: false,
        });
      } else if (code === "USER_NOT_APPROVED_REQUEST_SENT") {
        toast.info("משתמש לא מאושר – בקשתך כבר נשלחה");
      } else if (code === "USER_NOT_APPROVED_REQUEST_NOT_SENT") {
        openApprovalMail();

        if (userId) {
          authService
            .markRequestSent(userId)
            .then(() => {
              toast.success("בקשה נשלחה בהצלחה");
            })
            .catch(() => toast.error("שגיאה בשליחת הבקשה"));
        }
      } else if (error?.response?.status === 409) {
        toast.error("שם משתמש או אימייל כבר קיימים/שגויים במערכת");
      } else if (error?.response?.status === 500) {
        toast.error("שגיאת שרת, אנא נסי שוב מאוחר יותר");
      } else {
        toast.error("שגיאה לא צפויה, אנא נסה שוב");
      }
    }
  };

  const openApprovalMail = () => {
    const emailTo = "Superstockbox@outlook.com";
    const subject = encodeURIComponent("בקשה לאישור משתמש");
    const body = encodeURIComponent(`שלום,

אני מבקש אישור משתמש למערכת StockBox.

תודה`);

    window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
  };

  const navigate = useNavigate();

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setuserName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    userName: false,
    email: false,
  });
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
  });

  const { role } = useUser();

  useEffect(() => {
    if (role === "editor") {
      navigate("/");
    }
  }, [navigate, role]);

  return (
    <div className="h-230 pt-20 flex p-0 overflow-hidden box-border w-full">
      <div className="flex-1 flex justify-center items-center pr-8">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-md p-8 mt-6 border border-slate-100 animate-fadeInUp">
          <h1 className="text-3xl font-bold text-right text-gray-800 mb-6 -mt-3">
            התחברות
          </h1>
          {isReturningUser === null ? (
            <div className="flex flex-col items-center gap-5 py-2">
              <div className="w-full text-center">
                <p className="text-gray-800 font-bold text-xl">
                  האם כבר נרשמת בעבר?
                </p>
              </div>

              <div className="w-full h-px bg-gray-100" />

              <div className="flex flex-col gap-3 w-50%">
              <button
                type="button"
                onClick={() => {
                  setIsReturningUser(false);
                  setFirstName("");
                  setLastName("");
                  setuserName("");
                  setEmail("");
                  setErrors({ firstName: false, lastName: false, userName: false, email: false });
                  setFieldErrors({ firstName: "", lastName: "", userName: "", email: "" });
                }}
                  className="w-full flex px-5 py-4 rounded-xl border-2 border-blue-900 bg-blue-900 text-white font-semibold text-base transition-all duration-200 hover:bg-blue-800 hover:border-blue-800 hover:shadow-md active:scale-95 focus:outline-none group display-flex"
                >
                  <span>לא, זוהי ההתחברות הראשונה שלי</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsReturningUser(true);
                    setFirstName("");
                    setLastName("");
                    setuserName("");
                    setEmail("");
                    setErrors({ firstName: false, lastName: false, userName: false, email: false });
                    setFieldErrors({ firstName: "", lastName: "", userName: "", email: "" });
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-700 font-semibold text-base transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900 active:scale-95 focus:outline-none group"
                >
                  <span className="mr-5">כן, ביצעתי התחברות בעבר</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <button
                  type="button"
                  onClick={() => {
                  setIsReturningUser(null);
                  setFirstName("");
                  setLastName("");
                  setuserName("");
                  setEmail("");
                  setErrors({ firstName: false, lastName: false, userName: false, email: false });
                  setFieldErrors({ firstName: "", lastName: "", userName: "", email: "" });
                }}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-900 transition-colors duration-200 focus:outline-none"
                >
                  <ArrowLeft size={16} className="rotate-180" />
                </button>

                <span className="text-blue-900 font-medium">
                  {isReturningUser ? "משתמש קיים" : "משתמש חדש"}
                </span>
              </div>
              {!isReturningUser && (
                <div className="mb-7 flex gap-4">
                  <div className="flex-1">
                    <label className="block text-right text-gray-700 font-semibold mb-4 text-base">
                      שם פרטי
                    </label>
                    <div className="relative w-full">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFirstName(val);
                          const trimmed = val.trim();
                          const hebrewOnly = /^[א-ת\s]+$/;
                          const englishOnly = /^[a-zA-Z\s]+$/;
                          const arabicOnly = /^[\u0600-\u06FF\s]+$/;
                          const validChars = /^[א-תa-zA-Z\u0600-\u06FF\s]+$/;
                          let error = "";
                          if (!trimmed) error = "שם פרטי הוא שדה חובה";
                          else if (!validChars.test(trimmed)) error = "רק אותיות";
                          else if (!hebrewOnly.test(trimmed) && !englishOnly.test(trimmed) && !arabicOnly.test(trimmed)) error = "לא ניתן לערבב שפות";
                          else if ((trimmed.match(/[א-תa-zA-Z\u0600-\u06FF]/g) || []).length < 2) error = "שם פרטי חייב להכיל לפחות 2 אותיות";
                          setErrors({ ...errors, firstName: !!error });
                          setFieldErrors((prev) => ({ ...prev, firstName: error }));
                        }}
                        className={`w-full py-3 px-4 pl-11 border-2 ${errors.firstName ? "border-red-300" : "border-gray-300"} rounded-lg text-right text-sm`}
                        placeholder="הכנס שם פרטי..."
                        dir="rtl"
                      />
                        <User
                          size={20}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                      </div>
                      {fieldErrors.firstName && (
                        <span className="text-red-500 text-xs mt-1 block text-right">{fieldErrors.firstName}</span>
                      )}
                    </div>
                  <div className="flex-1">
                    <label className="block text-right text-gray-700 font-semibold mb-4 text-base">
                      שם משפחה
                    </label>
                    <div className="relative w-full">
                      <input
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLastName(val);
                        const trimmed = val.trim();
                        const hebrewOnly = /^[א-ת\s]+$/;
                        const englishOnly = /^[a-zA-Z\s]+$/;
                        const arabicOnly = /^[\u0600-\u06FF\s]+$/;
                        const validChars = /^[א-תa-zA-Z\u0600-\u06FF\s]+$/;
                        let error = "";
                        if (!trimmed) error = "שם משפחה הוא שדה חובה";
                        else if (!validChars.test(trimmed)) error = "רק אותיות";
                        else if (!hebrewOnly.test(trimmed) && !englishOnly.test(trimmed) && !arabicOnly.test(trimmed)) error = "לא ניתן לערבב שפות";
                        else if (trimmed.length < 2) error = "שם משפחה חייב להכיל לפחות 2 תווים";
                        setErrors({ ...errors, lastName: !!error });
                        setFieldErrors((prev) => ({ ...prev, lastName: error }));
                      }}
                      className={`w-full py-3 px-4 pl-11 border-2 ${errors.lastName ? "border-red-300" : "border-gray-300"} rounded-lg text-right text-sm`}
                      placeholder="הכנס שם משפחה..."
                      dir="rtl"
                    />
                      <User
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                    </div>
                    {fieldErrors.lastName && (
                      <span className="text-red-500 text-xs mt-1 block text-right">{fieldErrors.lastName}</span>
                    )}
                  </div>
                </div>
              )}
              <div className="mb-7 flex gap-4">
                <div className="flex-1">
                  <label className="block text-right text-gray-700 font-semibold mb-4 text-base">
                    שם משתמש
                  </label>
                  <div className="relative w-full">
                    <input
                    type="text"
                    value={userName}
                    onChange={(e) => {
                    const val = e.target.value;
                    setuserName(val);
                    const trimmed = val.trim();
                    const validUserNameChars = /^[א-תa-zA-Z\u0600-\u06FF0-9]+$/;
                    const validUserNameLang = /^[א-ת0-9]+$|^[a-zA-Z0-9]+$|^[\u0600-\u06FF0-9]+$/;
                    let error = "";
                    if (!trimmed) {
                      error = "שם משתמש הוא שדה חובה";
                    } else if (!isReturningUser) {
                      if (!validUserNameChars.test(trimmed)) error = "רק אותיות ומספרים";
                      else if (!validUserNameLang.test(trimmed)) error = "לא ניתן לערבב שפות";
                      else if ((trimmed.match(/[א-תa-zA-Z\u0600-\u06FF]/g) || []).length < 2) error = "חייב להכיל לפחות 2 אותיות";
                    }
                    setErrors({ ...errors, userName: !!error });
                    setFieldErrors((prev) => ({ ...prev, userName: error }));
                  }}
                    className={`w-full py-3 px-4 pl-11 border-2 ${errors.userName ? "border-red-300" : "border-gray-300"} rounded-lg text-right text-sm`}
                    placeholder="הכנס שם משתמש..."
                    dir="rtl"
                  />
                    <UserPen
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                  </div>
                  {fieldErrors.userName && (
                    <span className="text-red-500 text-xs mt-1 block text-right">{fieldErrors.userName}</span>
                  )}
                </div>

                {/* אימייל */}
                <div className="flex-1">
                  <label className="block text-right text-gray-700 font-semibold mb-4 text-base">
                    אימייל
                  </label>
                  <div className="relative w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEmail(val);
                      const trimmed = val.trim();
                      let error = "";
                      if (!trimmed) error = "כתובת מייל היא שדה חובה";
                      else if (!isEmail(trimmed)) error = "כתובת מייל לא תקינה";
                      setErrors({ ...errors, email: !!error });
                      setFieldErrors((prev) => ({ ...prev, email: error }));
                    }}
                    className={`w-full py-3 px-4 pl-11 border-2 ${errors.email ? "border-red-300" : "border-gray-300"} rounded-lg text-right text-sm`}
                    placeholder="הכנס אימייל..."
                    dir="rtl"
                  />
                    <MailQuestionIcon
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                  </div>
                  {fieldErrors.email && (
                    <span className="text-red-500 text-xs mt-1 block text-right">{fieldErrors.email}</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="
                  w-full
                  bg-blue-900
                  text-white
                  py-3
                  px-5
                  rounded-lg
                  font-semibold
                  text-base
                  transition-all
                  duration-200
                  hover:bg-blue-800
                  hover:shadow-lg
                  hover:shadow-blue-900/30
                  active:scale-95
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                  focus:ring-offset-2
                "
              >
                התחבר
              </button>
            </>
          )}
        </div>
      </div>

      <div className="sticky flex-1 flex items-center justify-center p-0 pt-8">
        <div className="sticky flex-1 flex items-center justify-center p-0">
          <NestedCatalogSVG />
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
