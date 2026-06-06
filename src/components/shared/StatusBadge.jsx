const StatusBadge = ({ status }) => {
    // Map status to variant
    const getVariant = (s) => {
        switch (s?.toLowerCase()) {
            case 'completed':
            case 'confirmed':
                return 'success';
            case 'pending':
            case 'upcoming':
                return 'info';
            case 'cancelled':
            case 'rejected':
                return 'danger';
            case 'warning':
                return 'warning';
            default:
                return 'info';
        }
    };

    const variant = getVariant(status);

    return (
        <span className={`badge badge-${variant}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
