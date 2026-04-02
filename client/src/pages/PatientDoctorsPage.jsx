import { useEffect, useState } from 'react';
import AppShell from '../components/common/AppShell';
import DoctorCard from '../components/patient/DoctorCard';
import { doctorAPI } from '../services/api';

const PatientDoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filters, setFilters] = useState({
    doctorName: '',
    hospitalName: '',
    place: '',
    specialty: '',
    availability: ''
  });

  useEffect(() => {
    const load = async () => {
      const params = {
        doctorName: filters.doctorName || undefined,
        hospitalName: filters.hospitalName || undefined,
        place: filters.place || undefined,
        specialty: filters.specialty || undefined,
        availability: filters.availability || undefined
      };
      const { data } = await doctorAPI.list(params);
      setDoctors(data);
    };
    load();
  }, [filters]);

  return (
    <AppShell title="Browse Doctors">
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input
          className="rounded-lg border border-teal-200 px-3 py-2"
          placeholder="Doctor name"
          value={filters.doctorName}
          onChange={(e) => setFilters((p) => ({ ...p, doctorName: e.target.value }))}
        />
        <input
          className="rounded-lg border border-teal-200 px-3 py-2"
          placeholder="Hospital name"
          value={filters.hospitalName}
          onChange={(e) => setFilters((p) => ({ ...p, hospitalName: e.target.value }))}
        />
        <input
          className="rounded-lg border border-teal-200 px-3 py-2"
          placeholder="Place / Location"
          value={filters.place}
          onChange={(e) => setFilters((p) => ({ ...p, place: e.target.value }))}
        />
        <input className="rounded-lg border border-teal-200 px-3 py-2" placeholder="Specialty" value={filters.specialty} onChange={(e) => setFilters((p) => ({ ...p, specialty: e.target.value }))} />
        <select className="rounded-lg border border-teal-200 px-3 py-2" value={filters.availability} onChange={(e) => setFilters((p) => ({ ...p, availability: e.target.value }))}>
          <option value="">Any availability</option>
          <option value="true">Available today</option>
          <option value="false">Not available today</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} />)}
      </div>
      {!doctors.length ? <p className="mt-4 text-sm text-teal-700">No doctors found for selected filters.</p> : null}
    </AppShell>
  );
};

export default PatientDoctorsPage;
