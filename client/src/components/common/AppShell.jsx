import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from './Logo';
import CopyrightBar from './CopyrightBar';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';

const navByRole = {
  patient: [
    { to: '/patient/dashboard', label: 'Dashboard' },
    { to: '/patient/doctors', label: 'Doctors' },
    { to: '/patient/appointments', label: 'Appointments' },
    { to: '/patient/notifications', label: 'Notifications' }
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard' },
    { to: '/doctor/queue', label: 'Queue' },
    { to: '/doctor/schedule', label: 'Schedule' },
    { to: '/doctor/patients', label: 'Patients' },
    { to: '/doctor/earnings', label: 'Earnings' }
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/doctors', label: 'Doctors' },
    { to: '/admin/hospitals', label: 'Hospitals' },
    { to: '/admin/appointments', label: 'Appointments' },
    { to: '/admin/queues', label: 'Queues' },
    { to: '/admin/reports', label: 'Reports' }
  ]
};

const AppShell = ({ children, title }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const homePath =
    user?.role === 'patient'
      ? '/patient/dashboard'
      : user?.role === 'doctor'
        ? '/doctor/dashboard'
        : user?.role === 'admin'
          ? '/admin/dashboard'
          : '/';

  const links = navByRole[user?.role] || [];
  const notificationPath = user?.role === 'patient' ? '/patient/notifications' : null;

  const confirmLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-20 border-b border-teal-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to={homePath} className="flex items-center gap-2 font-semibold text-ink">
            <Logo className="h-9 w-9" />
            <span>AarogyaLink</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {user?.profilePhoto ? (
              <Link to="/profile" title="My Account" className="group relative block">
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  className="h-9 w-9 rounded-full border border-teal-200 object-cover"
                />
                <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                  My Account
                </span>
              </Link>
            ) : (
              <Link to="/profile" title="My Account" className="group relative block">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 font-semibold text-teal-700">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="pointer-events-none absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                  My Account
                </span>
              </Link>
            )}
            <span className="hidden text-teal-700 md:block">{user?.name}</span>
            {notificationPath ? (
              <Link to={notificationPath} className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">
                Alerts {unreadCount > 0 ? `(${unreadCount})` : ''}
              </Link>
            ) : (
              <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">
                Alerts {unreadCount > 0 ? `(${unreadCount})` : ''}
              </span>
            )}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="rounded-lg bg-primary px-3 py-1.5 font-medium text-white hover:bg-teal-700"
            >
              Logout
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 text-sm">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 ${isActive ? 'bg-primary text-white' : 'bg-white text-teal-700 hover:bg-teal-50'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {title ? <h1 className="mb-4 text-2xl font-semibold text-ink">{title}</h1> : null}
        {children}
      </main>
      <CopyrightBar />

      {showLogoutConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-semibold text-ink">Confirm Logout</h2>
            <p className="mt-2 text-sm text-teal-900/80">
              Are you sure you want to logout from AarogyaLink?
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-lg border border-teal-200 px-4 py-2 text-sm text-teal-700 hover:bg-teal-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AppShell;
