import logoImage from '../../assets/branding/aarogyalink-logo.png';

const Logo = ({ className = 'h-10 w-10' }) => {
  return <img src={logoImage} alt="AarogyaLink Logo" className={`${className} object-contain`} />;
};

export default Logo;
