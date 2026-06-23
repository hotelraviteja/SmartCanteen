/**
 * Utility validators for CampusBite forms
 */

// Regular expressions
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const STUDENT_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)*edu(?:\.[a-zA-Z]{2,})?$/i; // Optional strict college domains
export const PHONE_REGEX = /^[6-9]\d{9}$/; // Valid Indian phone numbers
export const STUDENT_ID_REGEX = /^[a-zA-Z0-9-]{4,15}$/;

/**
 * Validate college email address. For academic institutions, they usually end with .edu,
 * but for sandbox/demo flexibility, we will accept any valid email, warning if it doesn't look like an academic domain.
 */
export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Invalid email address format";
  return true;
};

/**
 * Analyze password strength and return criteria flags
 */
export const checkPasswordStrength = (password) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const metCount = Object.values(requirements).filter(Boolean).length;
  
  let score = 0; // 0 to 4
  let label = "Very Weak";
  let colorClass = "bg-neutral-300";

  if (password.length > 0) {
    if (metCount <= 2) {
      score = 1;
      label = "Weak";
      colorClass = "bg-error";
    } else if (metCount === 3 || metCount === 4) {
      score = 2.5;
      label = "Moderate";
      colorClass = "bg-amber-400";
    } else if (metCount === 5) {
      if (password.length >= 12) {
        score = 4;
        label = "Strong (Secure)";
        colorClass = "bg-success";
      } else {
        score = 3.2;
        label = "Good";
        colorClass = "bg-emerald-400";
      }
    }
  }

  return {
    score,
    label,
    colorClass,
    requirements,
  };
};
