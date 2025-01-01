import React, { createContext, useEffect, useState } from 'react';
import './App.css';
import { FaHtml5, FaCss3Alt, FaJs, FaReact, FaPlay, FaGithub, FaGraduationCap,  FaLinkedin, FaTwitter, FaTiktok, FaInstagram } from "react-icons/fa";
import { SiRedux, SiTailwindcss, SiStyledcomponents } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [preloader, setPreloader] = useState(true);
    const [loadingPercentage, setLoadingPercentage] = useState(0);
    const [animationStart, setAnimationStart] = useState(true);
    const [fadeAway, setFadeAway] = useState(false);
    const [lightMode, setLightMode] = useState(false);
    const [hover, setHover] = useState(false);
    const [projectOpen, setProjectOpen] = useState(false);
    const [likedProjectOpen, setLikedProjectOpen] = useState(false);
    const [selected, setSelected] = useState([]);
    const [funFact, setFunFact] = useState({
      heading : "I am an Arsenal Fan",
      paragraph : "Being an Arsenal fan is like mastering the art of patience—it’s built into the job description! Waiting for trophies, enduring rebuilds, and surviving last-minute heartbreaks have taught me to stay calm under pressure. It’s also made me a great team player because supporting Arsenal means believing in the process, celebrating every small win, and sticking together no matter what. If I can trust the team through thick and thin, you can trust me to do the same in any situation!",
    });
    const [animationKey, setAnimationKey] = useState(0);
    const [remainingFacts, setRemainingFacts] = useState([]);
    const [mobileNav, setMobileNav] = useState(false);
  
    const handleFunFacts = () => {
      let updatedFacts = remainingFacts.length > 0 ? remainingFacts : [...funFacts];
  
      const randomIndex = Math.floor(Math.random() * updatedFacts.length);
      const selectedFact = updatedFacts[randomIndex];
  
      updatedFacts.splice(randomIndex, 1);
  
      setFunFact(selectedFact);
      setRemainingFacts(updatedFacts);
      setAnimationKey((prevKey) => prevKey + 1);
    };

    const socials = [
        {title : FaLinkedin, link : "https://www.linkedin.com/in/ovie-emonefe-73b886259/" },
        {title : FaGithub, link : "https://github.com/ovie012" },
        {title : FaXTwitter, link : "https://x.com/legend_devv" },
        {title : FaTiktok, link : "https://www.tiktok.com/@legend.devv" },
        {title : FaInstagram, link : "https://www.instagram.com/legendd.devv" },
    ];
  
    const skills = [
      { icon: FaHtml5, name: "HTML" },
      { icon: FaCss3Alt, name: "CSS" },
      { icon: FaJs, name: "JavaScript" },
      { icon: FaReact, name: "React" },
      { icon: SiRedux, name: "Redux" },
      { icon: SiStyledcomponents, name: "Styled Components" },
      { icon: SiTailwindcss, name: "Tailwind CSS" },
      { icon: FaPlay, name: "Framer Motion" },
    ];

    const development = [
      'Development','Development','Development','Development','Development','Development','Development','Development',
    ];

    const slowTransition = {
      transition : '0.3s ease-in-out',
    };

    const scrollToTop = () => {
      window.scrollTo({
        top : 0,
        behavior : 'smooth',
      })
      setHover(false);
    };
    
    const select = (index) => {
      setSelected(index);
    };

    const projectsData = [
      {
        projectType : 'Professional Projects',
        projectTypeDescription : 'Below are paid projects that solved one project or the other to improve my clients productivity.',
        projects : [
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
        ]
      },
      {
        projectType : 'Personal Projects',
        projectTypeDescription : 'Below are paid projects that solved one project or the other to improve my clients productivity.',
        projects : [
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
        ]
      },
      {
        projectType : 'Challenge Projects',
        projectTypeDescription : 'Below are paid projects that solved one project or the other to improve my clients productivity.',
        projects : [
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
        ]
      },
      {
        projectType : 'Fun Projects',
        projectTypeDescription : 'Below are paid projects that solved one project or the other to improve my clients productivity.',
        projects : [
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
          {
            src : {
              desktop : "/swift-dispatch-driver.webp",
              mobile : "/swift-dispatch-driver.webp"
            },
            alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
            title : "Swift Dispatch",
            titleLong : "React-Based Dispatch App Development - Internship Project",
            description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
            descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
            link : "https://swiftdispatch.com.ng",
          },
        ]
      },
    ];

    const funFacts = [
      {
        heading: "Poetry Sharpens My Logic",
        paragraph: "You might not think poetry and coding have much in common, but writing verses is like debugging—every word has to fit perfectly, and nothing works until the flow is just right. My love for poetry has taught me to think critically and embrace trial and error, making me a pro at tackling tricky tech problems with style."
      },
      {
        heading: "Food Fuels My Innovation",
        paragraph: "Good food equals great code, and I stand by that! Whether it’s a spicy jollof rice or a plate of suya, a well-fed brain is a productive brain. Cooking also reminds me to test, iterate, and refine—just like in tech, where the best solutions often come from experimentation (and maybe a little taste testing)."
      },
      {
        heading: "Exercise Keeps My Code Clean",
        paragraph: "You wouldn’t leave the gym without stretching, so why leave your code without refactoring? Exercise not only keeps me healthy but also teaches me discipline, focus, and the importance of breaking down big goals into manageable reps. Just like in fitness, consistency in tech always pays off."
      },
      {
        heading: "Math is My Secret Weapon",
        paragraph: "As a mathematician, I’ve already defeated my greatest enemy: calculus. That means no algorithm or problem-solving challenge in tech can scare me! Math has trained me to spot patterns, think logically, and stay persistent even when the numbers stop making sense—just like a true techie."
      },
      {
        heading: "I’m Tall, So I See Big Picture",
        paragraph: "Being tall doesn’t just help me grab snacks from high shelves—it’s a constant reminder to look at the big picture. Whether I’m designing a system architecture or debugging an app, I’m always thinking ahead and ensuring every small detail contributes to the grand vision."
      },
      {
        heading: "I’m a Late-Night Thinker",
        paragraph: "The quiet of the night is my productivity sweet spot. While the world sleeps, I’m out here conquering code bugs like a superhero in pajamas. Late-night sessions often lead to my best ideas, though I sometimes wonder if I should add ‘caffeine optimizer’ to my skill set."
      },
      {
        heading: "Curiosity Makes Me a Quick Learner",
        paragraph: "I’m that person who Googles ‘how does this work’ every time I see something cool. This insatiable curiosity means I’m always learning new frameworks, tools, and tech tricks. If being a lifelong learner is a productivity hack, consider me the ultimate hacker (minus the shady stuff)."
      },
      {
        heading: "Puzzles Train My Debugging Skills",
        paragraph: "Solving puzzles is like debugging: frustrating, rewarding, and occasionally involves yelling, ‘Why won’t you work?!’ But every solved puzzle reminds me that there’s always a solution waiting to be found—and that perseverance is the key to untangling even the messiest lines of code."
      },
      {
        heading: "Books Boost My Problem-Solving",
        paragraph: "Reading expands my imagination, which is essential for solving complex tech problems. Whether it’s a sci-fi novel or a self-help book, I’m always picking up new ideas and approaches. Plus, I’ve learned to handle cliffhangers gracefully—useful for dealing with suspenseful debugging moments."
      },
      {
        heading: "Cooking Enhances My Creativity",
        paragraph: "Coding and cooking have one thing in common: they’re both creative processes where the end result should be satisfying (and functional). Experimenting with flavors in the kitchen mirrors how I test new libraries and frameworks—sometimes it’s a masterpiece, and other times, it’s a lesson learned."
      },
      {
        heading: "Storytelling Inspires Better UX",
        paragraph: "Good stories captivate people, and I bring that same energy into designing user interfaces. I focus on creating experiences that feel seamless and intuitive, just like a plot twist that leaves you saying, ‘Wow!’ With storytelling in my toolkit, I make sure users stay engaged and delighted."
      },
      {
        heading: "Nature Teaches Me Balance",
        paragraph: "Spending time in nature reminds me that even techies need a break. Just as every plant needs sunlight, my mind needs downtime to stay sharp. Stepping away from the screen helps me come back recharged and ready to tackle any challenge—like a tech phoenix rising from the ashes of burnout."
      },
      {
        heading: "Music Keeps Me in the Zone",
        paragraph: "My headphones are my productivity superpower. Whether it’s a chill lo-fi playlist or upbeat Afrobeat tracks, music helps me block out distractions and enter a flow state where the code practically writes itself. Bonus: my coding rhythm is unmatched, thanks to all those beats!"
      },
      {
        heading: "Sunrises Mark My Milestones",
        paragraph: "There’s nothing like watching the sunrise after an all-night coding session. It’s a beautiful reminder that every bug fixed and every feature completed brings new opportunities. Plus, if I’m awake to see it, you know I’ve been productive—and probably deserve a nap soon."
      },
      {
        heading: "Listening is My Debugging Tool",
        paragraph: "Being a good listener makes me great at understanding user needs and team feedback. Debugging isn’t just about fixing errors—it’s about truly hearing what the problem is. Whether it’s a colleague explaining an issue or a user leaving a review, I listen closely to find the best solutions."
      },
      {
        heading: "Art Refines My Aesthetics",
        paragraph: "App interfaces are my canvas, and I treat every design like a work of art. My appreciation for visual creativity means I pay attention to details, ensuring every color, font, and layout choice contributes to a seamless user experience. Function meets beauty in every project I touch."
      },
      {
        heading: "Desserts Reward My Hard Work",
        paragraph: "Nothing says ‘job well done’ like treating myself to a slice of cake after a productive coding session. Desserts are my way of celebrating small wins, because let’s face it—sometimes getting a tricky API to work deserves a standing ovation and a scoop of ice cream."
      },
      {
        heading: "Challenges Are My Playground",
        paragraph: "I thrive on challenges—whether it’s solving a complex algorithm or learning a new tech stack. To me, every obstacle is an opportunity to grow, adapt, and innovate. If it’s tough, I’m excited, because there’s nothing more satisfying than proving to myself that I can handle anything."
      },
      {
        heading: "Kindness Makes Collaboration Easy",
        paragraph: "Tech is a team sport, and I believe kindness is the ultimate cheat code. Whether it’s helping a colleague debug or celebrating someone’s success, I prioritize creating a positive environment. After all, happy teams build great products, and I’m all about spreading good vibes!"
      },
      {
        heading: "Culture Fuels My Ideas",
        paragraph: "As a Nigerian, I draw endless inspiration from my vibrant culture. From problem-solving skills honed by navigating Lagos traffic to creativity inspired by our music and art, my roots keep me grounded and innovative. Every project I work on carries a piece of that energy."
      }
    ];

    const projects = [
      {
        src : {
          desktop : "/swift-dispatch-driver.webp",
          mobile : "/swift-dispatch-driver.webp"
        },
        alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
        title : "Swift Dispatch",
        titleLong : "React-Based Dispatch App Development - Internship Project",
        description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
        descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
        link : "https://swiftdispatch.com.ng",
      },
      {
        src : {
          desktop : "/swift-dispatch-driver.webp",
          mobile : "/swift-dispatch-driver.webp"
        },
        alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
        title : "Swift Dispatch",
        titleLong : "React-Based Dispatch App Development - Internship Project",
        description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
        descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
        link : "https://swiftdispatch.com.ng",
      },
      {
        src : {
          desktop : "/swift-dispatch-driver.webp",
          mobile : "/swift-dispatch-driver.webp"
        },
        alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
        title : "Swift Dispatch",
        titleLong : "React-Based Dispatch App Development - Internship Project",
        description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
        descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
        link : "https://swiftdispatch.com.ng",
      },
      {
        src : {
          desktop : "/swift-dispatch-driver.webp",
          mobile : "/swift-dispatch-driver.webp"
        },
        alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
        title : "Swift Dispatch",
        titleLong : "React-Based Dispatch App Development - Internship Project",
        description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
        descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
        link : "https://swiftdispatch.com.ng",
      },
      {
        src : {
          desktop : "/swift-dispatch-driver.webp",
          mobile : "/swift-dispatch-driver.webp"
        },
        alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
        title : "Swift Dispatch",
        titleLong : "React-Based Dispatch App Development - Internship Project",
        description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
        descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
        link : "https://swiftdispatch.com.ng",
      },
      {
        src : {
          desktop : "/swift-dispatch-driver.webp",
          mobile : "/swift-dispatch-driver.webp"
        },
        alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
        title : "Swift Dispatch",
        titleLong : "React-Based Dispatch App Development - Internship Project",
        description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
        descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
        link : "https://swiftdispatch.com.ng",
      },
      {
        src : {
          desktop : "/swift-dispatch-driver.webp",
          mobile : "/swift-dispatch-driver.webp"
        },
        alt : "Dispatch app interface showcasing a responsive and user-friendly design developed with React during an internship with Enovers Lab Team 51.",
        title : "Swift Dispatch",
        titleLong : "React-Based Dispatch App Development - Internship Project",
        description : "Developed a React-based dispatch app with Enovers Lab Team 51, focusing on responsive UI and seamless user experience.",
        descriptionLong : "Collaborated with Enovers Lab Team 51 during an internship to develop a dispatch application using React. The project focused on building an efficient and user-friendly front-end solution without integrating a backend. My contributions included implementing responsive UI components, optimizing performance, and ensuring seamless user interaction.",
        link : "https://swiftdispatch.com.ng",
      },
    ];

    const generateRandomProject = (arr, limit) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    };

  return (
    <AppContext.Provider value={{
        lightMode,
        setLightMode,
        hover,
        setHover,
        slowTransition,
        development,
        projects,
        generateRandomProject,
        scrollToTop,
        projectOpen, 
        setProjectOpen,
        projectsData,
        select,
        selected,
        likedProjectOpen, 
        setLikedProjectOpen,
        funFacts, 
        funFact, 
        skills, 
        animationKey, 
        handleFunFacts,
        mobileNav,
        setMobileNav,
        socials,
        preloader,
        setPreloader,
        fadeAway, 
        setFadeAway,
        animationStart, 
        setAnimationStart,
        loadingPercentage, 
        setLoadingPercentage
    }}>
        {children}
    </AppContext.Provider>
  );
};
