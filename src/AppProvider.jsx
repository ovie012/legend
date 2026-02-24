import React, { createContext, useEffect, useState } from 'react';
import { usePersistentState } from './hooks/UsePersistentState';
import './App.css';
import { FaHtml5, FaCss3Alt, FaJs, FaReact, FaPlay, FaGithub, FaGraduationCap,  FaLinkedin, FaTwitter, FaTiktok, FaInstagram } from "react-icons/fa";
import { SiRedux, SiTailwindcss, SiStyledcomponents, SiTypescript } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { TbLetterZ, TbBrandReactNative } from 'react-icons/tb';
import { GiBearFace } from 'react-icons/gi';

export const AppContext = createContext();

export function AppProvider({ children }) {
    const [preloader, setPreloader] = useState(true);
    const [loadingPercentage, setLoadingPercentage] = useState(0);
    const [animationStart, setAnimationStart] = useState(true);
    const [fadeAway, setFadeAway] = useState(false);
    const [lightMode, setLightMode] = usePersistentState('lightMode', false);
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
    const [zustandIconChosen, setZustandIconChosen] = useState(<TbLetterZ />)
  
    const handleFunFacts = () => {
      let updatedFacts = remainingFacts.length > 0 ? remainingFacts : [...funFacts];
  
      const randomIndex = Math.floor(Math.random() * updatedFacts.length);
      const selectedFact = updatedFacts[randomIndex];
  
      updatedFacts.splice(randomIndex, 1);
  
      setFunFact(selectedFact);
      setRemainingFacts(updatedFacts);
      setAnimationKey((prevKey) => prevKey + 1);
    };

    const randomThemeSelect = () => {
      const randomChoice = Math.random();
      if (randomChoice > 0.5) {
        setZustandIconChosen(<GiBearFace />);
      } else {
        setZustandIconChosen(<TbLetterZ />);
      }
    }

    useEffect(() => {
      randomThemeSelect();
    }, []);

    const socials = [
        {title : FaLinkedin, link : "https://www.linkedin.com/in/ovie-emonefe-73b886259/" },
        {title : FaGithub, link : "https://github.com/ovie012" },
        {title : FaXTwitter, link : "https://x.com/legend_devv" },
        {title : FaTiktok, link : "https://www.tiktok.com/@legenddev_softwaredev" },
        {title : FaInstagram, link : "https://www.instagram.com/legendd.devv" },
    ];
  
    const skills = [
      { icon: <FaHtml5 />, name: "HTML" },
      { icon: <FaCss3Alt />, name: "CSS" },
      { icon: <FaJs />, name: "JavaScript" },
      { icon: <FaReact />, name: "React" },
      { icon: <SiRedux />, name: "Redux" },
      { icon: <SiStyledcomponents />, name: "Styled Components" },
      { icon: <SiTailwindcss />, name: "Tailwind CSS" },
      { icon: <FaPlay />, name: "Framer Motion" },
      { icon: <SiTypescript />, name: "TypeScript" },
      { icon: zustandIconChosen, name: "Zustand" },
      { icon: <TbBrandReactNative />, name: "React Native" },
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
        projectType: 'Professional Projects',
        projectTypeDescription: 'The following are paid projects that have contributed to solving specific challenges, enhancing client productivity, and delivering impactful solutions.',
        projects : [
          {
            src : {
              desktop : "/scrybe-homepage-image.webp",
              mobile : "/scrybe-homepage-image.webp"
            },
            alt : "Scrybe school management platform interface showcasing modern design, streamlined administration tools, and enhanced learning experience features.",
            title : "Scrybe Platform",
            titleLong : "Modern School Management Platform Development - Paid Project",
            description : "Built Scrybe, a modern school management platform that simplifies administration, empowers teachers, and enhances learning experiences.",
            descriptionLong : "Developed Scrybe, a comprehensive school management platform designed to streamline administrative tasks, empower educators, and enhance student learning experiences. The project focused on creating an intuitive, scalable, and user-friendly interface to improve school operations and classroom engagement.",
            link : "https://scrybehub.ng",
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
        projectType: 'Personal Projects',
        projectTypeDescription: 'These are self-initiated projects that allowed me to explore new technologies and strengthen my skills in real-world scenarios.',
        projects : [
          {
            src: {
              desktop: "/legend-store.webp",
              mobile: "/legend-store.webp"
            },
            alt: "Legend Swift Cart Store mini e-commerce application built with React, featuring product listings, cart management, authentication UI, and smooth animations.",
            title: "LEGEND STORE",
            titleLong: "Legend Swift Cart Store - Mini E-commerce",
            description: "Built a modern mini e-commerce frontend with React, featuring product listings, cart persistence, authentication UI, route protection, and smooth micro-interactions using Zustand and Framer Motion.",
            descriptionLong: "Legend Swift Cart Store is a production-ready mini e-commerce frontend built with React, designed with modern 2026 architecture patterns. It features paginated product listings, category filtering, debounced search, dynamic product pages, and a cart system with Zustand and localStorage persistence. The app includes a checkout flow with React Hook Form + Zod, mock authentication, protected routes, Tailwind CSS styling, and Framer Motion animations, emphasizing scalability, clean architecture, and smooth UX.",
            link: "https://legend-swift-cart-project.vercel.app/"
          },
          {
            src: {
              desktop: "/intro-section-with-drop-down.webp",
              mobile: "/intro-section-with-drop-down.webp"
            },
            alt: "Intro section with dropdown navigation featuring responsive menus and hover states, built in React.",
            title: "Dropdown Navigation",
            titleLong: "Responsive Dropdown Navigation - Frontend Mentor Challenge",
            description: "Built a React intro section with responsive dropdown navigation and hover states from a Frontend Mentor challenge.",
            descriptionLong: "Designed and implemented an intro section with dropdown navigation in React, based on a Frontend Mentor challenge. The navigation features responsive dropdown menus that adapt seamlessly across desktop and mobile. Includes hover states for interactivity, highlighting my proficiency in building accessible, responsive navigation systems.",
            link: "https://intro-11th-challenge-react-version.vercel.app",
          },
          {
            src : {
              desktop : "/brew-board-homepage-image.webp",
              mobile : "/brew-board-homepage-image.webp"
            },
            alt : "Brew Board real-time collaborative Kanban interface showcasing coffee-themed task management, live updates, drag-and-drop functionality, and multi-user synchronization.",
            title : "Brew Board",
            titleLong : "Real-Time Collaborative Kanban Board - Distributed Frontend System",
            description : "Built Brew Board, a production-grade real-time collaborative Kanban application with optimistic updates, offline support, and role-based permissions.",
            descriptionLong : "Developed Brew Board, a real-time collaborative Kanban platform engineered with distributed systems principles at the frontend layer. The application features live multi-user synchronization via WebSockets, optimistic UI updates with rollback handling, conflict resolution through versioning, offline-first architecture with queued mutations, and role-based access control. The project emphasizes scalable architecture, state separation between server and client, and resilient real-time collaboration.",
            link : "https://brew-board.vercel.app/"
          },
          {
            src: {
              desktop: "/micro-hub-homepage-image.webp",
              mobile: "/micro-hub-homepage-image.webp"
            },
            alt: "Micro Hub micro-frontend dashboard interface showcasing modular architecture with Auth, Analytics, and Settings modules dynamically loaded through Module Federation in a clean green and white layout.",
            title: "Micro Hub",
            titleLong: "Production-Grade Micro-Frontend Dashboard Architecture",
            description: "Built Micro Hub, a scalable micro-frontend dashboard platform composed of independently deployed applications integrated via Module Federation.",
            descriptionLong: "Developed Micro Hub, a micro-frontend dashboard built using distributed frontend architecture principles. The system is composed of independently deployed Auth, Analytics, and Settings applications dynamically integrated through Webpack Module Federation. It features shared singleton dependency management, runtime remote loading, route-level protection, and environment-based configuration. The architecture emphasizes scalability, performance optimization, and clear separation of domain boundaries for maintainability.",
            link: "https://micro-hub-seven.vercel.app"
          },
          {
            src: {
              desktop: "/advice-generator.webp",
              mobile: "/advice-generator.webp"
            },
            alt: "React-based advice generator app with API integration and interactive design, built from a Frontend Mentor challenge.",
            title: "Advice App",
            titleLong: "React Advice Generator App - Frontend Mentor Challenge",
            description: "Created a React advice generator app using the Advice Slip API with hover states and a responsive layout.",
            descriptionLong: "Developed a React advice generator app utilizing the Advice Slip API, based on a Frontend Mentor challenge. Users can click a dice icon to fetch and display random advice. The app includes responsive design and hover states, showcasing skills in integrating APIs and creating engaging user interfaces.",
            link: "https://advice-12th-challenge-react-version.vercel.app",
          },
          {
            src : {
              desktop : "/ofure-jewelry-store.webp",
              mobile : "/ofure-jewelry-store.webp"
            },
            alt : "Elegant e-commerce UI for Ofure Jewelry Store showcasing jewelry products with a clean and user-focused design.",
            title : "Jewelry Store",
            titleLong : "Ofure Jewelry Store Design - Personal Project",
            description : "Built an elegant e-commerce UI for Ofure Jewelry Store, focusing on showcasing jewelry products.",
            descriptionLong : "Ofure Jewelry Store is an incomplete e-commerce platform I designed and built early in my learning journey. This project, developed before I learned React, helped me gain significant insights into web development, focusing on creating a clean and visually appealing UI for showcasing jewelry products.",
            link : "https://ofure-jewelry.vercel.app",
          },
          {
            src: {
              desktop: "/time-tracking-board.webp",
              mobile: "/time-tracking-board.webp"
            },
            alt: "React time tracking dashboard with dynamic data loading and responsive design, built from a Frontend Mentor challenge.",
            title: "Tracking Dashboard",
            titleLong: "React Time Tracking Dashboard - Frontend Mentor Challenge",
            description: "Developed a React time tracking dashboard with dynamic JSON data integration and responsive design.",
            descriptionLong: "Built a time tracking dashboard in React from a Frontend Mentor challenge. Users can toggle between daily, weekly, and monthly stats, with data dynamically loaded from a local JSON file. The app includes responsive design and hover effects, demonstrating strong skills in data visualization and interactivity.",
            link: "https://time-13th-challenge-react-version.vercel.app",
          },
          {
            src: {
              desktop: "/tip-calculator.webp",
              mobile: "/tip-calculator.webp"
            },
            alt: "React tip calculator app with responsive design and interactive features, built from a Frontend Mentor challenge.",
            title: "Tip Calculator",
            titleLong: "React Tip Calculator App - Frontend Mentor Challenge",
            description: "Built a React tip calculator app with responsive design and precise tip calculations from a Frontend Mentor challenge.",
            descriptionLong: "Created a tip calculator app in React from a Frontend Mentor challenge. Users can calculate the correct tip and total bill per person, with responsive design and hover states enhancing usability. This project highlighted my skills in building interactive and user-friendly calculators.",
            link: "https://tip-14th-challenge-react-version.vercel.app",
          },
          {
            src: {
              desktop: "/crowd-funding-product-page.webp",
              mobile: "/crowd-funding-product-page.webp"
            },
            alt: "Responsive React crowdfunding product page with dynamic pledges and interactive features, built from a Frontend Mentor challenge.",
            title: "Crowdfunding Page",
            titleLong: "React Crowdfunding Product Page - Frontend Mentor Challenge",
            description: "Built a React crowdfunding product page with dynamic progress updates and interactive features from a Frontend Mentor challenge.",
            descriptionLong: "Developed a responsive crowdfunding product page in React from a Frontend Mentor challenge. Users can select pledges, see progress updates, and increment backers dynamically. Includes hover states and bookmarking functionality, showcasing advanced interactive features and state management.",
            link: "https://crowdfunding-product-page-main-delta.vercel.app",
          },
          {
            src: {
              desktop: "/interactive-pricing-component.webp",
              mobile: "/interactive-pricing-component.webp"
            },
            alt: "Interactive React pricing component with dynamic adjustments and responsive design, built from a Frontend Mentor challenge.",
            title: "Pricing Component",
            titleLong: "React Interactive Pricing Component - Frontend Mentor Challenge",
            description: "Developed a React interactive pricing component with responsive design and dynamic pricing features.",
            descriptionLong: "Created an interactive pricing component in React from a Frontend Mentor challenge. Users can adjust prices based on page views using a slider and toggle, with hover states and responsive design providing an engaging experience. Demonstrated skills in state management and user interaction.",
            link: "https://react-version-interactive-pricing-component-main.vercel.app",
          },
          {
            src: {
              desktop: "/age-calculator.webp",
              mobile: "/age-calculator.webp"
            },
            alt: "Age calculator app built in React to calculate precise age with detailed validations for date inputs.",
            title: "Age Calculator",
            titleLong: "React Age Calculator App - Frontend Mentor Challenge",
            description: "Developed an age calculator app in React to compute years, months, and days from a valid date input.",
            descriptionLong: "Built an age calculator app in React for a Frontend Mentor challenge. It includes detailed form validations for empty fields, out-of-range inputs, and future dates. The app calculates and displays age accurately in years, months, and days, providing hover states and responsive layouts for optimal user experience.",
            link: "https://age-6th-challenge-react-version.vercel.app",
          },
          {
            src: {
              desktop: "/news-home-page.webp",
              mobile: "/news-home-page.webp"
            },
            alt: "Responsive React news homepage showcasing optimal layout and hover states, built from a Frontend Mentor challenge.",
            title: "News Homepage",
            titleLong: "React News Homepage - Frontend Mentor Challenge",
            description: "Designed a responsive React news homepage with dynamic layouts and hover states from a Frontend Mentor challenge.",
            descriptionLong: "Implemented a news homepage in React for a Frontend Mentor challenge. The design focuses on an optimal layout across devices and includes interactive hover states for elements. This project highlights skills in creating professional and responsive web layouts.",
            link: "https://news-7th-challenge-react-version.vercel.app",
          },
          {
            src: {
              desktop: "/notification-project.webp",
              mobile: "/notification-project.webp"
            },
            alt: "React notifications page with read/unread states and a 'Mark all as read' feature.",
            title: "Notifications Page",
            titleLong: "React Notifications Page - Frontend Mentor Challenge",
            description: "Built a React notifications page with a toggle feature for marking all notifications as read.",
            descriptionLong: "Developed a notifications page in React based on a Frontend Mentor challenge. It includes features to distinguish between read and unread notifications, a 'Mark all as read' button, and hover states. This project demonstrates skills in state management and creating responsive interfaces.",
            link: "https://notifications-8th-challenge-react-version.vercel.app",
          },
          {
            src: {
              desktop: "/interactive-card-set-up.webp",
              mobile: "/interactive-card-set-up.webp"
            },
            alt: "Interactive card details form built in React with real-time card updates and error validation.",
            title: "Card Form",
            titleLong: "Interactive Card Details Form - Frontend Mentor Challenge",
            description: "Created an interactive card details form in React with real-time card updates and detailed error handling.",
            descriptionLong: "Built an interactive card details form in React as part of a Frontend Mentor challenge. Users can fill in card details and see them update live on the card preview. The form includes error validation for empty fields, incorrect formats, and more, showcasing attention to detail and user-focused design.",
            link: "https://interactive-9th-challenge-react-version.vercel.app",
          },
          {
            src: {
              desktop: "/expense-chart-component.webp",
              mobile: "/expense-chart-component.webp"
            },
            alt: "Expenses chart component built in React with dynamic bar chart based on JSON data and responsive design.",
            title: "Expenses Chart",
            titleLong: "React Expenses Chart Component - Frontend Mentor Challenge",
            description: "Developed a React expenses chart component with dynamic data and hover effects from a Frontend Mentor challenge.",
            descriptionLong: "Created an expenses chart component in React based on a Frontend Mentor challenge. It dynamically renders bars from a local JSON file, with hover effects showing detailed amounts. The project features responsive design and a highlighted current-day bar for improved data visualization.",
            link: "https://expenses-10th-challenge-react-version.vercel.app",
          },
          {
            src: {
              desktop: "/news-letter-sign-up.webp",
              mobile: "/news-letter-sign-up.webp"
            },
            alt: "Responsive React newsletter sign-up form with success message and validation, built from a Frontend Mentor challenge.",
            title: "Newsletter Sign-Up Form",
            titleLong: "Newsletter Sign-Up Form with Success Message - Frontend Mentor Challenge",
            description: "Built a responsive React newsletter sign-up form with validation and success message from a Frontend Mentor challenge.",
            descriptionLong: "Developed a React newsletter sign-up form from a Frontend Mentor challenge. The app features responsive design, success message display upon submission, and validation for empty fields and incorrect email formats. This project improved my expertise in creating functional forms and delivering interactive user experiences.",
            link: "https://newsletter-5th-challenge-react-version.vercel.app"
          },
          {
            src: {
              desktop: "/sign-up.webp",
              mobile: "/sign-up.webp"
            },
            alt: "Responsive React sign-up form component with form validation and hover states, built from a Frontend Mentor challenge.",
            title: "Intro Sign-Up Form Component",
            titleLong: "Intro Sign-Up Form Component - Frontend Mentor Challenge",
            description: "Created a responsive React sign-up form component with form validation from a Frontend Mentor challenge.",
            descriptionLong: "Developed an introductory React component with a sign-up form from a Frontend Mentor challenge. This project features responsive design, hover states, and form validation for empty fields and incorrect email formats. It improved my skills in building intuitive user interfaces and implementing robust form validation.",
            link: "https://intro-3rd-challenge-react-version.vercel.app"
          },
          {
            src: {
              desktop: "/base-apparel.webp",
              mobile: "/base-apparel.webp"
            },
            alt: "Responsive React Coming Soon page for Base Apparel with form validation, built from a Frontend Mentor challenge.",
            title: "Base Apparel Coming Soon Page",
            titleLong: "Base Apparel Coming Soon Page - Frontend Mentor Challenge",
            description: "Created a responsive React Base Apparel Coming Soon page with form validation from a Frontend Mentor challenge.",
            descriptionLong: "Built the Base Apparel Coming Soon page in React from a Frontend Mentor challenge. This project includes responsive design, hover effects, and robust form validation to handle empty fields and incorrect email formats. It enhanced my ability to create engaging and user-friendly web pages.",
            link: "https://base-4th-challenge-react-version.vercel.app"
          },
          {
            src: {
              desktop: "/rating-project.webp",
              mobile: "/rating-project.webp"
            },
            alt: "Interactive React rating component with responsive design, hover states, and thank-you functionality, built from a Frontend Mentor challenge.",
            title: "Interactive Rating Component",
            titleLong: "Interactive Rating Component - Frontend Mentor Challenge",
            description: "Created an interactive React rating component with hover states and thank-you functionality from a Frontend Mentor challenge.",
            descriptionLong: "Built an interactive rating component in React from a Frontend Mentor challenge. The app features a responsive layout, hover states, and functionality for selecting and submitting a number rating. Upon submission, a thank-you state is displayed, improving my understanding of state management and interactive component design.",
            link: "https://interactive-2nd-challenge-react-version.vercel.app"
          },
          {
            src: {
              desktop: "/ping-project.webp",
              mobile: "/ping-project.webp"
            },
            alt: "Responsive React Coming Soon page with email validation and error handling, built from a Frontend Mentor challenge.",
            title: "Ping Coming Soon Page",
            titleLong: "Ping Coming Soon Page - Frontend Mentor Challenge",
            description: "Built a responsive React Ping Coming Soon page with email validation and error handling from a Frontend Mentor challenge.",
            descriptionLong: "Developed the Ping Coming Soon page in React from a Frontend Mentor challenge. The project included responsive design, email submission functionality, and error handling for invalid or empty inputs. This challenge enhanced my skills in form validation, interactive UI design, and delivering seamless user experiences.",
            link: "https://ping-1st-challenge-react-version.vercel.app"
          },   
          {
            src: {
              desktop: "/valentine-project-image.webp",
              mobile: "/valentine-project-image.webp"
            },
            alt: "Valentine themed interactive web app featuring pink romantic UI, animated poems, playful button interactions, and celebratory motion effects.",
            title: "Valentine Project",
            titleLong: "Interactive Valentine UI Experience - Creative Fun Project",
            description: "Built a playful and romantic Valentine web app featuring animated poems, dynamic button interactions, and smooth motion effects.",
            descriptionLong: "Developed an interactive Valentine-themed web application focused on delightful user experience and animation-driven storytelling. The project features dynamic name personalization, sequential romantic poem reveals, playful micro-interactions (including a moving 'No' button), and celebratory motion effects upon confirmation. Built using React, styled-components, and Framer Motion to explore creative UI design and expressive frontend animation.",
            link: "https://valentine-project-eight-zeta.vercel.app"
          }, 
        ]
      },
      {
        projectType: 'Bootcamps / Internship Projects',
        projectTypeDescription: 'These projects were completed during bootcamps and internships, where I applied my knowledge in real-world environments, collaborating with teams and solving practical challenges.',
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
              desktop : "/kiddies-auto.webp",
              mobile : "/kiddies-auto.webp"
            },
            alt : "Responsive React mini e-commerce app for Kiddies Auto, developed during the HNG internship using a Figma design.",
            title : "Kiddies Auto",
            titleLong : "Kiddies Auto Mini E-commerce - Internship Project",
            description : "Built Kiddies Auto during HNG, translating a Figma design into a responsive React mini e-commerce app.",
            descriptionLong : "Kiddies Auto is a React-based mini e-commerce app developed during HNG internship program. The project involved translating a detailed Figma design, created by a seasoned product designer, into a responsive and functional platform. This challenge enhanced my skills in building interactive applications and adhering to professional design standards in real-world scenarios.",
            link : "https://kiddies-auto.vercel.app",
          },
          {
            src : {
              desktop : "/e-commerce_with_cart.webp",
              mobile : "/e-commerce_with_cart.webp"
            },
            alt : "Responsive React e-commerce app featuring a functional cart page, developed during an MLSA bootcamp challenge from Frontend Mentor.",
            title : "Cart E-commerce",
            titleLong : "E-commerce with Cart Page - Boot Camp Project",
            description : "Built a React e-commerce app with a cart page during the MLSA bootcamp, based on a Frontend Mentor challenge.",
            descriptionLong : "This React-based mini e-commerce app with a functional cart page was developed during the MLSA bootcamp, based on a Frontend Mentor challenge. The project emphasized building a responsive and dynamic user interface while efficiently managing state to deliver seamless cart functionality. This experience enhanced my understanding of e-commerce development and UI/UX best practices.",
            link : "https://mlsa-project-assignment-product-list-with-cart-main.vercel.app",
          },
        ]
      },
      {
        projectType: 'Fun Projects',
        projectTypeDescription: 'These are projects created purely for fun and creativity. They offer an opportunity to explore exciting concepts, experiment with playful designs, and create engaging experiences that make coding enjoyable. Click to see how these projects bring a bit of fun!',
        projects : [
          {
            src : {
              desktop : "/tip-calculator.webp",
              mobile : "/tip-calculator.webp"
            },
            alt : "React tip calculator app with responsive design and accurate cost calculations, built from a Frontend Mentor challenge.",
            title : "Tip Calculator",
            titleLong : "Tip Calculator App - Personal Project",
            description : "Developed a React tip calculator app from a Frontend Mentor challenge, focusing on responsive design and accurate calculations.",
            descriptionLong : "This React-based tip calculator app was developed from a Frontend Mentor design challenge. The project involved creating a responsive layout adaptable to different screen sizes, implementing hover states for interactive elements, and ensuring accurate tip and total cost calculations per person. It improved my attention to design precision and functionality.",
            link : "https://tip-14th-challenge-react-version.vercel.app",
          },
          {
            src : {
              desktop : "/age-calculator.webp",
              mobile : "/age-calculator.webp"
            },
            alt : "React age calculator app with form validation, responsive layout, and accurate age calculations, built from a Frontend Mentor challenge.",
            title : "Age Calculator",
            titleLong : "Age Calculator App - Personal Project",
            description : "Built a React age calculator app from a Frontend Mentor challenge with form validation and responsive design.",
            descriptionLong : "This React age calculator app was developed from a Frontend Mentor design challenge. It calculates an individual's age in years, months, and days based on a valid input date. The app includes robust form validation, ensuring accurate and realistic date entries, and features a responsive layout with interactive hover and focus states.",
            link : "https://age-6th-challenge-react-version.vercel.app",
          },
          {
            src: {
              desktop: "/valentine-project-image.webp",
              mobile: "/valentine-project-image.webp"
            },
            alt: "Valentine themed interactive web app featuring pink romantic UI, animated poems, playful button interactions, and celebratory motion effects.",
            title: "Valentine Project",
            titleLong: "Interactive Valentine UI Experience - Creative Fun Project",
            description: "Built a playful and romantic Valentine web app featuring animated poems, dynamic button interactions, and smooth motion effects.",
            descriptionLong: "Developed an interactive Valentine-themed web application focused on delightful user experience and animation-driven storytelling. The project features dynamic name personalization, sequential romantic poem reveals, playful micro-interactions (including a moving 'No' button), and celebratory motion effects upon confirmation. Built using React, styled-components, and Framer Motion to explore creative UI design and expressive frontend animation.",
            link: "https://valentine-project-eight-zeta.vercel.app"
          }
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
          desktop : "/scrybe-homepage-image.webp",
          mobile : "/scrybe-homepage-image.webp"
        },
        alt : "Scrybe school management platform interface showcasing modern design, streamlined administration tools, and enhanced learning experience features.",
        title : "Scrybe Platform",
        titleLong : "Modern School Management Platform Development - Paid Project",
        description : "Built Scrybe, a modern school management platform that simplifies administration, empowers teachers, and enhances learning experiences.",
        descriptionLong : "Developed Scrybe, a comprehensive school management platform designed to streamline administrative tasks, empower educators, and enhance student learning experiences. The project focused on creating an intuitive, scalable, and user-friendly interface to improve school operations and classroom engagement.",
        link : "https://scrybehub.ng",
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
        src: {
          desktop: "/legend-store.webp",
          mobile: "/legend-store.webp"
        },
        alt: "Legend Swift Cart Store mini e-commerce application built with React, featuring product listings, cart management, authentication UI, and smooth animations.",
        title: "LEGEND STORE",
        titleLong: "Legend Swift Cart Store - Mini E-commerce",
        description: "Built a modern mini e-commerce frontend with React, featuring product listings, cart persistence, authentication UI, route protection, and smooth micro-interactions using Zustand and Framer Motion.",
        descriptionLong: "Legend Swift Cart Store is a production-ready mini e-commerce frontend built with React, designed with modern 2026 architecture patterns. It features paginated product listings, category filtering, debounced search, dynamic product pages, and a cart system with Zustand and localStorage persistence. The app includes a checkout flow with React Hook Form + Zod, mock authentication, protected routes, Tailwind CSS styling, and Framer Motion animations, emphasizing scalability, clean architecture, and smooth UX.",
        link: "https://legend-swift-cart-project.vercel.app/"
      },
      {
        src: {
          desktop: "/micro-hub-homepage-image.webp",
          mobile: "/micro-hub-homepage-image.webp"
        },
        alt: "Micro Hub micro-frontend dashboard interface showcasing modular architecture with Auth, Analytics, and Settings modules dynamically loaded through Module Federation in a clean green and white layout.",
        title: "Micro Hub",
        titleLong: "Production-Grade Micro-Frontend Dashboard Architecture",
        description: "Built Micro Hub, a scalable micro-frontend dashboard platform composed of independently deployed applications integrated via Module Federation.",
        descriptionLong: "Developed Micro Hub, a production-ready micro-frontend dashboard built using distributed frontend architecture principles. The system consists of independently deployed Auth, Analytics, and Settings applications dynamically integrated through Webpack Module Federation. It includes shared singleton dependency management, runtime remote loading, route-level protection, and environment-based configuration. The architecture emphasizes scalability, performance through lazy loading of entire micro apps, and clear separation of domain boundaries for maintainability.",
        link: "https://micro-hub-seven.vercel.app"
      },
      // {
      //   src: {
      //     desktop: "/valentine-project-image.webp",
      //     mobile: "/valentine-project-image.webp"
      //   },
      //   alt: "Valentine themed interactive web app featuring pink romantic UI, animated poems, playful button interactions, and celebratory motion effects.",
      //   title: "Valentine Project",
      //   titleLong: "Interactive Valentine UI Experience - Creative Fun Project",
      //   description: "Built a playful and romantic Valentine web app featuring animated poems, dynamic button interactions, and smooth motion effects.",
      //   descriptionLong: "Developed an interactive Valentine-themed web application focused on delightful user experience and animation-driven storytelling. The project features dynamic name personalization, sequential romantic poem reveals, playful micro-interactions (including a moving 'No' button), and celebratory motion effects upon confirmation. Built using React, styled-components, and Framer Motion to explore creative UI design and expressive frontend animation.",
      //   link: "https://valentine-project-eight-zeta.vercel.app"
      // },
      // {
      //   src : {
      //     desktop : "/ofure-jewelry-store.webp",
      //     mobile : "/ofure-jewelry-store.webp"
      //   },
      //   alt : "Elegant e-commerce UI for Ofure Jewelry Store showcasing jewelry products with a clean and user-focused design.",
      //   title : "Jewelry Store",
      //   titleLong : "Ofure Jewelry Store Design - Personal Project",
      //   description : "Built an elegant e-commerce UI for Ofure Jewelry Store, focusing on showcasing jewelry products.",
      //   descriptionLong : "Ofure Jewelry Store is an incomplete e-commerce platform I designed and built early in my learning journey. This project, developed before I learned React, helped me gain significant insights into web development, focusing on creating a clean and visually appealing UI for showcasing jewelry products.",
      //   link : "https://ofure-jewelry.vercel.app",
      // },
      {
        src : {
          desktop : "/kiddies-auto.webp",
          mobile : "/kiddies-auto.webp"
        },
        alt : "Responsive React mini e-commerce app for Kiddies Auto, developed during the HNG internship using a Figma design.",
        title : "Kiddies Auto",
        titleLong : "Kiddies Auto Mini E-commerce - Internship Project",
        description : "Built Kiddies Auto during HNG, translating a Figma design into a responsive React mini e-commerce app.",
        descriptionLong : "Kiddies Auto is a React-based mini e-commerce app developed during HNG internship program. The project involved translating a detailed Figma design, created by a seasoned product designer, into a responsive and functional platform. This challenge enhanced my skills in building interactive applications and adhering to professional design standards in real-world scenarios.",
        link : "https://kiddies-auto.vercel.app",
      },
        {
          src : {
            desktop : "/brew-board-homepage-image.webp",
            mobile : "/brew-board-homepage-image.webp"
          },
          alt : "Brew Board real-time collaborative Kanban interface showcasing coffee-themed task management, live updates, drag-and-drop functionality, and multi-user synchronization.",
          title : "Brew Board",
          titleLong : "Real-Time Collaborative Kanban Board - Distributed Frontend System",
          description : "Built Brew Board, a production-grade real-time collaborative Kanban application with optimistic updates, offline support, and role-based permissions.",
          descriptionLong : "Developed Brew Board, a real-time collaborative Kanban platform engineered with distributed systems principles at the frontend layer. The application features live multi-user synchronization via WebSockets, optimistic UI updates with rollback handling, conflict resolution through versioning, offline-first architecture with queued mutations, and role-based access control. The project emphasizes scalable architecture, state separation between server and client, and resilient real-time collaboration.",
          link : "https://brew-board.vercel.app/"
        },
      // {
      //   src : {
      //     desktop : "/e-commerce_with_cart.webp",
      //     mobile : "/e-commerce_with_cart.webp"
      //   },
      //   alt : "Responsive React e-commerce app featuring a functional cart page, developed during an MLSA bootcamp challenge from Frontend Mentor.",
      //   title : "Cart E-commerce",
      //   titleLong : "E-commerce with Cart Page - Boot Camp Project",
      //   description : "Built a React e-commerce app with a cart page during the MLSA bootcamp, based on a Frontend Mentor challenge.",
      //   descriptionLong : "This React-based mini e-commerce app with a functional cart page was developed during the MLSA bootcamp, based on a Frontend Mentor challenge. The project emphasized building a responsive and dynamic user interface while efficiently managing state to deliver seamless cart functionality. This experience enhanced my understanding of e-commerce development and UI/UX best practices.",
      //   link : "https://mlsa-project-assignment-product-list-with-cart-main.vercel.app",
      // },
      // {
      //   src : {
      //     desktop : "/tip-calculator.webp",
      //     mobile : "/tip-calculator.webp"
      //   },
      //   alt : "React tip calculator app with responsive design and accurate cost calculations, built from a Frontend Mentor challenge.",
      //   title : "Tip Calculator",
      //   titleLong : "Tip Calculator App - Personal Project",
      //   description : "Developed a React tip calculator app from a Frontend Mentor challenge, focusing on responsive design and accurate calculations.",
      //   descriptionLong : "This React-based tip calculator app was developed from a Frontend Mentor design challenge. The project involved creating a responsive layout adaptable to different screen sizes, implementing hover states for interactive elements, and ensuring accurate tip and total cost calculations per person. It improved my attention to design precision and functionality.",
      //   link : "https://tip-14th-challenge-react-version.vercel.app",
      // },
      // {
      //   src : {
      //     desktop : "/age-calculator.webp",
      //     mobile : "/age-calculator.webp"
      //   },
      //   alt : "React age calculator app with form validation, responsive layout, and accurate age calculations, built from a Frontend Mentor challenge.",
      //   title : "Age Calculator",
      //   titleLong : "Age Calculator App - Personal Project",
      //   description : "Built a React age calculator app from a Frontend Mentor challenge with form validation and responsive design.",
      //   descriptionLong : "This React age calculator app was developed from a Frontend Mentor design challenge. It calculates an individual's age in years, months, and days based on a valid input date. The app includes robust form validation, ensuring accurate and realistic date entries, and features a responsive layout with interactive hover and focus states.",
      //   link : "https://age-6th-challenge-react-version.vercel.app",
      // },
    ];

    const generateRandomProject = (arr, limit) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);
    };

  return (
    <AppContext.Provider value={{
        lightMode, setLightMode,
        hover, setHover,
        slowTransition,
        development,
        projects,
        generateRandomProject,
        scrollToTop,
        projectOpen, setProjectOpen,
        projectsData,
        select,
        selected,
        likedProjectOpen, setLikedProjectOpen,
        funFacts, 
        funFact, 
        skills, 
        animationKey, 
        handleFunFacts,
        mobileNav, setMobileNav,
        socials,
        preloader, setPreloader,
        fadeAway, setFadeAway,
        animationStart, setAnimationStart,
        loadingPercentage, setLoadingPercentage
    }}>
        {children}
    </AppContext.Provider>
  );
};
