"use client";

import React, { useState, FormEvent } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Building2,
  WalletCards,
  Handshake,
  ShieldCheck,
} from "lucide-react";

type FormData = {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  businessType: string;
  financingNeed: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    businessType: "",
    financingNeed: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = () => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Please select an option";
    }

    if (!formData.financingNeed) {
      newErrors.financingNeed = "Please select what you need help with";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus("submitting");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus("success");

      setFormData({
        firstName: "",
        lastName: "",
        company: "",
        email: "",
        phone: "",
        businessType: "",
        financingNeed: "",
        message: "",
      });

      setErrors({});
    } catch {
      setStatus("error");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const inputClass = (field: keyof FormData) => {
    const base =
      "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-on-surface " +
      "placeholder:text-on-surface-variant/60 outline-none transition-all duration-200";

    const state = errors[field]
      ? "border-error focus:ring-2 focus:ring-error/10"
      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/10";

    return `${base} ${state}`;
  };

  const selectClass = (field: keyof FormData) => {
    return `${inputClass(field)} appearance-none cursor-pointer`;
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-surface-container-low py-6 md:py-8"
    >
      {/* =====================================================
          SUBTLE BACKGROUND ACCENTS
      ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-secondary-container/5 blur-3xl"
      />

      <div className="container relative">

        {/* =====================================================
            SECTION INTRO - CENTERED (COMPACT)
        ====================================================== */}

        <div className="max-w-2xl mx-auto text-center mb-6 lg:mb-8">
          <div className="inline-flex items-center gap-1.5 mb-2">
            <span className="h-1 w-6 rounded-full bg-secondary-container" />

            <span className="text-xs font-semibold text-primary uppercase tracking-[0.14em]">
              Let&apos;s talk
            </span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-primary leading-tight">
            Ready to strengthen your distribution network?
          </h2>

          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            Whether you are a manufacturer looking to empower your
            distributors or a distributor looking for working capital,
            our team is ready to help you explore the right financing
            solution.
          </p>
        </div>

        {/* =====================================================
            MAIN CONTACT LAYOUT - SINGLE OUTER CARD
        ====================================================== */}

        <div className="rounded-xl border border-outline-variant bg-white overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">

            {/* =================================================
                LEFT — FINANCING CONTEXT (BLUE) - ULTRA COMPACT
            ================================================== */}

            <div className="relative overflow-hidden rounded-l-xl lg:rounded-r-none bg-primary p-4 lg:p-5 text-on-primary flex flex-col">

              <div className="relative">

                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
                    <Handshake className="h-3.5 w-3.5 text-secondary-container" />
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5">
                    <span className="h-1 w-1 rounded-full bg-secondary-container" />

                    <span className="text-[11px] text-white/70">
                      Financing ecosystem
                    </span>
                  </div>
                </div>

                <h3 className="text-lg lg:text-xl font-bold text-white mt-4 max-w-md leading-tight">
                  Capital that moves with your business.
                </h3>

                <p className="text-xs text-white/70 mt-2 max-w-md leading-snug">
                  Connect your distribution network to financing
                  designed around the way your business actually operates.
                </p>

                {/* Financing visualization - ULTRA COMPACT */}

                <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.07] p-3">

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-white/60 uppercase tracking-wide">
                      Distribution network
                    </span>

                    <ArrowUpRight className="h-3 w-3 text-secondary-container" />
                  </div>

                  <div className="space-y-1.5">

                    {/* Manufacturer */}

                    <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] p-2">

                      <div className="h-7 w-7 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-3 w-3 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          Manufacturer
                        </p>

                        <p className="text-[11px] text-white/50 truncate">
                          Supplies inventory
                        </p>
                      </div>

                      <span className="text-secondary-container text-sm">
                        →
                      </span>

                    </div>

                    {/* Financing */}

                    <div className="flex items-center gap-2 rounded-lg bg-secondary-container/10 border border-secondary-container/20 p-2">

                      <div className="h-7 w-7 rounded bg-secondary-container/15 flex items-center justify-center flex-shrink-0">
                        <WalletCards className="h-3 w-3 text-secondary-container" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          Financing
                        </p>

                        <p className="text-[11px] text-white/50 truncate">
                          Working capital
                        </p>
                      </div>

                      <span className="text-secondary-container text-sm">
                        →
                      </span>

                    </div>

                    {/* Distributor */}

                    <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] p-2">

                      <div className="h-7 w-7 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-3 w-3 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          Distributor
                        </p>

                        <p className="text-[11px] text-white/50 truncate">
                          Grows and sells
                        </p>
                      </div>

                      <CheckCircle2 className="h-3 w-3 text-secondary-container flex-shrink-0" />

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                RIGHT — FORM (WHITE) - ULTRA COMPACT
            ================================================== */}

            <div className="rounded-r-xl lg:rounded-l-none bg-surface border-l border-outline-variant lg:border-l-0 p-3 lg:p-4 flex flex-col">

              <div className="mb-3">

                <h3 className="text-base font-semibold text-primary">
                  Tell us about your business
                </h3>

                <p className="text-xs text-on-surface-variant mt-0.5">
                  Share a few details and our team will get back to you.
                </p>

              </div>

              {/* Success */}

              {status === "success" && (
                <div
                  className="mb-3 p-2 bg-success-container text-on-success-container rounded-lg flex items-start gap-2 animate-slide-up"
                  role="status"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />

                  <div>
                    <p className="font-medium text-xs">
                      Message sent successfully.
                    </p>

                    <p className="text-[11px] mt-0.5 opacity-80">
                      Thank you for reaching out. Our team will get back to
                      you soon.
                    </p>
                  </div>
                </div>
              )}

              {/* Error */}

              {status === "error" && (
                <div
                  className="mb-3 p-2 bg-error-container text-on-error-container rounded-lg flex items-start gap-2 animate-slide-up"
                  role="alert"
                >
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />

                  <div>
                    <p className="font-medium text-xs">
                      Something went wrong.
                    </p>

                    <p className="text-[11px] mt-0.5 opacity-80">
                      Please try again later.
                    </p>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-3 flex-1"
                noValidate
              >

                {/* Name */}

                <div className="grid sm:grid-cols-2 gap-3">

                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs font-medium text-on-surface mb-1"
                    >
                      First Name
                    </label>

                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      className={inputClass("firstName")}
                      disabled={status === "submitting"}
                      aria-invalid={!!errors.firstName}
                      aria-describedby={
                        errors.firstName ? "firstName-error" : undefined
                      }
                    />

                    {errors.firstName && (
                      <p
                        id="firstName-error"
                        className="mt-0.5 text-[11px] text-error font-medium"
                        role="alert"
                      >
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs font-medium text-on-surface mb-1"
                    >
                      Last Name
                    </label>

                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className={inputClass("lastName")}
                      disabled={status === "submitting"}
                      aria-invalid={!!errors.lastName}
                      aria-describedby={
                        errors.lastName ? "lastName-error" : undefined
                      }
                    />

                    {errors.lastName && (
                      <p
                        id="lastName-error"
                        className="mt-0.5 text-[11px] text-error font-medium"
                        role="alert"
                      >
                        {errors.lastName}
                      </p>
                    )}
                  </div>

                </div>

                {/* Company */}

                <div>
                  <label
                    htmlFor="company"
                    className="block text-xs font-medium text-on-surface mb-1"
                  >
                    Company / Business Name
                  </label>

                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company or business name"
                    className={inputClass("company")}
                    disabled={status === "submitting"}
                    aria-invalid={!!errors.company}
                    aria-describedby={
                      errors.company ? "company-error" : undefined
                    }
                  />

                  {errors.company && (
                    <p
                      id="company-error"
                      className="mt-0.5 text-[11px] text-error font-medium"
                      role="alert"
                    >
                      {errors.company}
                    </p>
                  )}
                </div>

                {/* Email + Phone */}

                <div className="grid sm:grid-cols-2 gap-3">

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-on-surface mb-1"
                    >
                      Work Email
                    </label>

                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className={inputClass("email")}
                      disabled={status === "submitting"}
                      aria-invalid={!!errors.email}
                      aria-describedby={
                        errors.email ? "email-error" : undefined
                      }
                    />

                    {errors.email && (
                      <p
                        id="email-error"
                        className="mt-0.5 text-[11px] text-error font-medium"
                        role="alert"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-medium text-on-surface mb-1"
                    >
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+254..."
                      className={inputClass("phone")}
                      disabled={status === "submitting"}
                      aria-invalid={!!errors.phone}
                      aria-describedby={
                        errors.phone ? "phone-error" : undefined
                      }
                    />

                    {errors.phone && (
                      <p
                        id="phone-error"
                        className="mt-0.5 text-[11px] text-error font-medium"
                        role="alert"
                      >
                        {errors.phone}
                      </p>
                    )}
                  </div>

                </div>

                {/* Business type + Financing need */}

                <div className="grid sm:grid-cols-2 gap-3">

                  <div>
                    <label
                      htmlFor="businessType"
                      className="block text-xs font-medium text-on-surface mb-1"
                    >
                      I am a...
                    </label>

                    <select
                      id="businessType"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className={selectClass("businessType")}
                      disabled={status === "submitting"}
                      aria-invalid={!!errors.businessType}
                    >
                      <option value="">
                        Select one
                      </option>

                      <option value="distributor">
                        Distributor
                      </option>

                      <option value="manufacturer">
                        Manufacturer
                      </option>

                      <option value="financial-institution">
                        Financial Institution
                      </option>

                      <option value="technology-partner">
                        Technology Partner
                      </option>

                      <option value="other">
                        Other
                      </option>
                    </select>

                    {errors.businessType && (
                      <p className="mt-0.5 text-[11px] text-error font-medium">
                        {errors.businessType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="financingNeed"
                      className="block text-xs font-medium text-on-surface mb-1"
                    >
                      I&apos;m interested in...
                    </label>

                    <select
                      id="financingNeed"
                      name="financingNeed"
                      value={formData.financingNeed}
                      onChange={handleChange}
                      className={selectClass("financingNeed")}
                      disabled={status === "submitting"}
                      aria-invalid={!!errors.financingNeed}
                    >
                      <option value="">
                        Select one
                      </option>

                      <option value="distributor-financing">
                        Distributor Financing
                      </option>

                      <option value="working-capital">
                        Working Capital
                      </option>

                      <option value="purchase-order-financing">
                        Purchase Order Financing
                      </option>

                      <option value="credit-management">
                        Credit Management
                      </option>

                      <option value="partnership">
                        Partnership
                      </option>

                      <option value="other">
                        Other
                      </option>
                    </select>

                    {errors.financingNeed && (
                      <p className="mt-0.5 text-[11px] text-error font-medium">
                        {errors.financingNeed}
                      </p>
                    )}
                  </div>

                </div>

                {/* Message */}

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-medium text-on-surface mb-1"
                  >
                    Tell us more
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell us about your business, distribution network, or financing needs..."
                    className={`${inputClass(
                      "message"
                    )} resize-none min-h-[80px]`}
                    disabled={status === "submitting"}
                    aria-invalid={!!errors.message}
                    aria-describedby={
                      errors.message ? "message-error" : undefined
                    }
                  />

                  {errors.message && (
                    <p
                      id="message-error"
                      className="mt-0.5 text-[11px] text-error font-medium"
                      role="alert"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="
                    w-full py-2.5 rounded-lg
                    bg-primary text-on-primary
                    font-semibold text-sm
                    hover:opacity-90
                    active:scale-[0.99]
                    transition-all
                    shadow-sm
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    flex items-center justify-center gap-1.5
                    mt-auto
                  "
                >
                  {status === "submitting" ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>

                      Sending...
                    </>
                  ) : (
                    <>
                      Request a Consultation

                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* Privacy / trust */}

                <div className="flex items-start justify-center gap-1.5 pt-1">

                  <ShieldCheck
                    className="w-3 h-3 text-primary/60 mt-0.5 flex-shrink-0"
                  />

                  <p className="text-[11px] text-on-surface-variant text-center max-w-lg">
                    Your information is kept confidential and will only be
                    used to respond to your enquiry.
                  </p>

                </div>

              </form>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}