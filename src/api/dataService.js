import client from './client';

export const authService = {
    changePassword: (currentPassword, newPassword) =>
        client.patch('/auth/change-password', { currentPassword, newPassword }),
};

export const doctorService = {
    getAllDoctors: async (departmentId) => {
        let url = '/doctors';
        if (departmentId) url += `?department_id=${departmentId}`;
        return await client.get(url);
    },

    getDoctorById: async (id) => {
        const doctors = await client.get('/doctors');
        return doctors.find(d => d.id === parseInt(id));
    },

    getMyProfile: async () => {
        return await client.get('/doctors/me');
    },

    createDoctor: async (doctorData) => {
        return await client.post('/doctors', doctorData);
    },

    deleteDoctor: async (id) => {
        return await client.delete(`/doctors/${id}`);
    },

    // Doctor schedules (weekly working hours)
    getSchedules: async (doctorId) => {
        return await client.get(`/doctors/${doctorId}/schedules`);
    },

    createSchedule: async (doctorId, scheduleData) => {
        return await client.post(`/doctors/${doctorId}/schedules`, scheduleData);
    },

    deleteSchedule: async (doctorId, scheduleId) => {
        return await client.delete(`/doctors/${doctorId}/schedules/${scheduleId}`);
    },

    // Available time slots for a doctor on a given date
    getAvailableSlots: async (doctorId, date) => {
        return await client.get(`/doctors/${doctorId}/available-slots?date=${date}`);
    },

    updateMyProfile: (data) => client.put('/doctors/me', data),
};

export const departmentService = {
    getAllDepartments: async () => {
        return await client.get('/departments');
    },

    createDepartment: async (name, description) => {
        return await client.post('/departments', { name, description });
    },

    deleteDepartment: async (id) => {
        return await client.delete(`/departments/${id}`);
    }
};

export const appointmentService = {
    getAppointments: async () => {
        return await client.get('/appointments');
    },

    getMyAppointments: async () => {
        return await client.get('/appointments');
    },

    getDoctorAppointments: async () => {
        return await client.get('/appointments');
    },

    bookAppointment: async (appointmentData) => {
        return await client.post('/appointments', appointmentData);
    },

    updateStatus: async (id, status) => {
        return await client.patch(`/appointments/${id}/status`, { status });
    },

    cancelAppointment: async (id) => {
        return await client.patch(`/appointments/${id}/cancel`, {});
    },

    getAllAppointments: async () => {
        return await client.get('/appointments');
    }
};

export const adminService = {
    getStats: async () => {
        return await client.get('/admin/stats');
    },

    // Doctor CRUD
    getDoctors: async (departmentId) => {
        let url = '/admin/doctors';
        if (departmentId) url += `?department_id=${departmentId}`;
        return await client.get(url);
    },

    createDoctor: async (data) => {
        return await client.post('/admin/doctors', data);
    },

    updateDoctor: async (id, data) => {
        return await client.put(`/admin/doctors/${id}`, data);
    },

    deleteDoctor: async (id) => {
        return await client.delete(`/admin/doctors/${id}`);
    },

    // Doctor Schedules
    getSchedules: async (doctorId) => {
        return await client.get(`/admin/doctors/${doctorId}/schedules`);
    },

    createSchedule: async (doctorId, scheduleData) => {
        return await client.post(`/admin/doctors/${doctorId}/schedules`, scheduleData);
    },

    deleteSchedule: async (doctorId, scheduleId) => {
        return await client.delete(`/admin/doctors/${doctorId}/schedules/${scheduleId}`);
    },
};

export const patientBillingService = {
    getMyBills: ()        => client.get('/billing/my-bills'),
    payBill:    (billId)  => client.patch(`/billing/${billId}/pay`),
};

export const adminBillingService = {
    getAllBills:       (params = {}) => {
        const qs = new URLSearchParams(
            Object.fromEntries(Object.entries(params).filter(([, v]) => v))
        ).toString();
        return client.get('/admin/billing' + (qs ? `?${qs}` : ''));
    },
    updateBillStatus: (billId, status) => client.patch(`/admin/billing/${billId}/status`, { status }),
};

export const patientDashboardService = {
    getProfile:             ()     => client.get('/patient/profile'),
    updateProfile:          (data) => client.put('/patient/profile', data),
    getDoctors:             (departmentId) => client.get(departmentId ? `/patient/doctors?department_id=${departmentId}` : '/patient/doctors'),
    getDoctorById:          (doctorId)     => client.get(`/patient/doctors/${doctorId}`),
    getAvailableSlots:      (doctorId, date) => client.get(`/doctors/${doctorId}/available-slots?date=${date}`),
    getMedicalRecords:      () => client.get('/patient/medical-records'),
    getPrescriptions:       () => client.get('/patient/prescriptions'),
    getMedications:         () => client.get('/patient/medications'),
    getRadiologicalResults: () => client.get('/patient/radiological-results'),
};

export const doctorDashboardService = {
    getDashboard:          () => client.get('/doctor/dashboard'),
    getMedicalRecords:     () => client.get('/doctor/medical-records'),
    getPrescriptions:      () => client.get('/doctor/prescriptions'),
    getMedications:        () => client.get('/doctor/medications'),
    getBilling:            () => client.get('/doctor/billing'),
    getRadiologicalResults:() => client.get('/doctor/radiological-results'),
};
