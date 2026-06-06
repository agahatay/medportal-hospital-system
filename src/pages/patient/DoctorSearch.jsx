import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService, departmentService } from '../../api/dataService';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import { Search } from 'lucide-react';

const DoctorSearch = () => {
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const initData = async () => {
            try {
                const depts = await departmentService.getAllDepartments();
                setDepartments(depts);

                const docs = await doctorService.getAllDoctors();
                setDoctors(docs);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    useEffect(() => {
        const loadByDept = async () => {
            try {
                // If selectedDept is empty, we might want to fetch all or just filter client side if we have all.
                // Current implementation fetches from backend based on filter if provided.
                const docs = await doctorService.getAllDoctors(selectedDept);
                setDoctors(docs);
            } catch (err) { console.error(err); }
        };
        if (selectedDept) {
            loadByDept();
        } else {
            // Reload all if filter cleared (or rely on initial load if we don't want to re-fetch)
            // Ideally we initially fetched all. If we filter client-side for search term, we should probably distinct data fetching from filtering.
            // But let's stick to the pattern:
            const reloadAll = async () => {
                const docs = await doctorService.getAllDoctors();
                setDoctors(docs);
            };
            if (!loading) reloadAll();
        }
    }, [selectedDept]);

    const filteredDoctors = doctors.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialization && doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div>Loading doctors...</div>;

    return (
        <div>
            <div className="card" style={{ marginBottom: '2rem', padding: '2rem', background: '#4F46E5', color: 'white' }}>
                <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Find Your Doctor</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Name or Specialization"
                            style={{ paddingLeft: '2.5rem', margin: 0, height: '100%' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="input"
                        style={{ margin: 0, height: '100%' }}
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                    >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
                        ))}
                    </select>
                    <Button style={{ background: 'white', color: '#4F46E5', fontWeight: 600 }}>Search</Button>
                </div>
            </div>

            <h2 style={{ marginBottom: '1.5rem' }}>Available Doctors</h2>

            <div className="grid-cols-3">
                {filteredDoctors.map(doctor => (
                    <Card key={doctor.doctor_id} className="hover-card">
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1rem' }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#E0E7FF', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#4F46E5' }}>
                                {(doctor.image) ? <img src={doctor.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : doctor.name.charAt(0)}
                            </div>
                            <h3 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>{doctor.name}</h3>
                            <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 500 }}>{doctor.specialization}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {doctor.bio || 'Experienced specialist dedicated to patient care.'}
                        </p>
                        <Button
                            style={{ width: '100%' }}
                            onClick={() => navigate(`/patient/book/${doctor.doctor_id}`)}
                        >
                            Book Appointment
                        </Button>
                    </Card>
                ))}
            </div>
            {filteredDoctors.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No doctors found matching your criteria.
                </div>
            )}
        </div>
    );
};

export default DoctorSearch;
