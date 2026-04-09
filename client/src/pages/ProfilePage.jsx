import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import useAuth from '../hooks/useAuth';
import { hospitalAPI } from '../services/api';

const ProfilePage = () => {
  const { user, roleProfile, refreshUser, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    profilePhoto: '',
    dateOfBirth: '',
    gender: '',
    medicalHistory: '',
    specialization: '',
    hospitalId: '',
    doctorContactNumber: '',
    qualifications: '',
    experience: 0,
    appointmentPrice: 500,
    isAvailableToday: true
  });
  const [hospitals, setHospitals] = useState([]);
  const selectedHospital = hospitals.find((hospital) => hospital._id === form.hospitalId);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    hospitalAPI
      .list()
      .then(({ data }) => setHospitals(data || []))
      .catch(() => setHospitals([]));
  }, []);

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      profilePhoto: user.profilePhoto || '',
      dateOfBirth: roleProfile?.dateOfBirth ? String(roleProfile.dateOfBirth).slice(0, 10) : '',
      gender: roleProfile?.gender || '',
      medicalHistory: roleProfile?.medicalHistory || '',
      specialization: roleProfile?.specialization || '',
      hospitalId: roleProfile?.hospitals?.[0]?.hospitalId?._id || roleProfile?.hospitals?.[0]?.hospitalId || '',
      doctorContactNumber: roleProfile?.doctorContactNumber || user.phone || '',
      qualifications: roleProfile?.qualifications || '',
      experience: roleProfile?.experience || 0,
      appointmentPrice: roleProfile?.appointmentPrice ?? 500,
      isAvailableToday: roleProfile?.isAvailableToday ?? true
    }));
  }, [user, roleProfile]);

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const compressImageToDataUrl = async (file) => {
    const inputDataUrl = await fileToDataUrl(file);
    const image = await loadImage(inputDataUrl);

    const maxSide = 512;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const onImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage('Optimizing image...');

    try {
      const optimizedDataUrl = await compressImageToDataUrl(file);
      setForm((prev) => ({ ...prev, profilePhoto: optimizedDataUrl }));
      setMessage('Image optimized and ready to save.');
    } catch {
      setMessage('Could not process image. Try another file.');
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('Saving profile...');

    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        profilePhoto: form.profilePhoto,
        password: form.password || undefined
      };

      if (user.role === 'patient') {
        payload.dateOfBirth = form.dateOfBirth || null;
        payload.gender = form.gender || null;
        payload.medicalHistory = form.medicalHistory || '';
      }

      if (user.role === 'doctor') {
        payload.specialization = form.specialization;
        payload.hospitalId = form.hospitalId;
        payload.doctorContactNumber = form.doctorContactNumber;
        payload.qualifications = form.qualifications;
        payload.experience = Number(form.experience || 0);
        payload.appointmentPrice = Math.max(0, Number(form.appointmentPrice || 0));
        payload.isAvailableToday = Boolean(form.isAvailableToday);
      }

      await updateProfile(payload);
      setForm((prev) => ({ ...prev, password: '' }));
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="My Profile">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {form.profilePhoto ? (
            <img src={form.profilePhoto} alt="Profile preview" className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 text-2xl font-bold text-teal-700">
              {(form.name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-teal-700">Profile Picture</label>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onImageChange} className="mt-1 block text-sm" />
            <p className="text-xs text-gray-500">Stored in MongoDB as Base64 data URL for persistence across restarts/deployments.</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input className="rounded-lg border border-teal-200 px-3 py-2" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" required />
          <input className="rounded-lg border border-teal-200 px-3 py-2" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" required />
          <input className="rounded-lg border border-teal-200 px-3 py-2" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" />
          <input className="rounded-lg border border-teal-200 px-3 py-2" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="New password (optional)" />
        </div>

        {user?.role === 'patient' ? (
          <div className="grid gap-3 md:grid-cols-3">
            <input className="rounded-lg border border-teal-200 px-3 py-2" type="date" value={form.dateOfBirth} onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))} />
            <select className="rounded-lg border border-teal-200 px-3 py-2" value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input className="rounded-lg border border-teal-200 px-3 py-2 md:col-span-1" value={form.medicalHistory} onChange={(e) => setForm((prev) => ({ ...prev, medicalHistory: e.target.value }))} placeholder="Medical history" />
          </div>
        ) : null}

        {user?.role === 'doctor' ? (
          <div className="grid gap-3 md:grid-cols-2">
            <input className="rounded-lg border border-teal-200 px-3 py-2" value={form.specialization} onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))} placeholder="Specialization" />
            <select className="rounded-lg border border-teal-200 px-3 py-2" value={form.hospitalId} onChange={(e) => setForm((prev) => ({ ...prev, hospitalId: e.target.value }))}>
              <option value="">Select registered hospital</option>
              {hospitals.map((hospital) => (
                <option key={hospital._id} value={hospital._id}>
                  {hospital.name}
                </option>
              ))}
            </select>
            <input className="rounded-lg border border-teal-200 px-3 py-2" value={selectedHospital?.address || ''} placeholder="Location" disabled />
            <input className="rounded-lg border border-teal-200 px-3 py-2" value={form.doctorContactNumber} onChange={(e) => setForm((prev) => ({ ...prev, doctorContactNumber: e.target.value }))} placeholder="Doctor contact number" />
            <input className="rounded-lg border border-teal-200 px-3 py-2" value={form.qualifications} onChange={(e) => setForm((prev) => ({ ...prev, qualifications: e.target.value }))} placeholder="Qualifications" />
            <input className="rounded-lg border border-teal-200 px-3 py-2" type="number" min="0" value={form.experience} onChange={(e) => setForm((prev) => ({ ...prev, experience: e.target.value }))} placeholder="Experience" />
            <input className="rounded-lg border border-teal-200 px-3 py-2" type="number" min="0" value={form.appointmentPrice} onChange={(e) => setForm((prev) => ({ ...prev, appointmentPrice: e.target.value }))} placeholder="Appointment price (NPR)" />
            <label className="flex items-center gap-2 rounded-lg border border-teal-200 px-3 py-2 text-sm">
              <input type="checkbox" checked={Boolean(form.isAvailableToday)} onChange={(e) => setForm((prev) => ({ ...prev, isAvailableToday: e.target.checked }))} />
              Available today
            </label>
          </div>
        ) : null}

        <button disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        <p className="text-sm text-teal-700">{message}</p>
      </form>
    </AppShell>
  );
};

export default ProfilePage;
