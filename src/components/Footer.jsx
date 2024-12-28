import React, { useContext } from 'react';
import { AppContext } from '../AppProvider';
// import { Link } from 'react-router-dom';

function Footer() {
    const { socials } = useContext(AppContext);

    // const icons = [
    //     { 
    //         src : '/icon-github.svg',
    //         alt : 'github',
    //     },
    //     {
    //         src : "/icon-linkedin.svg",
    //         alt : 'linkedin',
    //     },
    //     {
    //         src : "/icon-instagram.svg",
    //         alt : 'instagram'
    //     }
    // ]

  return (
    <>
        <div className="footer">
            <section>
                <h5> <span></span> Lets Work Together</h5>
                <h6>send message</h6>
            </section>
            <h2>Let’s make something amazing together. Start By <span>Saying Hi</span> </h2>
            <section>
                {/* <Link to='/' onClick={scrollToTop} > */}
                    <img src="/legend-logo.webp" alt="logo" className="logo" />
                {/* </Link> */}
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