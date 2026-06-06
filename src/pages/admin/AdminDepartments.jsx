import { useState, useEffect } from 'react';
import { departmentService } from '../../api/dataService';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import { Trash2, Plus } from 'lucide-react';

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newDept, setNewDept] = useState('');

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const data = await departmentService.getAllDepartments();
                setDepartments(data);
            } catch (err) {
                setError('Failed to fetch departments');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDepts();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newDept.trim()) return;
        try {
            await departmentService.createDepartment(newDept.trim());
            setNewDept('');
            const data = await departmentService.getAllDepartments();
            setDepartments(data);
        } catch (err) {
            alert(err.message || 'Failed to add department');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this department?')) return;
        try {
            await departmentService.deleteDepartment(id);
            setDepartments(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            alert(err.message || 'Failed to delete department');
        }
    };

    if (loading) return <div>Loading departments...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Manage Departments</h1>

            <Card title="Add New Department" style={{ marginBottom: '2rem' }}>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            id="deptName"
                            label="Department Name"
                            placeholder="e.g. Oncology"
                            value={newDept}
                            onChange={(e) => setNewDept(e.target.value)}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                    <Button type="submit">
                        <Plus size={20} /> Add
                    </Button>
                </form>
            </Card>

            <Card title="Existing Departments">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {departments.map(dept => (
                        <div
                            key={dept.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem',
                                background: '#F9FAFB',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-light)'
                            }}
                        >
                            <div>
                                <span style={{ fontWeight: 500, display: 'block' }}>{dept.name}</span>
                                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>{dept.description}</span>
                            </div>
                            <Button
                                variant="danger"
                                style={{ padding: '0.25rem' }}
                                onClick={() => handleDelete(dept.id)}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default AdminDepartments;
