import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppShell from '../components/common/AppShell';
import BookingWidget from '../components/patient/BookingWidget';
import { doctorAPI } from '../services/api';

const PatientDoctorProfilePage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    doctorAPI.detail(id).then(({ data }) => setDoctor(data));
  }, [id]);

  if (!doctor) {
    return (
      <AppShell title="Doctor Profile">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-teal-100 bg-white p-6 shadow-card">
            <div className="mb-5 flex items-center gap-4">
              <div className="h-20 w-20 animate-pulse rounded-full bg-teal-100" />
              <div className="space-y-2">
                <div className="h-6 w-56 animate-pulse rounded bg-teal-100" />
                <div className="h-4 w-32 animate-pulse rounded bg-teal-100" />
              </div>
            </div>
            <div className="grid gap-2 rounded-xl border border-teal-100 bg-teal-50/40 p-4 md:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-4 animate-pulse rounded bg-teal-100" />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-card">
            <div className="h-6 w-44 animate-pulse rounded bg-teal-100" />
            <div className="mt-4 h-4 w-full animate-pulse rounded bg-teal-100" />
            <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-teal-100" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-teal-100" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Dr. ${doctor.userId?.name}`}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-teal-100 bg-white p-6 shadow-card">
          <div className="mb-5 flex items-center gap-4">
            {doctor.userId?.profilePhoto ? (
              <img
                src={doctor.userId.profilePhoto}
                alt={`Dr. ${doctor.userId?.name || 'Doctor'}`}
                className="h-20 w-20 rounded-full border border-teal-200 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-2xl font-semibold text-teal-700">
                {(doctor.userId?.name || 'D').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-2xl font-semibold text-ink">Dr. {doctor.userId?.name}</p>
              <p className="text-sm text-teal-700">{doctor.specialization}</p>
            </div>
          </div>
          <div className="grid gap-2 rounded-xl border border-teal-100 bg-teal-50/40 p-4 text-sm md:grid-cols-2">
            <p><span className="font-medium text-teal-900">Hospital:</span> {doctor.hospitalName || doctor.hospitals?.[0]?.hospitalId?.name || 'N/A'}</p>
            <p><span className="font-medium text-teal-900">Location:</span> {doctor.location || doctor.hospitals?.[0]?.hospitalId?.address || 'N/A'}</p>
            <p><span className="font-medium text-teal-900">Contact:</span> {doctor.doctorContactNumber || doctor.userId?.phone || 'N/A'}</p>
            <p><span className="font-medium text-teal-900">Appointment Price:</span> NPR {Number(doctor.appointmentPrice ?? 500).toLocaleString()}</p>
            <p><span className="font-medium text-teal-900">Qualifications:</span> {doctor.qualifications || 'N/A'}</p>
            <p><span className="font-medium text-teal-900">NMC Number:</span> {doctor.nmcNumber || 'N/A'}</p>
            <p><span className="font-medium text-teal-900">Experience:</span> {doctor.experience || 0} years</p>
          </div>
        </div>
        <BookingWidget doctor={doctor} hospitals={(doctor.hospitals || []).map((h) => h.hospitalId).filter(Boolean)} />
      </div>
    </AppShell>
  );
};

export default PatientDoctorProfilePage;
