import React, { useContext } from 'react';
import { AppContext } from '../AppProvider';

function ProfessionProjects() {
  const { lightMode, projectOpen, setProjectOpen, slowTransition, projects, select, selected, projectsData } = useContext(AppContext);

  return (
    <>
        {projectsData.map((item, index) => (
          <div key={index} className="professional-projects">
              <section onClick={() => { setProjectOpen(projectOpen === index ? null : index); }} className="professional-header">
                <div>
                  <h3>{item.projectType}</h3>
                  <p>{item.projectTypeDescription}</p>
                </div>
                <svg style={slowTransition} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill={lightMode ? '#00050F' : '#fff'}><path d={projectOpen === index ? 'M480-360 280-560h400L480-360Z' : 'm280-400 200-200 200 200H280Z'}/></svg>
              </section>
              <section className={`actual-projects ${projectOpen === index ? 'projects-opened' : ''}`}>
                {item.projects.map((items, idx) => (
                  <div key={idx} onClick={() => window.open(items.link, '_blank')} className="single-project whole">
                    <img src={items.src.desktop} alt={items.alt} />
                    <article>
                      <h6>{items.title}</h6>
                      <p>{items.description}</p>
                    </article>
                    <section className="hovered">
                      <h4>{items.titleLong}</h4>
                      <p>{items.descriptionLong}</p>
                    </section>
                  </div>
                ))}
              </section>
          </div>
        ))}
    </>
  )
}

export default ProfessionProjects;