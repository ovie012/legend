import React, { useContext } from 'react';
// import { AppContext } from '../AppProvider';
// import { Link } from 'react-router-dom';

function Footer() {
    // const { scrollToTop } = useContext(AppContext);

    const icons = [
        { 
            src : '/icon-github.svg',
            alt : 'github',
        },
        {
            src : "/icon-linkedin.svg",
            alt : 'linkedin',
        },
        {
            src : "/icon-instagram.svg",
            alt : 'instagram'
        }
    ]

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
                    <img src="/legend-logo.jpg" alt="logo" className="logo" />
                {/* </Link> */}
                <div>
                    {icons.map((item, index) => (
                        <figure key={index}>
                            <img src={item.src} alt={`${item.alt} logo`} />
                        </figure>
                    ))}
                </div>
                <p>© 2024. All rights Reserved</p>
            </section>
        </div>
    </>
  )
}

export default Footer;