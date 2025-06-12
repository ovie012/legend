import React, { useContext } from 'react';
import { AppContext } from '../AppProvider';

function DevelopmentSection() {
    const { development } = useContext(AppContext);
    

  return (
    <>
        <div className="development-section">
            <section>
                {development.map((item, index) => (
                    <div key={index}>
                        <h6>{item}</h6>
                        <span></span>
                    </div>
                ))}
            </section>
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

export default DevelopmentSection;