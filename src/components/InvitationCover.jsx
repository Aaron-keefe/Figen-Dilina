import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { invitation } from '../config.js';
import { dateParts } from '../date.js';
import { prefersReducedMotion } from '../useFrames.js';
import WaxSeal from './WaxSeal.jsx';

// Full-screen envelope back. The wax seal is the button: pressing it sinks
// the seal slightly, then the whole envelope dissolves into the first frame.
export default function InvitationCover({ onOpenStart, onOpened }) {
  const [opening, setOpening] = useState(false);
  const root = useRef(null);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    onOpened();
  };

  const open = () => {
    if (opening) return;
    setOpening(true);
    onOpenStart(); // inside the tap, so the browser allows music to start

    if (prefersReducedMotion()) {
      gsap.to(root.current, { autoAlpha: 0, duration: 0.4, onComplete: finish });
      return;
    }
    const q = gsap.utils.selector(root);
    gsap.timeline({ onComplete: finish })
      .to(q('.cover__seal'), { scale: 0.92, duration: 0.14, ease: 'power2.in' })
      .to(q('.cover__seal'), { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.6)' })
      .to(q('.cover__hint, .cover__kicker, .cover__foot'), { autoAlpha: 0, duration: 0.3 }, 0.1)
      .to(q('.cover__glow'), { scale: 3.2, autoAlpha: 0, duration: 1.4, ease: 'power2.out' }, 0.14)
      .to(root.current, { autoAlpha: 0, scale: 1.05, duration: 1.3, ease: 'power2.inOut' }, 0.55);
  };

  useEffect(() => {
    if (!opening) return;
    const t = setTimeout(finish, 4000); // never leave a guest stuck on the cover
    return () => clearTimeout(t);
  }, [opening]);

  return (
    <div ref={root} className="cover" role="dialog" aria-modal="true" aria-label="Engagement invitation">
      <svg className="cover__flap" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path className="cover__flap-fill" d="M0 0 H100 V20 L50 46 L0 20 Z" />
        <path className="cover__flap-edge" d="M0 20 L50 46 L100 20" />
        <path className="cover__fold" d="M0 100 L50 58 L100 100" />
      </svg>

      <p className="cover__kicker">{invitation.cover.kicker}</p>

      <button type="button" className="cover__button" onClick={open} disabled={opening} aria-label="Open the invitation">
        <span className="cover__glow" aria-hidden="true" />
        <WaxSeal className="cover__seal" />
      </button>
      <p className="cover__hint" aria-hidden="true">{invitation.cover.openLabel}</p>

      <p className="cover__foot">
        {invitation.couple.short.groom} <span>&amp;</span> {invitation.couple.short.bride}
        <br />
        <small>{dateParts.day} · {dateParts.month} · {dateParts.year}</small>
      </p>
    </div>
  );
}
