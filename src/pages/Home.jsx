import React from 'react';
import { motion } from 'framer-motion';
import BannerIntro from '../components/BannerIntro';
import AboutMe from '../components/AboutMe';
import DevelopmentSection from '../components/DevelopmentSection';
import ProjectsSection from '../components/ProjectsSection';
import SkillsAndServices from '../components/SkillsAndServices';

function Home() {
  return (
    <>
      <BannerIntro />
      <AboutMe />
      <DevelopmentSection />
      <ProjectsSection />
      <SkillsAndServices />
    </>
  )
}

export default Home;