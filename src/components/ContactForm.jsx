import React, { useState, useRef } from "react";
import emailjs from "emailjs-com";

function ContactForm() {
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [sentMessage, setSentMessage] = useState("");
  const [formData, setFormData] = useState({
    name : "",
    nameError : false,
    language : "",
    languageError : false,
    techStack : "",
    techStackError : false,
    role : "",
    roleError : false,
    email : "",
    emailError : false,
    message : "",
    messageError : false,
  });

  const formRef = {
    name : useRef(),
    language : useRef(),
    techStack : useRef(),
    role : useRef(),
    email : useRef(),
    message : useRef(),
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    let errors = {
      name : "",
      nameError : false,
      language : "",
      languageError : false,
      techStack : "",
      techStackError : false,
      role : "",
      roleError : false,
      email : "",
      emailError : false,
      message : "",
      messageError : false,
    }

    const nameRef = formRef.name.current.value;
    const languageRef = formRef.language.current.value;
    const techStackRef = formRef.techStack.current.value;
    const roleRef = formRef.role.current.value;
    const emailRef = formRef.email.current.value;
    const messageRef = formRef.message.current.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nameRef.trim() === '') {
      errors.nameError = true;
      errors.name = 'No name? Drop your name and make it official!'
    }
    if (languageRef.trim() === '') {
      errors.languageError = true;
      errors.language = "Are you a JavaScript wizard, or ??? Let me know!"
    }
    if (techStackRef.trim() === '') {
      errors.techStackError = true;
      errors.techStack = "Share your tech stack and flex your dev muscles!";
    }
    if (roleRef.trim() === '') {
      errors.roleError = true;
      errors.role = "Claim your role, what’s your superpower?";
    }
    if (emailRef.trim() === '') {
      errors.emailError = true;
      errors.email = "Enter your email so i can keep you in the loop!";
    } else if (!emailRegex.test(emailRef)) {
      errors.emailError = true;
      errors.email = "Oops! That email looks off, Lets fix it!";
    }
    if (messageRef.trim() === '') {
      errors.messageError = true;
      errors.message = "Not so pro tip: Take breaks often, send a message.";
    }

    setFormData((prevState) => ({
      ...prevState,
      ...errors,
    }));

    if (Object.values(errors).some((error) => error)) {
      setLoading(false);
      return;
    }

    // Send Email with EmailJS
    emailjs
      .send(
        "service_hniivlv", // EmailJS Service ID
        "template_nukzfpm", // EmailJS Template ID
        {
          name: nameRef,
          language: languageRef,
          techStack: techStackRef,
          role: roleRef,
          email: emailRef,
          message: messageRef,
        },
        "3qoTfXCjF2_xgMKYz" // EmailJS public key
      )
      .then(
        (result) => {
          setStatus(true);
          setEmailError(false);
          setSentMessage("Thank you! You'll be kept in the loop");
          setFormData({
            name: "",
            nameError: false,
            language: "",
            languageError: false,
            techStack: "",
            techStackError: false,
            role: "",
            roleError: false,
            email: "",
            emailError: false,
            message: "",
            messageError: false,
          });
          Object.values(formRef).forEach((ref) => (ref.current.value = ""));
          setLoading(false);
        },
        (error) => {
          setStatus(true);
          setEmailError(true);
          setSentMessage("It appears there's an error, Try Again");
          setLoading(false);
        }
      );
  };

  return (
    !status ? (
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="name"
            ref={formRef.name}
            placeholder=" "
            style={{ borderColor : formData.nameError && "rgb(251, 80, 80)" }}
          />
          <label>Name</label>
          {formData.nameError && <p className="error-text">{formData.name}</p>}
        </div>
        <div className="form-group">
          <input
            type="text"
            name="language"
            ref={formRef.language}
            placeholder=" "
            style={{ borderColor : formData.languageError && "rgb(251, 80, 80)" }}
          />
          <label>Favorite Programming Language</label>
          {formData.languageError && <p className="error-text">{formData.language}</p>}
        </div>
        <div className="form-group">
          <input
            type="text"
            name="techStack"
            ref={formRef.techStack}
            placeholder=" "
            style={{ borderColor : formData.techStackError && "rgb(251, 80, 80)" }}
          />
          <label>Tech Stack</label>
          {formData.techStackError && <p className="error-text">{formData.techStack}</p>}
        </div>
        <div className="form-group">
          <input
            type="text"
            name="role"
            ref={formRef.role}
            placeholder=" "
            style={{ borderColor : formData.roleError && "rgb(251, 80, 80)" }}
          />
          <label>Role</label>
          {formData.roleError && <p className="error-text">{formData.role}</p>}
        </div>
        <div className="form-group">
          <input
            type="text"
            name="email"
            ref={formRef.email}
            placeholder=" "
            style={{ borderColor : formData.emailError && "rgb(251, 80, 80)" }}
          />
          <label>Email</label>
          {formData.emailError && <p className="error-text">{formData.email}</p>}
        </div>
        <div className="form-group">
          <textarea
            name="message"
            ref={formRef.message}
            placeholder=" "
            style={{ borderColor : formData.messageError && "rgb(251, 80, 80)" }}
          ></textarea>
          <label>Message</label>
          {formData.messageError && <p className="error-text">{formData.message}</p>}
        </div>
        <button 
          type="submit" 
          className={`btn-submit ${loading ? 'disabled' : ''}`}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    )
      :
    (
      <section className="status-message">
        <p>{sentMessage}</p>
        <button className="btn-hire" onClick={() => { setEmailError(false); setStatus(false); }}>
          {emailError ? "Try Again" : "Ok"}
        </button>
      </section>
    ));

};

export default ContactForm;