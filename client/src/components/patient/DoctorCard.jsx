import { Link } from 'react-router-dom';

const DoctorCard = ({ doctor }) => {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <p className="text-lg font-semibold text-ink">Dr. {doctor.userId?.name}</p>
      <p className="text-sm text-teal-700">{doctor.specialization}</p>
      <p className="mt-1 text-sm">Hospital: {doctor.hospitalName || doctor.hospitals?.[0]?.hospitalId?.name || 'N/A'}</p>
      <p className="text-sm">Location: {doctor.location || doctor.hospitals?.[0]?.hospitalId?.address || 'N/A'}</p>
      <p className="text-sm">Doctor Contact: {doctor.doctorContactNumber || doctor.userId?.phone || 'N/A'}</p>
      <p className="mt-1 text-sm">Experience: {doctor.experience || 0} years</p>
      <p className="text-sm">Availability: {doctor.isAvailableToday ? 'Available' : 'Not available today'}</p>
      <Link to={`/patient/doctors/${doctor._id}`} className="mt-3 inline-block rounded-lg bg-primary px-3 py-1.5 text-sm text-white">
        View Profile
      </Link>
    </div>
  );
};

export default DoctorCard;
