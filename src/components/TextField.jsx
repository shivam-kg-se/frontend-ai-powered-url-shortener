import PropTypes from "prop-types";

const TextField = ({
    label,
    id,
    type,
    errors,
    register,
    required,
    message,
    className,
    min,
    placeholder,
    autoComplete,
  }) => {
    return (
      <div className="field-group">
        <label
          htmlFor={id}
          className={`${className ? className : ""} field-label`}
        >
          {label}
        </label>
  
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(errors[id]?.message)}
          aria-describedby={errors[id]?.message ? `${id}-error` : undefined}
          className={`${
            className ? className : ""
          } field-input`}
          {...register(id, {
            required: { value: required, message },
            minLength: min
              ? { value: min, message: "Minimum 6 character is required" }
              : null,
  
            pattern:
              type === "email"
                ? {
                    value: /^[a-zA-Z0-9]+@(?:[a-zA-Z0-9]+\.)+com+$/,
                    message: "Invalid email",
                  }
                : type === "url"
                ? {
                    value:
                      /^(https?:\/\/)?(([a-zA-Z0-9\u00a1-\uffff-]+\.)+[a-zA-Z\u00a1-\uffff]{2,})(:\d{2,5})?(\/[^\s]*)?$/,
                    message: "Please enter a valid url",
                  }
                : null,
          })}
        />
  
        {errors[id]?.message && (
          <p id={`${id}-error`} className="field-error">
            {errors[id]?.message}*
          </p>
        )}
      </div>
    );
  };
  
  TextField.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    errors: PropTypes.object.isRequired,
    register: PropTypes.func.isRequired,
    required: PropTypes.bool,
    message: PropTypes.string,
    className: PropTypes.string,
    min: PropTypes.number,
    placeholder: PropTypes.string,
    autoComplete: PropTypes.string,
  };

  export default TextField;