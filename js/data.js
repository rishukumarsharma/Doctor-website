/* ==========================================================================
   CENTRAL SITE DATA
   Single source of truth for doctor profile, services, pricing, contact
   details and content. Edit values here — never hardcode them in HTML.
   Replace every [Placeholder] before launch.
   ========================================================================== */

const SITE_DATA = {
  doctor: {
    name: "Dr. Amulya.S.M.",
    title: "Body Slimming & Facial Aesthetics Specialist",
    philosophy:
      "Every plan starts with a real conversation — your goals, your routine, your history — before it starts with a protocol.",
    image: "assets/doctor/doctor-portrait.jpg",
  },

  contact: {
    phone: "+91 82771 99017",
    whatsapp: "918277199017", // digits only, no + or spaces — used to build wa.me links
    email: "dramulyasm@gmail.com",
    timings: "Monday – Sunday, 07:00 AM – 10:00 PM",
    openingHoursSchema: "Mo-Su 07:00-22:00", // schema.org / ISO format of `timings` above — keep in sync
  },

  nav: [
    { label: "Home", href: "" },
    { label: "About", href: "about/" },
    { label: "Services", href: "services/" },
    { label: "Pricing", href: "pricing/" },
  ],

  specializations: [
    {
      id: "body-slimming",
      label: "Body Slimming",
      eyebrow: "Weight Management",
      title: "Body Slimming & Weight Management",
      description:
        "Personalized nutrition, lifestyle guidance and progress monitoring built around your body, your routine and your goals.",
      href: "body-slimming/",
      image: "assets/images/herosection.png",
      imageFocal: "85% 15%",
    },
    {
      id: "facial-aesthetics",
      label: "Facial Aesthetics",
      eyebrow: "Skin & Contour",
      title: "Facial Aesthetics",
      description:
        "A refined, evidence-informed approach to skin health, contouring and anti-ageing care — assessed and planned around your face.",
      href: "facial-aesthetics/",
      image: "assets/images/Refined.png",
      imageFocal: "75% 15%",
    },
  ],

  services: {
    "body-slimming": [
      {
        name: "Weight Management Consultation",
        description: "A full assessment of your goals, history and lifestyle to build your starting plan.",
        duration: "45 min",
        price: "₹[XXX]",
      },
      {
        name: "Personalized Nutrition Planning",
        description: "A diet plan shaped around your preferences, routine and any relevant health considerations.",
        duration: "30 min",
        price: "₹[XXX]",
      },
      {
        name: "Body Composition Assessment",
        description: "Baseline measurements to understand where you're starting from.",
        duration: "20 min",
        price: "₹[XXX]",
      },
      {
        name: "Lifestyle Guidance",
        description: "Practical, sustainable adjustments to activity, sleep and daily routine.",
        duration: "30 min",
        price: "₹[XXX]",
      },
      {
        name: "Progress Monitoring",
        description: "Scheduled check-ins to track progress and adjust the plan as needed.",
        duration: "20 min",
        price: "₹[XXX]",
      },
      {
        name: "Follow-Up Consultation",
        description: "Ongoing guidance once your program is underway.",
        duration: "20 min",
        price: "₹[XXX]",
      },
    ],
    "facial-aesthetics": [
      {
        name: "Facial Aesthetic Consultation",
        description: "An in-depth review of skin health, concerns and goals before any treatment is planned.",
        duration: "30 min",
        price: "₹[XXX]",
      },
      {
        name: "Skin Rejuvenation",
        description: "A personalized plan to support skin health and texture over time.",
        duration: "45 min",
        price: "₹[XXX]",
      },
      {
        name: "Facial Contouring",
        description: "Assessment and guidance for facial contour goals.",
        duration: "45 min",
        price: "₹[XXX]",
      },
      {
        name: "Anti-Ageing Treatments",
        description: "A considered, gradual approach to ageing concerns.",
        duration: "45 min",
        price: "₹[XXX]",
      },
      {
        name: "Personalized Skin Care Guidance",
        description: "A day-to-day routine built around your skin type and concerns.",
        duration: "20 min",
        price: "₹[XXX]",
      },
    ],
  },

  journey: [
    {
      step: "01",
      title: "Tell Us About Your Goals",
      description: "Share your goals, lifestyle and concerns so the doctor can understand what you're looking for.",
    },
    {
      step: "02",
      title: "Meet Your Doctor",
      description: "Schedule your personalized consultation — online or in clinic.",
    },
    {
      step: "03",
      title: "Get Your Personalized Plan",
      description: "Based on your consultation and assessment, receive recommendations tailored to your needs.",
    },
    {
      step: "04",
      title: "Follow Your Progress",
      description: "Track your progress and adjust the plan together during follow-up consultations.",
    },
    {
      step: "05",
      title: "Continue With Expert Guidance",
      description: "Stay connected for follow-ups, questions and ongoing guidance where applicable.",
    },
  ],

  consultationGoals: [
    "Weight Management",
    "Body Slimming",
    "Nutrition Planning",
    "Facial Aesthetic Consultation",
    "Skin / Facial Concerns",
    "General Consultation",
  ],

  programs: [
    {
      id: "single-consultation",
      name: "Single Consultation",
      duration: "One Consultation",
      price: "Free",
      originalPrice: "₹500",
      recommended: false,
      description: "Book now and your first consultation is free — ₹500 once the offer ends.",
      features: ["One consultation", "Personalized assessment", "Initial recommendations"],
    },
    {
      id: "one-month",
      name: "1 Month",
      duration: "1 Month Program",
      price: "₹2,500",
      originalPrice: "₹4,000",
      recommended: false,
      description: "A focused start with built-in follow-up.",
      features: ["Initial consultation", "Personalized plan", "1 follow-up consultation"],
    },
    {
      id: "three-month",
      name: "3 Months",
      duration: "3 Month Program",
      price: "₹5,000",
      originalPrice: "₹8,000",
      recommended: true,
      description: "2 months of the program, plus 1 month free when you book now.",
      features: ["Initial consultation", "Personalized plan", "Multiple follow-ups", "Progress monitoring", "1 month free"],
    },
    {
      id: "six-month",
      name: "6 Months",
      duration: "6 Month Program",
      price: "₹10,999",
      originalPrice: "₹17,999",
      recommended: false,
      description: "6 months of the program, plus 3 months of maintenance free when you book now.",
      features: ["Initial consultation", "Personalized plan", "Regular follow-ups", "Progress monitoring", "3 months maintenance free"],
    },
  ],

  pricingConsultations: [
    { name: "Initial Consultation", description: "Your first full assessment — free when you book now.", price: "Free", originalPrice: "₹500" },
    { name: "Follow-Up Consultation", description: "For patients already under a plan.", price: "Free", originalPrice: "₹500" },
    { name: "Online Consultation", description: "Video consultation from anywhere.", price: "Free", originalPrice: "₹500" },
    { name: "In-Clinic Consultation", description: "In-person at the clinic.", price: "Free", originalPrice: "₹500" },
  ],

  testimonials: [
    {
      placeholder: true,
      quote: "[Placeholder — real, consented patient testimonial to be added here.]",
      name: "[Patient Name / Initials]",
      service: "Body Slimming Program",
    },
    {
      placeholder: true,
      quote: "[Placeholder — real, consented patient testimonial to be added here.]",
      name: "[Patient Name / Initials]",
      service: "Facial Aesthetics",
    },
    {
      placeholder: true,
      quote: "[Placeholder — real, consented patient testimonial to be added here.]",
      name: "[Patient Name / Initials]",
      service: "Weight Management",
    },
  ],

  faqs: [
    {
      q: "How does the first consultation work?",
      a: "Your first consultation is a full conversation about your goals, history and lifestyle, along with a relevant assessment. From there, the doctor builds recommendations specific to you — nothing generic.",
    },
    {
      q: "Can I book an online consultation instead of visiting the clinic?",
      a: "Yes. Both online and in-clinic consultations are available — choose whichever is more convenient when you book.",
    },
    {
      q: "How is my diet plan created?",
      a: "It's built from your consultation and assessment — factoring in your goals, food preferences, routine, activity level and any relevant health considerations.",
    },
    {
      q: "What if I'm not sure which program to choose?",
      a: "Start with a Single Consultation. The doctor will recommend a program only if it's genuinely useful for your goals.",
    },
    {
      q: "How do follow-ups work?",
      a: "Follow-up consultations are scheduled as part of your program to review progress and adjust your plan as needed.",
    },
    {
      q: "What is your cancellation and rescheduling policy?",
      a: "Please see our Cancellation / Refund Policy in the footer for full details, or contact the clinic directly to reschedule.",
    },
  ],

  results: {
    disclaimer:
      "All results shown are from genuine, consenting patients. Individual outcomes vary based on personal factors, adherence and consultation. [Placeholder gallery — populate with real, consented before/after material.]",
  },

  blogPlaceholder: true,

  policies: {
    disclaimerShort:
      "Consultations, programs and recommendations are personalized to each patient. No specific outcome is guaranteed.",
  },
};

// Attach to window for use across all pages without a build step.
window.SITE_DATA = SITE_DATA;
