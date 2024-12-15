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
              <p>Check out more portfolios i've worked on</p>
            </motion.div>
        </div>
        </motion.div>
    </>
  )
}

export default ProjectPageTop;