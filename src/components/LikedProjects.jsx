import React, { useContext } from 'react';
import { AppContext } from '../AppProvider';

function LikedProjects() {
    const { lightMode, likedProjectOpen, setLikedProjectOpen, slowTransition, projects, select, selected } = useContext(AppContext);


  return (
    <>
        <div className="liked-projects">
            <section onClick={() => { setLikedProjectOpen(!likedProjectOpen); }} className="professional-header">
                <div>
                    <h3>Favorite Projects</h3>
                    {/* <p>Please drag and drop projects you like into any square of your choice to indicate you like that project.</p> */}
                    <p>These are the projects that hold a special place for me, whether due to the personal insights they provided or the challenges they presented. Each one played a key role in my growth as a developer and pushed me to expand my skills and knowledge.</p>
                </div>
                <svg style={slowTransition} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill={lightMode ? '#00050F' : '#fff'}><path d={likedProjectOpen ? 'M480-360 280-560h400L480-360Z' : 'm280-400 200-200 200 200H280Z'}/></svg>
            </section>
            <section className={`actual-projects ${likedProjectOpen ? 'projects-opened' : ''}`}>
            {projects.map((items, idx) => (
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
    </>
  )
}

export default LikedProjects;