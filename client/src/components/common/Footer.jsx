import { Link } from 'react-router-dom';
import Logo from './Logo';
import CopyrightBar from './CopyrightBar';

const Footer = () => {
  return (
    <footer className="border-t border-teal-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <p className="text-lg font-semibold text-ink">AarogyaLink</p>
          </div>
          <p className="mt-3 text-sm text-teal-900/80">
            Centralized appointment scheduling and live queue management for hospitals, doctors, and patients.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Quick Links</p>
          <ul className="mt-3 space-y-2 text-sm text-teal-900/80">
            <li><Link to="/" className="hover:text-primary">Home</Link></li>
            <li><Link to="/login" className="hover:text-primary">Login</Link></li>
            <li><Link to="/register" className="hover:text-primary">Register</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-teal-900/80">
            <li><Link to="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Support</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-teal-900/80">
            <li>Kathmandu, Nepal</li>
            <li><a href="mailto:support@aarogyalink.com" className="hover:text-primary">support@aarogyalink.com</a></li>
            <li><a href="tel:+9779800000000" className="hover:text-primary">+977-9800000000</a></li>
          </ul>
        </div>
      </div>

      <CopyrightBar />
    </footer>
  );
};

export default Footer;
