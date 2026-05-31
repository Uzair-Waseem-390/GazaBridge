// frontend/src/components/LoadingScreen.jsx
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function LoadingScreen() {
  const location = useLocation();

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#F5F0E6] via-white to-[#E8E0D0]"
    >
      <div className="text-center">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
          }}
          className="w-24 h-24 mx-auto mb-8 relative"
        >
          {/* 🖼️ Logo - Circle with Orange-Cream border */}
          <div className="w-full h-full rounded-full overflow-hidden border-4" style={{ 
            borderColor: '#F5F0E6',
            backgroundColor: '#F5F0E6',
            boxShadow: '0 0 20px rgba(224, 122, 95, 0.3)'
          }}>
            <img 
              src="/assets/public/gazabrige.jpg" 
              alt="GazaBridge Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // إذا الصورة ما موجودة، استخدم أيقونة
                e.target.style.display = 'none';
                document.getElementById('logo-fallback').style.display = 'flex';
              }}
            />
          </div>
          
          {/* Icon Fallback */}
          <div 
            id="logo-fallback"
            className="absolute inset-0 w-full h-full rounded-full flex items-center justify-center"
            style={{ 
              display: 'none',
              background: 'linear-gradient(135deg, #E07A5F, #F2CC8F)',
              boxShadow: '0 0 20px rgba(224, 122, 95, 0.4)'
            }}
          >
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-2"
          style={{ 
            fontFamily: "'Instrument Serif', Georgia, serif",
            background: 'linear-gradient(90deg,#E07A5F,#F2CC8F)',
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}
        >
          GazaBridge
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[#555500]"
        >
          Building bridges through education...
        </motion.p>
      </div>
    </motion.div>
  );
}