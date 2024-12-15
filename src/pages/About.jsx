import React, { useContext } from "react";
import { AppContext } from "../AppProvider";
import { motion } from "framer-motion";
import { MdEmojiEmotions } from "react-icons/md";
import { FaGraduationCap } from "react-icons/fa";

function AboutMe() {
  const { funFact, skills, animationKey, handleFunFacts } = useContext(AppContext);

  return (
    <motion.div
      className="about-me-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <h1 className="about-title">About Me</h1>
      
      <motion.div
        className="about-content"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        <div className="personal-info">
          <p>
            Hi, I’m <strong>Emonefe Ovie Ezekiel</strong>, a passionate <strong>Software Developer</strong> from Delta State, Nigeria but based in Lagos, Nigeria. 
            My current stack includes {skills.map((item,index) => (<strong key={index}>{item.name}, </strong>))} and more.
          </p>
          <p>
            I am a proud graduate of <strong>Mathematics and Education</strong> <FaGraduationCap /> from the University of Lagos, Nigeria. 
            During my studies, I conducted impactful research on the role of <strong>OpenAI technologies</strong> in improving 
            <strong> mathematics learning outcomes</strong> for secondary school students.
          </p>
          <p>
            Beyond coding, I value innovation and creating solutions that make life easier. Let’s build something amazing together!
          </p>
        </div>

        <motion.div
          className="skills-section"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h2>My Skills</h2>
          <div className="skills-grid">
            {skills.map((skill, index) => (
              <motion.div
                className="skill-card"
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <skill.icon className="skill-icon" />
                <p>{skill.name}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <section className="fun-fact">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2>{funFact.heading} <MdEmojiEmotions /></h2>
          <motion.div
            key={animationKey}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
          <p>{funFact.paragraph}</p>
          </motion.div>
        </motion.div>
          <motion.div
            className="button-motion"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <button onClick={() => { handleFunFacts(); }}>Fun Fact</button>
          </motion.div>
        </section>
      </motion.div>
    </motion.div>
  );
};

export default AboutMe;