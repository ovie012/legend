import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../AppProvider';
import { Link, NavLink, useLocation } from 'react-router-dom';

function ProjectsSection() {
  const { projects, generateRandomProject } = useContext(AppContext);

  const [year, setYear] = useState(null);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setYear(currentYear);
  }, [])

  return (
    <>
        <div className="project-section">
          <section>
            <div className="selected-works">
              <h3>Selected works</h3>
              <h3>2022 - {year}</h3>
            </div>
            <div className="view-all">
              <p>Check out more projects i've worked on</p>
              <Link to='/Projects'>
                <button>view all</button>
              </Link>
            </div>
          </section>
          <section>
            {
            // generateRandomProject(
              projects
              // , 6)
              .map((items, index) => (
              <div key={index} onClick={() => window.open(items.link, '_blank')} className="single-project">
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
    </>
  )
}

export default ProjectsSection;