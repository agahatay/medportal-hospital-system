const Input = ({
    label,
    error,
    id,
    className = '',
    ...props
}) => {
    return (
        <div className={`input-group ${className}`} style={{ marginBottom: '1rem' }}>
            {label && (
                <label
                    htmlFor={id}
                    style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-main)' }}
                >
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`input ${error ? 'is-invalid' : ''}`}
                style={{ borderColor: error ? 'var(--danger)' : undefined }}
                {...props}
            />
            {error && (
                <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--danger)' }}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;
