import React, { useContext } from 'react';
import { AppContext } from '../AppProvider';
// import { Link } from 'react-router-dom';

function Footer() {
    const { socials } = useContext(AppContext);

  return (
    <>
        <div className="footer">
            <section>
                <h5> <span></span> Lets Work Together</h5>
                <a href="mailto:ovieemonefe012@gmail.com">send message</a>
            </section>
            <h2>Let’s collaborate and create something extraordinary. Start by <span>Saying Hi</span> </h2>
            <section>
                <img src="/legend-logo.webp" alt="logo" className="logo" />
                <div>
                {socials.map((item, index) => (
                    <a key={index} href={item.link} target="_blank" rel="noopener noreferrer">
                        <item.title className="footer-icon" />
                    </a>
                ))}
                </div>
                <p>© 2024. All rights Reserved</p>
            </section>
        </div>
    </>
  )
}

export default Footer;