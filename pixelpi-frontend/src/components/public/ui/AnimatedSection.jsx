import { motion } from 'framer-motion';

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  // Pass `as` if you need a non-div element (e.g., section, article)
  as: Tag = 'div',
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.275,
        delay,
        ease: [0.0, 0.0, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}