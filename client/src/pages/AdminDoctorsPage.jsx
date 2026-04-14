import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import { doctorAPI, hospitalAPI } from '../services/api';

const initialForm = {
  name: '',
  email: '',
  password: '',
  specialization: '',
  hospitalId: '',
  doctorContactNumber: '',
  nmcNumber: '',
  experience: 0
};
const initialEditForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  specialization: '',
  hospitalId: '',
  doctorContactNumber: '',
  qualifications: '',
  nmcNumber: '',
  experience: 0,
  isAvailableToday: true
};

const AdminDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingDoctorId, setEditingDoctorId] = useState('');
  const [editForm, setEditForm] = useState(initialEditForm);
  const [hospitals, setHospitals] = useState([]);
  const [bulkUpdatingAvailability, setBulkUpdatingAvailability] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await doctorAPI.list();
    setDoctors(data);
  };

  useEffect(() => {
    load();
    hospitalAPI.list().then(({ data }) => {
      setHospitals(data || []);
      setForm((prev) => ({ ...prev, hospitalId: prev.hospitalId || data?.[0]?._id || '' }));
    });
  }, []);

  const create = async (event) => {
    event.preventDefault();
    setMessage('');
    await doctorAPI.create({
      ...form,
      experience: Number(form.experience || 0)
    });
    setForm(initialForm);
    load();
  };

  const remove = async (id) => {
    setMessage('');
    await doctorAPI.remove(id);
    load();
  };

  const setApproval = async (id, status) => {
    setMessage('');
    await doctorAPI.updateApproval(id, { status });
    load();
  };

  const startEdit = (doctor) => {
    setEditingDoctorId(doctor._id);
    setEditForm({
      name: doctor.userId?.name || '',
      email: doctor.userId?.email || '',
      phone: doctor.userId?.phone || '',
      password: '',
      specialization: doctor.specialization || '',
      hospitalId: doctor.hospitals?.[0]?.hospitalId?._id || doctor.hospitals?.[0]?.hospitalId || '',
      doctorContactNumber: doctor.doctorContactNumber || doctor.userId?.phone || '',
      qualifications: doctor.qualifications || '',
      nmcNumber: doctor.nmcNumber || '',
      experience: doctor.experience || 0,
      isAvailableToday: doctor.isAvailableToday ?? true
    });
  };

  const cancelEdit = () => {
    setEditingDoctorId('');
    setEditForm(initialEditForm);
  };

  const saveEdit = async (doctorId) => {
    setMessage('');
    const payload = {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      specialization: editForm.specialization,
      hospitalId: editForm.hospitalId,
      doctorContactNumber: editForm.doctorContactNumber,
      qualifications: editForm.qualifications,
      nmcNumber: editForm.nmcNumber,
      experience: Number(editForm.experience || 0),
      isAvailableToday: Boolean(editForm.isAvailableToday)
    };
    if (editForm.password) payload.password = editForm.password;
    await doctorAPI.update(doctorId, payload);
    cancelEdit();
    load();
  };

  const makeAllAvailableToday = async () => {
    setBulkUpdatingAvailability(true);
    setMessage('');
    try {
      const { data } = await doctorAPI.setAllAvailableToday();
      setMessage(data?.message || 'All doctors marked as available today.');
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to mark doctors available today.');
    } finally {
      setBulkUpdatingAvailability(false);
    }
  };

  return (
    <AppShell title="Manage Doctors">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={makeAllAvailableToday}
          disabled={bulkUpdatingAvailability}
          className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bulkUpdatingAvailability ? 'Updating...' : 'Make All Doctors Available Today'}
        </button>
        {message ? <p className="text-sm text-teal-700">{message}</p> : null}
      </div>
      <form onSubmit={create} className="grid gap-2 rounded-2xl bg-white p-4 shadow-card md:grid-cols-4">
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Specialization" value={form.specialization} onChange={(e) => setForm((p) => ({ ...p, specialization: e.target.value }))} required />
        <select className="rounded border border-teal-200 px-2 py-1" value={form.hospitalId} onChange={(e) => setForm((p) => ({ ...p, hospitalId: e.target.value }))} required>
          <option value="">Select registered hospital</option>
          {hospitals.map((hospital) => (
            <option key={hospital._id} value={hospital._id}>
              {hospital.name}
            </option>
          ))}
        </select>
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Doctor contact number" value={form.doctorContactNumber} onChange={(e) => setForm((p) => ({ ...p, doctorContactNumber: e.target.value }))} />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="NMC number" value={form.nmcNumber} onChange={(e) => setForm((p) => ({ ...p, nmcNumber: e.target.value }))} />
        <input className="rounded border border-teal-200 px-2 py-1" type="number" min="0" placeholder="Experience" value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} />
        <button className="rounded bg-primary px-3 py-1 text-white">Add Doctor</button>
      </form>
      <div className="mt-4 space-y-2">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="rounded-xl bg-white p-3 shadow-card">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p>
                Dr. {doctor.userId?.name} · {doctor.specialization} ·
                <span className={`ml-1 rounded px-2 py-0.5 text-xs ${doctor.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' : doctor.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {doctor.approvalStatus || 'pending'}
                </span>
              </p>
              <div className="flex gap-2">
                {doctor.approvalStatus !== 'approved' ? (
                  <button onClick={() => setApproval(doctor._id, 'approved')} className="rounded border border-green-300 px-2 py-1 text-sm text-green-700">
                    Approve
                  </button>
                ) : null}
                {doctor.approvalStatus !== 'rejected' ? (
                  <button onClick={() => setApproval(doctor._id, 'rejected')} className="rounded border border-amber-300 px-2 py-1 text-sm text-amber-700">
                    Reject
                  </button>
                ) : null}
                <button onClick={() => startEdit(doctor)} className="rounded border border-blue-300 px-2 py-1 text-sm text-blue-700">
                  Edit
                </button>
                <button onClick={() => remove(doctor._id)} className="rounded border border-red-300 px-2 py-1 text-sm text-red-600">Delete</button>
              </div>
            </div>

            {editingDoctorId === doctor._id ? (
              <div className="grid gap-2 md:grid-cols-4">
                <input className="rounded border border-teal-200 px-2 py-1" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
                <input className="rounded border border-teal-200 px-2 py-1" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
                <input className="rounded border border-teal-200 px-2 py-1" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
                <input className="rounded border border-teal-200 px-2 py-1" type="password" value={editForm.password} onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))} placeholder="New password (optional)" />
                <input className="rounded border border-teal-200 px-2 py-1" value={editForm.specialization} onChange={(e) => setEditForm((p) => ({ ...p, specialization: e.target.value }))} placeholder="Specialization" />
                <select className="rounded border border-teal-200 px-2 py-1" value={editForm.hospitalId} onChange={(e) => setEditForm((p) => ({ ...p, hospitalId: e.target.value }))}>
                  <option value="">Select registered hospital</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital._id} value={hospital._id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
                <input className="rounded border border-teal-200 px-2 py-1" value={editForm.doctorContactNumber} onChange={(e) => setEditForm((p) => ({ ...p, doctorContactNumber: e.target.value }))} placeholder="Doctor contact number" />
                <input className="rounded border border-teal-200 px-2 py-1" value={editForm.qualifications} onChange={(e) => setEditForm((p) => ({ ...p, qualifications: e.target.value }))} placeholder="Qualifications" />
                <input className="rounded border border-teal-200 px-2 py-1" value={editForm.nmcNumber} onChange={(e) => setEditForm((p) => ({ ...p, nmcNumber: e.target.value }))} placeholder="NMC number" />
                <input className="rounded border border-teal-200 px-2 py-1" type="number" min="0" value={editForm.experience} onChange={(e) => setEditForm((p) => ({ ...p, experience: e.target.value }))} placeholder="Experience" />
                <label className="flex items-center gap-2 rounded border border-teal-200 px-2 py-1 text-sm">
                  <input type="checkbox" checked={Boolean(editForm.isAvailableToday)} onChange={(e) => setEditForm((p) => ({ ...p, isAvailableToday: e.target.checked }))} />
                  Available today
                </label>
                <div className="md:col-span-4 flex gap-2">
                  <button onClick={() => saveEdit(doctor._id)} className="rounded bg-primary px-3 py-1 text-white">Save Changes</button>
                  <button onClick={cancelEdit} className="rounded border border-gray-300 px-3 py-1 text-gray-700">Cancel</button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </AppShell>
  );
};

export default AdminDoctorsPage;
