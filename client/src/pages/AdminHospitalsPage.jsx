import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import { hospitalAPI } from '../services/api';

const initialForm = { name: '', address: '', phone: '', email: '', departments: '' };

const AdminHospitalsPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    const { data } = await hospitalAPI.list();
    setHospitals(data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (event) => {
    event.preventDefault();
    await hospitalAPI.create({
      ...form,
      departments: form.departments.split(',').map((d) => d.trim()).filter(Boolean)
    });
    setForm(initialForm);
    load();
  };

  return (
    <AppShell title="Manage Hospitals">
      <form onSubmit={create} className="grid gap-2 rounded-2xl bg-white p-4 shadow-card md:grid-cols-5">
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Hospital name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} required />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        <input className="rounded border border-teal-200 px-2 py-1" placeholder="Departments (comma separated)" value={form.departments} onChange={(e) => setForm((p) => ({ ...p, departments: e.target.value }))} />
        <button className="rounded bg-primary px-3 py-1 text-white md:col-span-5">Add Hospital</button>
      </form>
      <div className="mt-4 space-y-2">
        {hospitals.map((hospital) => (
          <div key={hospital._id} className="rounded-xl bg-white p-3 shadow-card">
            <p className="font-semibold">{hospital.name}</p>
            <p className="text-sm text-teal-700">{hospital.address}</p>
          </div>
        ))}
      </div>
    </AppShell>
  );
};

export default AdminHospitalsPage;
