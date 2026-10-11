import { useCallback, useEffect, useRef, useState } from 'react';
import { invitation } from './config.js';

// Mobile browsers (iPhone Safari especially) often won't play a large
// data: URL, which is how the single-file build embeds the song. Turning it
// into a Blob URL makes it a normal, playable file.
function toPlayableUrl(src) {
  if (!src.startsWith('data:')) return src;
  const [head, b64] = src.split(',');
  const mime = head.slice(5).split(';')[0] || 'audio/mpeg';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

// One <audio> element for the whole visit, so changing frames never restarts
// the song. status: 'loading' | 'ready' | 'playing' | 'paused' | 'unavailable'
export default function useBackgroundMusic() {
  const audioRef = useRef(null);
  const fadeRef = useRef(0);
  const wantsPlay = useRef(false);
  const resumeOnShow = useRef(false);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const { src } = invitation.music;
    if (!src) { setStatus('unavailable'); return; }

    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    audioRef.current = audio;
    let objectUrl = '';
    try {
      objectUrl = toPlayableUrl(src);
      audio.src = objectUrl;
    } catch {
      audio.src = src;
    }

    const onError = () => {
      console.info('[music] Audio could not be loaded — music control hidden.');
      setStatus('unavailable');
    };
    const onReady = () => setStatus((s) => (s === 'loading' ? 'ready' : s));
    const onPlay = () => setStatus('playing');
    const onPause = () => setStatus((s) => (s === 'unavailable' ? s : 'paused'));
    audio.addEventListener('error', onError);
    audio.addEventListener('loadedmetadata', onReady);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    // If the first attempt was blocked, try again on the guest's next touch.
    const retry = () => {
      if (wantsPlay.current && audio.paused && !audio.error) audio.play().catch(() => {});
    };
    window.addEventListener('touchend', retry, { passive: true });
    window.addEventListener('click', retry);

    // Pause while the guest switches apps (e.g. back to WhatsApp), resume on return.
    const onVisibility = () => {
      if (document.hidden) {
        resumeOnShow.current = !audio.paused;
        audio.pause();
      } else if (resumeOnShow.current) {
        audio.play().catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('touchend', retry);
      window.removeEventListener('click', retry);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('loadedmetadata', onReady);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.error) return;
    wantsPlay.current = true;
    const target = invitation.music.volume;
    // play() must be called synchronously inside the guest's tap.
    const p = audio.play();
    // Gentle fade-in where volume is adjustable (iPhones ignore volume and play at full).
    audio.volume = 0;
    p.then(() => {
      cancelAnimationFrame(fadeRef.current);
      const start = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - start) / 1800);
        audio.volume = target * k;
        if (k < 1) fadeRef.current = requestAnimationFrame(step);
      };
      fadeRef.current = requestAnimationFrame(step);
    }).catch((err) => {
      console.info('[music] Playback blocked; will retry on next touch:', err?.name);
      audio.volume = target;
      setStatus(audio.error ? 'unavailable' : 'paused');
    });
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) play();
    else { wantsPlay.current = false; audio.pause(); }
  }, [play]);

  return { status, play, toggle };
}
