import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Children } from 'react';

export function StaggerGrid({ children, className, delay = 0.07 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, i) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.275, delay: i * delay, ease: [0.0, 0.0, 0.2, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}