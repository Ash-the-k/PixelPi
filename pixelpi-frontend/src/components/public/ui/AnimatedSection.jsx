import { motion } from 'framer-motion';

export function AnimatedSection({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.35,                      // --duration-moderate
        delay,
        ease: [0.32, 0.72, 0, 1],           // --easing-enter
      }}
    >
      {children}
    </motion.div>
  );
}