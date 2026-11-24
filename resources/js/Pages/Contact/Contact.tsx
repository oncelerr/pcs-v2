import React, { useRef, useState } from "react";
import "./Contact.css";
import { useReveal } from "../../lib/motion";

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    firstname: '',
    lastname: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  useReveal(pageRef);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.firstname.trim()) newErrors.firstname = 'First name is required';
    if (!formData.lastname.trim()) newErrors.lastname = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      if (!csrfToken) {
        throw new Error('CSRF token not found');
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': csrfToken
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          firstname: formData.firstname.trim(),
          lastname: formData.lastname.trim(),
          email: formData.email.trim(),
          message: formData.message.trim()
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Success
      setSubmitStatus({
        success: true,
        message: data.message || 'Your message has been sent successfully!'
      });

      // Reset form
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        message: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="contact-page contact-cont" ref={pageRef}>
      <h1 className="contact-cont-h1">Have Questions? We're Here to Help.</h1>
      <p className="contact-cont-p">Whether you're starting a business, need help with tax filing, or staying compliant, our team is ready to guide you. Reach out today — we'll respond quickly with the answers and support you need.</p>

      <div className="grid-wrp">
        {/* Left Side - Contact Info */}
        <div className="grid-left" data-reveal>
          <img src="/assets/contact-img.png" alt="Contact us" />
          <div className="contact-info">
            <div className="each-info">
              <img src="/assets/email-icon.png" alt="" />
              <div>
                <p className="info-text-title">Our Location</p>
                <p className="info-text-value">30 North Gould Street, Sheridan, WY, United States, Wyoming</p>
              </div>
            </div>
            <div className="each-info">
              <img src="/assets/email-icon.png" alt="" />
              <div>
                <p className="info-text-title">Phone Number</p>
                <p className="info-text-value"><a href="tel:+13204297403">+1 (320) 429-7403</a></p>
              </div>
            </div>
            <div className="each-info">
              <img src="/assets/email-icon.png" alt="" />
              <div>
                <p className="info-text-title">Email Address</p>
                <p className="info-text-value"><a href="mailto:support@premiumcorpsolutions.com">support@premiumcorpsolutions.com</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <div className="grid-right" data-reveal>
          <h1 className="grid-right-h1">Get in Touch with Us</h1>
          <p className="grid-right-p">Our friendly team would love to hear from you.</p>

          {submitStatus && (
            <div
              className={`alert ${submitStatus.success ? 'alert-success' : 'alert-error'}`}
              role={submitStatus.success ? 'status' : 'alert'}
            >
              {submitStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="visually-hidden" htmlFor="contact-firstname">First Name</label>
              <input
                id="contact-firstname"
                type="text"
                name="firstname"
                autoComplete="given-name"
                aria-invalid={errors.firstname ? true : undefined}
                aria-describedby={errors.firstname ? 'contact-firstname-error' : undefined}
                placeholder="First Name"
                value={formData.firstname}
                onChange={handleChange}
                className={errors.firstname ? 'error' : ''}
              />
              {errors.firstname && <span className="error-message" id="contact-firstname-error">{errors.firstname}</span>}
            </div>

            <div className="form-group">
              <label className="visually-hidden" htmlFor="contact-lastname">Last Name</label>
              <input
                id="contact-lastname"
                type="text"
                name="lastname"
                autoComplete="family-name"
                aria-invalid={errors.lastname ? true : undefined}
                aria-describedby={errors.lastname ? 'contact-lastname-error' : undefined}
                placeholder="Last Name"
                value={formData.lastname}
                onChange={handleChange}
                className={errors.lastname ? 'error' : ''}
              />
              {errors.lastname && <span className="error-message" id="contact-lastname-error">{errors.lastname}</span>}
            </div>

            <div className="form-group">
              <label className="visually-hidden" htmlFor="contact-email">Email Address</label>
              <input
                id="contact-email"
                type="email"
                name="email"
                autoComplete="email"
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message" id="contact-email-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="visually-hidden" htmlFor="contact-message">Your Message</label>
              <textarea
                id="contact-message"
                name="message"
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'error' : ''}
              />
              {errors.message && <span className="error-message" id="contact-message-error">{errors.message}</span>}
            </div>

            <button type="submit" className="contact-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}