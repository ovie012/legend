import React from 'react';
import ContactForm from '../components/ContactForm';
import SocialLinks from '../components/SocialLinks';
import HireMeSection from '../components/HireMeSection';
import BlurAndSvg from '../components/BlurAndSvg';
import { motion } from 'framer-motion';

function Contact() {
  return (
    <>
        <div className="contact-page">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <h1 className="contact-title">Get in Touch</h1>
                </motion.div>
            <div className="contact-container">
                <ContactForm />
                <motion.div
                  className="social-links"
                  initial={{ x: 200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.2 }}
                >
                  <SocialLinks />
                </motion.div>
            </div>
            <HireMeSection />
        </div>
        <div className="blur-div">
            <BlurAndSvg />
        </div>
    </>
  )
}

export default Contact;