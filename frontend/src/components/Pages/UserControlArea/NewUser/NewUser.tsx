import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../../context/UserContext';

// Zod validation schema
const userSchema = z.object({
  firstName: z
    .string()
    .min(1, 'שם פרטי הוא שדה חובה')
    .min(2, 'שם פרטי חייב להכיל לפחות 2 תווים')
    .regex(/^[א-תa-zA-Z\s]+$/, 'שם פרטי יכול להכיל רק אותיות עבריות או אנגליות'),
    
  lastName: z
    .string()
    .min(1, 'שם משפחה הוא שדה חובה')
    .min(2, 'שם משפחה חייב להכיל לפחות 2 תווים')
    .regex(/^[א-תa-zA-Z\s]+$/, 'שם משפחה יכול להכיל רק אותיות עבריות או אנגליות'),
    
  phoneNumber: z
    .string()
    .min(1, 'מספר טלפון הוא שדה חובה')
    .regex(
      /^(\+972|0)([2-9]\d{7,8}|5[0-9]\d{7})$/,
      'מספר טלפון לא תקין. '
    ),
    
  password: z
    .string()
    .min(1, 'סיסמא היא שדה חובה')
    .min(6, 'סיסמא חייבת להכיל לפחות 6 תווים')
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'סיסמא חייבת להכיל לפחות אות אחת ומספר אחד'),
    
  email: z
    .string()
    .min(1, 'כתובת מייל היא שדה חובה')
    .email('פורמט מייל לא תקין')
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'כתובת מייל לא תקינה'
    ),
    
  companyName: z.string().optional()
});

type UserFormData = z.infer<typeof userSchema>;

const NewUser: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate=useNavigate();
  const {role}=useUser();

useEffect(() => {

    if (role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: 'onChange'
  });



  const onSubmit = async (data: UserFormData) => {
    try {
      console.log('User data:', data);
      
      reset();
      alert('המשתמש נוסף בהצלחה!');
      navigate('/AllUsers');
    } catch (error) {
      console.error('שגיאה בשליחת הנתונים:', error);
      alert('אירעה שגיאה בעת הוספת המשתמש');
    }
  };

  return (
    <div className="flex justify-center items-start pt-[120px] w-full box-border fixed top-16">
      <motion.div 
        className="bg-white scale-90 origin-top transform-gpu border border-gray-200 rounded-lg  shadow-2xl px-6 py-4 h-[400px] w-[90%] flex flex-col relative max-w-[85vw]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3 mb-5 rtl">
          <div className="order-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex justify-center items-center border border-gray-200">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="16" r="6" fill="#6B7280"/>
                <path d="M8 32c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#6B7280"/>
              </svg>
            </div>
          </div>
          <h2 className="m-0 text-lg font-bold text-[#0a2340]">הוספת משתמש חדש</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-row rtl text-right flex-wrap gap-5 justify-center">
          <div className="flex flex-col mb-3 min-w-[300px] max-w-[350px]">
            <label htmlFor="firstName" className="mb-2 text-sm font-semibold text-gray-700 rtl text-right">שם פרטי</label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className={`py-3 px-4 border rounded-lg text-base outline-none transition-all duration-200 rtl text-right bg-white min-h-6 leading-6 ${
                errors.firstName 
                  ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' 
                  : 'border-gray-300 focus:border-[#0D305B] focus:shadow-[0_0_0_3px_rgba(13,48,91,0.1)]'
              }`}
            />
            {errors.firstName && (
              <motion.span 
                className="text-red-500 text-[13px] mt-1.5 block text-right rtl font-medium opacity-100 transition-opacity duration-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.firstName.message}
              </motion.span>
            )}
          </div>

          <div className="flex flex-col mb-3 min-w-[300px] max-w-[350px]">
            <label htmlFor="lastName" className="mb-2 text-sm font-semibold text-gray-700 rtl text-right">שם משפחה</label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className={`py-3 px-4 border rounded-lg text-base outline-none transition-all duration-200 rtl text-right bg-white min-h-6 leading-6 ${
                errors.lastName 
                  ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' 
                  : 'border-gray-300 focus:border-[#0D305B] focus:shadow-[0_0_0_3px_rgba(13,48,91,0.1)]'
              }`}
            />
            {errors.lastName && (
              <motion.span 
                className="text-red-500 text-[13px] mt-1.5 block text-right rtl font-medium opacity-100 transition-opacity duration-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.lastName.message}
              </motion.span>
            )}
          </div>

          <div className="flex flex-col mb-3 min-w-[300px] max-w-[350px]">
            <label htmlFor="phoneNumber" className="mb-2 text-sm font-semibold text-gray-700 rtl text-right">טלפון משתמש</label>
            <input
              {...register('phoneNumber')}
              type="tel"
              id="phoneNumber"
              className={`py-3 px-4 border rounded-lg text-base outline-none transition-all duration-200 rtl text-right bg-white min-h-6 leading-6 ${
                errors.phoneNumber 
                  ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' 
                  : 'border-gray-300 focus:border-[#0D305B] focus:shadow-[0_0_0_3px_rgba(13,48,91,0.1)]'
              }`}
            />
            {errors.phoneNumber && (
              <motion.span 
                className="text-red-500 text-[13px] mt-1.5 block text-right rtl font-medium opacity-100 transition-opacity duration-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.phoneNumber.message}
              </motion.span>
            )}
          </div>

          <div className="flex flex-col mb-3 min-w-[300px] max-w-[350px]">
            <label htmlFor="password" className="mb-2 text-sm font-semibold text-gray-700 rtl text-right">סיסמא</label>
            <div className="relative flex items-center">
              <input
                {...register('password')}
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full pl-12 py-3 px-4 border rounded-lg text-base outline-none transition-all duration-200 rtl text-right bg-white min-h-6 leading-6 ${
                  errors.password 
                    ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' 
                    : 'border-gray-300 focus:border-[#0D305B] focus:shadow-[0_0_0_3px_rgba(13,48,91,0.1)]'
                }`}
              />
              <button
                type="button"
                className="absolute left-3 bg-transparent border-none cursor-pointer text-gray-500 p-1 h-auto flex items-center transition-colors duration-200 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "הסתר סיסמא" : "הצג סיסמא"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <motion.span 
                className="text-red-500 text-[13px] mt-1.5 block text-right rtl font-medium opacity-100 transition-opacity duration-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.password.message}
              </motion.span>
            )}
          </div>

          <div className="flex flex-col mb-3 min-w-[300px] max-w-[350px]">
            <label htmlFor="email" className="mb-2 text-sm font-semibold text-gray-700 rtl text-right">כתובת מייל</label>
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="yourname@gmail.com"
              className={`py-3 px-4 border rounded-lg text-base outline-none transition-all duration-200 rtl text-right bg-white min-h-6 leading-6 placeholder:text-gray-400 placeholder:rtl placeholder:text-right placeholder:text-base ${
                errors.email 
                  ? 'border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' 
                  : 'border-gray-300 focus:border-[#0D305B] focus:shadow-[0_0_0_3px_rgba(13,48,91,0.1)]'
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

          <div className="flex flex-col mb-0 min-w-[300px] max-w-[350px]">
            <label htmlFor="companyName" className="mb-2 text-sm font-semibold text-gray-700 rtl text-right">שייך לקבוצה (אופציונלי)</label>
            <select 
              {...register('companyName')}
              id="companyName"
              className="cursor-pointer py-3 px-4 pl-10 border border-gray-300 rounded-lg text-base outline-none transition-all duration-200 rtl text-right bg-white min-h-6 leading-6 appearance-none focus:border-[#0D305B] focus:shadow-[0_0_0_3px_rgba(13,48,91,0.1)]"
              style={{
                backgroundImage: `url('data:image/svg+xml;utf8,<svg fill="%23374151" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>')`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 12px center',
                backgroundSize: '20px'
              }}
            >
              <option value="">בחר קבוצה</option>
              <option value="company1">קבוצה 1</option>
              <option value="company2">קבוצה 2</option>
              <option value="company3">קבוצה 3</option>
            </select>
          </div>
        </form>

        <motion.button 
          type="submit"
          className={`mt-4 bg-[#0D305B] text-white py-3.5 px-8 text-base font-semibold border-none rounded-lg cursor-pointer transition-all duration-200 self-center w-auto min-w-[140px] absolute bottom-5 right-[42%] hover:bg-[#0a2340] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(13,48,91,0.3)] ${
            isSubmitting ? 'opacity-70 cursor-not-allowed transform-none' : ''
          }`}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting ? 'מוסיף...' : 'הוסף משתמש'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NewUser;