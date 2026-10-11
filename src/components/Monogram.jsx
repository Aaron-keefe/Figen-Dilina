import logo from '../assets/logo/logo.webp';
import { invitation } from '../config.js';

// The FE monogram with its botanical sprig (src/assets/logo/logo.webp).
export default function Monogram({ className = '' }) {
  const { left, right } = invitation.monogram;
  return <img className={`monogram ${className}`} src={logo} alt={`${left} ${right} monogram`} width="640" height="744" decoding="async" />;
}
