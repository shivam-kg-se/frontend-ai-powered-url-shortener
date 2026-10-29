import { useRef } from "react";
import PropTypes from "prop-types";

const OTP_LENGTH = 6;

const OtpInput = ({ value, onChange, disabled = false, autoFocus = false, idPrefix }) => {
  const inputRefs = useRef([]);
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] || "");

  const focusAt = (index) => {
    inputRefs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus();
  };

  const handleChange = (index, inputValue) => {
    const enteredDigits = inputValue.replace(/\D/g, "");
    if (!enteredDigits) {
      const next = [...digits];
      next[index] = "";
      onChange(next.join(""));
      return;
    }

    const next = [...digits];
    enteredDigits.slice(0, OTP_LENGTH - index).split("").forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    const joined = next.join("").slice(0, OTP_LENGTH);
    onChange(joined);
    focusAt(Math.min(index + enteredDigits.length, OTP_LENGTH - 1));
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusAt(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (event) => {
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pastedDigits) return;
    event.preventDefault();
    onChange(pastedDigits);
    focusAt(Math.min(pastedDigits.length - 1, OTP_LENGTH - 1));
  };

  return (
    <div className="otp-control" role="group" aria-label="Six-digit verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => { inputRefs.current[index] = element; }}
          aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && index === 0}
          className="otp-digit field-input"
          disabled={disabled}
          id={`${idPrefix}-${index + 1}`}
          inputMode="numeric"
          maxLength={OTP_LENGTH}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          pattern="[0-9]*"
          type="text"
          value={digit}
        />
      ))}
    </div>
  );
};

OtpInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
  idPrefix: PropTypes.string.isRequired,
};

export default OtpInput;
