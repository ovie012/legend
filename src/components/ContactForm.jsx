import React, { useState } from "react";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    language: "",
    techStack: "",
    role: "",
    email : "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thanks for your message! I'll get back to you soon.");
    setFormData({ name: "", language: "", techStack: "", role: "", email : "", message: "" });
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <label>Name</label>
      </div>
      <div className="form-group">
        <input
          type="text"
          name="language"
          value={formData.language}
          onChange={handleChange}
          required
        />
        <label>Favorite Programming Language</label>
      </div>
      <div className="form-group">
        <input
          type="text"
          name="techStack"
          value={formData.techStack}
          onChange={handleChange}
          required
        />
        <label>Tech Stack</label>
      </div>
      <div className="form-group">
        <input
          type="text"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        />
        <label>Role</label>
      </div>
      <div className="form-group">
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <label>Email</label>
      </div>
      <div className="form-group">
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>
        <label>Message</label>
      </div>
      <button type="submit" className="btn-submit">
        Send Message
      </button>
    </form>
  );
};

export default ContactForm;