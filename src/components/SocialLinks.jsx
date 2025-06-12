import React, { useContext } from "react";
import { FaLinkedin, FaGithub, FaTwitter, FaTiktok, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { AppContext } from "../AppProvider";

const SocialLinks = () => {
    const { socials } = useContext(AppContext);

  // const socials = [
  //   {title : FaLinkedin, link : "https://linkedin.com/in/your-profile" },
  //   {title : FaGithub, link : "https://github.com/your-profile" },
  //   {title : FaXTwitter, link : "https://twitter.com/your-profile" },
  //   {title : FaTiktok, link : "https://linkedin.com/in/your-profile" },
  //   {title : FaInstagram, link : "https://linkedin.com/in/your-profile" },
  // ];

  return (
    <div className="social-links">
      <h2>Connect with Me</h2>
      <div className="icons">
        {socials.map((item, index) => (
          <a key={index} href={item.link} target="_blank" rel="noopener noreferrer">
            <item.title className="icon" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialLinks;



// import React from "react";
// import { FaLinkedin, FaGithub, FaXTwitter, FaTiktok, FaInstagram } from "react-icons/fa6"; 

// const SocialLinks = () => {
//   // Map each social link to its respective icon component
//   const socials = [
//     { icon: FaLinkedin, title: "LinkedIn", link: "https://linkedin.com/in/your-profile" },
//     { icon: FaGithub, title: "GitHub", link: "https://github.com/your-profile" },
//     { icon: FaXTwitter, title: "XTwitter", link: "https://twitter.com/your-profile" },
//     { icon: FaTiktok, title: "TikTok", link: "https://tiktok.com/@your-profile" },
//     { icon: FaInstagram, title: "Instagram", link: "https://instagram.com/your-profile" },
//   ];

//   return (
//     <div className="social-links">
//       <h2>Connect with Me</h2>
//       <div className="icons">
//         {socials.map((item, index) => (
//           <a
//             key={index}
//             href={item.link}
//             target="_blank"
//             rel="noopener noreferrer"
//             aria-label={item.title}
//           >
//             <item.icon className="icon" />
//           </a>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default SocialLinks;

