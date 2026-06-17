import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

export const OTPInput = ({ value = "", onChange, length = 6, isError = false }) => {
  const [otpVal, setOtpVal] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    const valArr = value.split("").slice(0, length);
    const newOtp = [...Array(length).fill("")];
    valArr.forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtpVal(newOtp);
  }, [value, length]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!val) return;

    const char = val.slice(-1);
    const newOtp = [...otpVal];
    newOtp[index] = char;
    setOtpVal(newOtp);

    const fullVal = newOtp.join("");
    onChange(fullVal);

    if (index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otpVal[index] && index > 0) {
        const newOtp = [...otpVal];
        newOtp[index - 1] = "";
        setOtpVal(newOtp);
        onChange(newOtp.join(""));
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otpVal];
        newOtp[index] = "";
        setOtpVal(newOtp);
        onChange(newOtp.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasteData)) return;

    const pasteChars = pasteData.slice(0, length).split("");
    const newOtp = [...otpVal];
    
    pasteChars.forEach((char, index) => {
      newOtp[index] = char;
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });

    setOtpVal(newOtp);
    onChange(newOtp.join(""));

    const focusIdx = Math.min(pasteChars.length, length - 1);
    if (inputRefs.current[focusIdx]) {
      inputRefs.current[focusIdx].focus();
    }
  };

  return (
    <div className={`flex justify-between gap-2.5 py-1.5 ${isError ? "animate-shake" : ""}`}>
      {otpVal.map((digit, idx) => (
        <motion.input
          key={idx}
          whileFocus={{ scale: 1.03 }}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className={`h-12 w-10 md:h-13.5 md:w-11.5 text-center text-lg font-bold rounded-xl border bg-white/40 dark:bg-panel-dark/50 backdrop-blur-md outline-none transition-all duration-150 ${
            isError
              ? "border-error focus:ring-error text-error"
              : digit
              ? "border-brand focus:border-brand focus:ring-2 focus:ring-brand/15 text-neutral-800 dark:text-neutral-100 font-extrabold"
              : "border-neutral-200 dark:border-neutral-800 focus:border-brand focus:ring-2 focus:ring-brand/15 text-neutral-800 dark:text-neutral-100"
          }`}
          aria-label={`Digit ${idx + 1} of OTP`}
        />
      ))}
    </div>
  );
};
