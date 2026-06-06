const Button = ({
    children,
    variant = 'primary', 
    type = 'button',
    className = '',
    disabled = false,
    onClick,
    ...props
}) => {
    return (
        <button
            type={type}
            className={`btn btn-${variant} ${className}`}
            disabled={disabled}
            onClick={onClick}
            style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
