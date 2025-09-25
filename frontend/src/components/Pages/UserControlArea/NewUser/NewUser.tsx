import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import './NewUser.css';

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
    } catch (error) {
      console.error('שגיאה בשליחת הנתונים:', error);
      alert('אירעה שגיאה בעת הוספת המשתמש');
    }
  };

  return (
    <div className="NewUser">
      <motion.div 
        className="form-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="avatar-section">
          <div className="avatar-placeholder">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="16" r="6" fill="#6B7280"/>
              <path d="M8 32c0-6.627 5.373-12 12-12s12 5.373 12 12" fill="#6B7280"/>
            </svg>
          </div>
        </div>

        <h2 className="form-title">הוספת משתמש חדש</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="user-form">
          <div className="form-group">
            <label htmlFor="firstName">שם פרטי</label>
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.firstName.message}
              </motion.span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">שם משפחה</label>
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.lastName.message}
              </motion.span>
            )}
          </div>


          <div className="form-group">
            <label htmlFor="phoneNumber">טלפון משתמש</label>
            <input
              {...register('phoneNumber')}
              type="tel"
              id="phoneNumber"
              className={errors.phoneNumber ? 'error' : ''}
            />
            {errors.phoneNumber && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.phoneNumber.message}
              </motion.span>
            )}
          </div>


          <div className="form-group">
            <label htmlFor="password">סיסמא</label>
            <div className="password-wrapper">
              <input
                {...register('password')}
                type={showPassword ? "text" : "password"}
                id="password"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "הסתר סיסמא" : "הצג סיסמא"}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.password.message}
              </motion.span>
            )}
          </div>


          <div className="form-group">
            <label htmlFor="email">כתובת מייל</label>
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="yourname@gmail.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && (
              <motion.span 
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {errors.email.message}
              </motion.span>
            )}
          </div>


          <div className="form-group">
            <label htmlFor="companyName">שייך לקבוצה (אופציונלי)</label>
            <select 
              {...register('companyName')}
              id="companyName"
            >
              <option value="">בחר קבוצה</option>
              <option value="company1">קבוצה 1</option>
              <option value="company2">קבוצה 2</option>
              <option value="company3">קבוצה 3</option>
            </select>
          </div>

          <motion.button 
            type="submit"
            className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? 'מוסיף...' : 'הוסף משתמש'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default NewUser;