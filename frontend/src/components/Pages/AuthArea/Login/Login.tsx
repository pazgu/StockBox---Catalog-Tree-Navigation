import React, { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../../context/UserContext";
import { MailQuestionIcon, UserPen, Lock, User } from "lucide-react";
import { authService } from "../../../../services/auth.service";
import { toast } from "sonner";
import NestedCatalogSVG from "../login.svg";
interface LoginProps {}

const Login: FC<LoginProps> = () => {
  const { setUser } = useUser();
  const handleLogin = async () => {
    // Reset errors
    const newErrors = {
      firstName: false,
      lastName: false,
      userName: false,
      email: false,
    };

    let hasError = false;
    let emailFormatError = false;

    if (!firstName.trim()) {
      newErrors.firstName = true;
      hasError = true;
    }

    if (!lastName.trim()) {
      newErrors.lastName = true;
      hasError = true;
    }

    if (!userName.trim()) {
      newErrors.userName = true;
      hasError = true;
    }

    if (!email.trim()) {
      newErrors.email = true;
      hasError = true;
    } else if (!isValidEmail(email)) {
      newErrors.email = true;
      emailFormatError = true;
    }

    setErrors(newErrors);
    if (hasError) {
      toast.error("נא למלא את כל השדות");
      return;
    }

    if (emailFormatError) {
      toast.error("אימייל לא תקין");
      return;
    }

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
      } else if (error?.response?.status === 500) {
        toast.error("שם משתמש או אימייל כבר קיימים/שגויים במערכת");
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
                    setFirstName(e.target.value);
                    if (errors.firstName) {
                      setErrors({ ...errors, firstName: false });
                    }
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
                    setLastName(e.target.value);
                    if (errors.lastName) {
                      setErrors({ ...errors, lastName: false });
                    }
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
            </div>
          </div>
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
                    setuserName(e.target.value);
                    if (errors.userName) {
                      setErrors({ ...errors, userName: false });
                    }
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
                    setEmail(e.target.value);
                    if (errors.email) {
                      setErrors({ ...errors, email: false });
                    }
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
