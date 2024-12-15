import React, { useContext } from 'react';
import { AppContext } from '../AppProvider';
import BlurAndSvg from './BlurAndSvg';

function SkillsAndServices() {
    const { development, skills } = useContext(AppContext);

  return (
    <>
        <div className="skills-and-services">
            <BlurAndSvg />
            <h3>Skills and Services</h3>
            <p>I specialize in delivering high-quality, efficient, 
                and scalable solutions that go beyond your expectations. 
                Whether it's building sleek, responsive websites or optimizing 
                user interfaces, my focus is on creating seamless, intuitive 
                digital experiences. From HTML, CSS, and JavaScript to modern 
                frameworks like React, I bring the skills and attention 
                to detail that ensure your project stands out.
            </p>
            <div className="skills">
                {skills.map((item, index) => (
                    <h5 key={index}>{item.name}</h5>
                ))};
            </div>
            <section>
                {development.map((item, index) => (
                    <div key={index}>
                        <h6>{item}</h6>
                        <span></span>
                    </div>
                ))}
            </section>
        </div>
    </>
  )
}

export default SkillsAndServices;