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
    return <AppShell title="Doctor Profile">Loading...</AppShell>;
  }

  return (
    <AppShell title={`Dr. ${doctor.userId?.name}`}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-5 shadow-card">
          <p className="text-sm text-teal-600">Specialization</p>
          <p className="text-lg font-semibold">{doctor.specialization}</p>
          <p className="mt-2 text-sm">Hospital Name: {doctor.hospitalName || doctor.hospitals?.[0]?.hospitalId?.name || 'N/A'}</p>
          <p className="text-sm">Location: {doctor.location || doctor.hospitals?.[0]?.hospitalId?.address || 'N/A'}</p>
          <p className="text-sm">Doctor Contact Number: {doctor.doctorContactNumber || doctor.userId?.phone || 'N/A'}</p>
          <p className="mt-2 text-sm">Qualifications: {doctor.qualifications || 'N/A'}</p>
          <p className="text-sm">Experience: {doctor.experience || 0} years</p>
        </div>
        <BookingWidget doctor={doctor} hospitals={(doctor.hospitals || []).map((h) => h.hospitalId).filter(Boolean)} />
      </div>
    </AppShell>
  );
};

export default PatientDoctorProfilePage;
