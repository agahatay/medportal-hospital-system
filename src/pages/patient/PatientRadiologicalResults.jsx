import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { patientDashboardService } from '../../api/dataService';
import { generateRadiologyPdf } from '../../utils/pdfHelpers';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/shared/Card';
import { resolveRadiologyImage } from '../../assets/radiology/radiologyImageMap';

const RadiologyImage = ({ imageUrl, imageType, bodyPart }) => {
    const [failed, setFailed] = useState(false);

    if (!imageUrl || failed) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: '#475569' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span style={{ fontSize: '0.78rem' }}>No image available</span>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={`${imageType} — ${bodyPart}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', opacity: 0.92 }}
            onError={() => setFailed(true)}
        />
    );
};

const imageTypeBadge = (type) => {
    const colors = {
        'X-Ray':                { bg: '#EFF6FF', color: '#1D4ED8' },
        'MRI':                  { bg: '#F0FDF4', color: '#166534' },
        'CT Scan':              { bg: '#FFF7ED', color: '#C2410C' },
        'Ultrasound':           { bg: '#FDF4FF', color: '#7E22CE' },
        'ECG':                  { bg: '#FFF1F2', color: '#BE123C' },
        'Echocardiography':     { bg: '#ECFDF5', color: '#065F46' },
        'Coronary Angiography': { bg: '#FEF2F2', color: '#991B1B' },
    };
    const style = colors[type] || { bg: '#F3F4F6', color: '#374151' };
    return (
        <span style={{
            padding: '0.2rem 0.6rem',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 600,
            background: style.bg,
            color: style.color,
            whiteSpace: 'nowrap'
        }}>
            {type || '—'}
        </span>
    );
};

const PatientRadiologicalResults = () => {
    const { user } = useAuth();
    const [results, setResults]     = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [selected, setSelected]   = useState(null);
    const [downloading, setDownloading] = useState(new Set());
    const [dlErrors,    setDlErrors]    = useState({});

    useEffect(() => {
        patientDashboardService.getRadiologicalResults()
            .then(data => setResults(
                data.map(r => ({ ...r, image_url: resolveRadiologyImage(r) ?? r.image_url }))
            ))
            .catch(() => setError('Failed to load radiological results.'))
            .finally(() => setLoading(false));
    }, []);

    const handleDownload = async (e, r) => {
        e.stopPropagation();
        if (downloading.has(r.result_id)) return;
        setDownloading(prev => new Set([...prev, r.result_id]));
        setDlErrors(prev => { const next = { ...prev }; delete next[r.result_id]; return next; });
        try {
            await generateRadiologyPdf(r, {
                patientName: user?.name || user?.email || 'Patient',
                doctorName:  r.doctor_name || '-',
            });
        } catch (err) {
            console.error('PDF generation failed:', err);
            setDlErrors(prev => ({ ...prev, [r.result_id]: true }));
            setTimeout(() => setDlErrors(prev => {
                const next = { ...prev };
                delete next[r.result_id];
                return next;
            }), 3000);
        } finally {
            setDownloading(prev => {
                const next = new Set(prev);
                next.delete(r.result_id);
                return next;
            });
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading radiological results...</div>;
    if (error)   return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>My Radiological Results</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    Your imaging studies and radiology findings.
                </p>
            </div>

            {results.length === 0 ? (
                <Card>
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                        No radiological results found.
                    </div>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                    {results.map(r => (
                        <div
                            key={r.result_id}
                            onClick={() => setSelected(selected?.result_id === r.result_id ? null : r)}
                            style={{
                                background: 'white',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: selected?.result_id === r.result_id
                                    ? '0 0 0 2px var(--primary), 0 4px 12px rgba(0,0,0,0.1)'
                                    : '0 1px 3px rgba(0,0,0,0.07)',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'box-shadow 0.2s'
                            }}
                        >
                            <div style={{ position: 'relative', background: '#0F172A', height: 160, overflow: 'hidden' }}>
                                <RadiologyImage imageUrl={r.image_url} imageType={r.image_type} bodyPart={r.body_part}/>
                                <div style={{ position: 'absolute', top: 8, left: 8 }}>
                                    {imageTypeBadge(r.image_type)}
                                </div>
                            </div>

                            <div style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{r.doctor_name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {r.result_date ? new Date(r.result_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 500, color: '#374151' }}>{r.body_part}</span>
                                    {' · '}
                                    {new Date(r.appointment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>

                                <div style={{
                                    fontSize: '0.875rem',
                                    color: '#4B5563',
                                    lineHeight: 1.55,
                                    ...(selected?.result_id === r.result_id
                                        ? {}
                                        : { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' })
                                }}>
                                    {r.findings || 'No findings recorded.'}
                                </div>

                                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>
                                        {selected?.result_id === r.result_id ? '▲ Show less' : '▼ Show more'}
                                    </span>
                                    <button
                                        onClick={e => handleDownload(e, r)}
                                        disabled={downloading.has(r.result_id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                                            padding: '0.3rem 0.65rem',
                                            background: dlErrors[r.result_id] ? '#FEF2F2' : downloading.has(r.result_id) ? '#F1F5F9' : '#EFF6FF',
                                            color: dlErrors[r.result_id] ? '#DC2626' : downloading.has(r.result_id) ? '#94A3B8' : '#2563EB',
                                            border: '1px solid',
                                            borderColor: dlErrors[r.result_id] ? '#FECACA' : downloading.has(r.result_id) ? '#CBD5E1' : '#BFDBFE',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.78rem',
                                            fontWeight: 500,
                                            cursor: downloading.has(r.result_id) ? 'default' : 'pointer',
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        <Download size={12}/>
                                        {dlErrors[r.result_id] ? 'Failed' : downloading.has(r.result_id) ? 'Generating…' : 'Download PDF'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientRadiologicalResults;
