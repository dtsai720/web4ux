
const ModeButton = ({
  icon,
  label,
  isActive,
  variant = 'outline-primary',
  activeVariant,
  onClick,
  customStyles = {},
  hoverStyles = {}
}) => {
  const baseClass = `btn ${isActive ? (activeVariant || variant) : `btn-${variant}`}`;

  const handleMouseEvents = (e, isEnter) => {
    if (!hoverStyles.backgroundColor) return;

    if (isEnter) {
      Object.assign(e.target.style, hoverStyles);
      const icon = e.target.querySelector('i');
      if (icon && hoverStyles.color) icon.style.color = hoverStyles.color;
    } else {
      e.target.style.backgroundColor = 'transparent';
      e.target.style.borderColor = customStyles.borderColor || '';
      e.target.style.color = customStyles.color || '';
      const icon = e.target.querySelector('i');
      if (icon && customStyles.color) icon.style.color = customStyles.color;
    }
  };

  return (
    <button
      className={baseClass}
      onClick={onClick}
      style={customStyles}
      onMouseEnter={(e) => handleMouseEvents(e, true)}
      onMouseLeave={(e) => handleMouseEvents(e, false)}
    >
      <i className={icon} style={customStyles.color ? { color: customStyles.color } : {}}></i> {label}
    </button>
  );
};

export default ModeButton;
