import React from 'react';
import BlurAndSvg from '../components/BlurAndSvg';
import ProjectPageTop from '../components/ProjectPageTop';
import ProfessionProjects from '../components/ProfessionProjects';
import LikedProjects from '../components/LikedProjects';
import { motion } from "framer-motion";

function Projects() {
  return (
    <>
      <ProjectPageTop />  
      <ProfessionProjects />
      <div className="blur-div">
        <BlurAndSvg />
      </div>
      <LikedProjects />
    </>
  )
}

export default Projects;