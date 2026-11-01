import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiArrowUpRight } from 'react-icons/fi';

function ProjectModal({ project, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    const { overflow } = document.body.style;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="pj-modal-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="pj-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pj-modal-title"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <button ref={closeRef} type="button" className="pj-modal-close" onClick={onClose} aria-label="Close">
          <FiX />
        </button>
        <div className="pj-modal-media">
          <img src={project.src.desktop} alt={project.alt} decoding="async" />
        </div>
        <div className="pj-modal-body">
          <div className="pj-tags">
            {project.categories.map((cat) => (
              <span className="pj-tag" key={cat}>{cat}</span>
            ))}
          </div>
          <h2 id="pj-modal-title">{project.titleLong}</h2>
          <p>{project.descriptionLong}</p>
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="pj-btn pj-btn-primary">
            Visit live site <FiArrowUpRight />
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProjectModal;
