// frontend/src/components/PasswordStrengthIndicator.jsx
import { motion } from 'framer-motion';

export default function PasswordStrengthIndicator({ password }) {
  const calculateStrength = (pwd) => {
    let score = 0;
    
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
    
    return Math.min(score, 5);
  };

  const strength = calculateStrength(password);
  
  const getStrengthInfo = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return { label: 'Very Weak', color: 'bg-red-500', width: '20%' };
      case 2:
        return { label: 'Weak', color: 'bg-orange-500', width: '40%' };
      case 3:
        return { label: 'Fair', color: 'bg-yellow-500', width: '60%' };
      case 4:
        return { label: 'Strong', color: 'bg-emerald-500', width: '80%' };
      case 5:
        return { label: 'Very Strong', color: 'bg-emerald-600', width: '100%' };
      default:
        return { label: '', color: 'bg-gray-200', width: '0%' };
    }
  };

  const info = getStrengthInfo(strength);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3"
    >
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: info.width }}
          transition={{ duration: 0.3 }}
          className={`h-full rounded-full ${info.color}`}
        />
      </div>
      {password && (
        <p className={`text-xs mt-1 ${
          strength <= 1 ? 'text-red-500' :
          strength <= 2 ? 'text-orange-500' :
          strength <= 3 ? 'text-yellow-600' :
          'text-emerald-600'
        }`}>
          Password strength: {info.label}
        </p>
      )}
    </motion.div>
  );
}