import React, { useContext } from 'react';
import { AppContext } from '../AppProvider';
import { Link, NavLink, useLocation } from 'react-router-dom';

function ProjectsSection() {
  const { projects, generateRandomProject } = useContext(AppContext);

  return (
    <>
        <div className="project-section">
          <section>
            <div className="selected-works">
              <h3>Selected works</h3>
              <h3>2022 - 2024</h3>
            </div>
            <div className="view-all">
              <p>Check out more projects i've worked on</p>
              <Link to='/Projects'>
                <button>view all</button>
              </Link>
            </div>
          </section>
          <section>
            {generateRandomProject(projects, 6).map((items, index) => (
              <div key={index} className="single-project">
                <img src={items.src.desktop} alt={items.alt} />
                <article>
                  <h6>{items.title}</h6>
                  <p>{items.description}</p>
                </article>
              </div>
            ))}
          </section>
        </div>
    </>
  )
}

export default ProjectsSection;