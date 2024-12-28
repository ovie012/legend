import React, { useState, useRef } from "react";

const ContactForm = () => {
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

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    // alert("Thanks for your message! I'll get back to you soon.");
    // setFormData({ name: "", language: "", techStack: "", role: "", email : "", message: "" });

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

    if (nameRef.trim() === '') {
      errors.nameError = true;
      errors.name = 'No name? No fame! Fill it out so i can know who’s awesome.'
    }
    if (languageRef.trim() === '') {
      errors.languageError = true;
      errors.language = "Are you a Pythonista, a JavaScript wizard, or ? Let me know!"
    }
    if (techStackRef.trim() === '') {
      errors.techStackError = true;
      errors.techStack = "Share your tech stack and flex your dev muscles!";
    }
    if (roleRef.trim() === '') {
      errors.roleError = true;
      errors.role = "What’s your superpower in the team? Share your role with us!";
    }
    if (emailRef.trim() === '') {
      errors.emailError = true;
      errors.email = "No spam, just vibes, enter your email so we can stay connected!";
    }
    if (messageRef.trim() === '') {
      errors.messageError = true;
      errors.message = "Not so pro tip: Take breaks often, send a message.";
    }

    setFormData((prevState) => ({
      ...prevState,
      ...errors,
    }));
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          name="name"
          ref={formRef.name}
          placeholder=""
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
          placeholder=""
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
          placeholder=""
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
          placeholder=""
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
          placeholder=""
          style={{ borderColor : formData.email && "rgb(251, 80, 80)" }}
        />
        <label>Email</label>
        {formData.email && <p className="error-text">{formData.email}</p>}
      </div>
      <div className="form-group">
        <textarea
          name="message"
          ref={formRef.message}
          placeholder=""
          style={{ borderColor : formData.message && "rgb(251, 80, 80)" }}
        ></textarea>
        <label>Message</label>
        {formData.message && <p className="error-text">{formData.message}</p>}
      </div>
      <button type="submit" className="btn-submit">
        Send Message
      </button>
    </form>
  );
};

export default ContactForm;