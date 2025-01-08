import React from 'react';
import { motion } from 'framer-motion';

function ProjectPageTop() {
  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
        <div className="project-page-top">
            <span className="blur"></span>
            <h2>All Creative Projects</h2>
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
            >
              <p>I have worked on a variety of projects that have helped me grow as a front-end developer. These projects have sharpened my React skills and deepened my understanding of modern web development.</p>
            </motion.div>
        </div>
        </motion.div>
    </>
  )
}

export default ProjectPageTop;