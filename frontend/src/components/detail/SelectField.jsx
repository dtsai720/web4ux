
const SelectField = ({
  id,
  label,
  icon,
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "form-select form-select-sm",
  style = { minWidth: '120px' }
}) => {
  return (
    <div className="d-flex align-items-center">
      <label htmlFor={id} className="form-label me-2 mb-0 fw-bold">
        {icon && <i className={`${icon} me-1`}></i>}
        {label}:
      </label>
      <select
        id={id}
        className={className}
        style={style}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && !value && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
