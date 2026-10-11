// Small round control, fixed to the corner. Hidden only if the song can't be loaded.
export default function MusicController({ status, onToggle }) {
  if (status === 'unavailable') return null;
  const playing = status === 'playing';
  return (
    <button
      type="button"
      className={`music ${playing ? 'is-playing' : ''}`}
      onClick={onToggle}
      aria-pressed={playing}
      aria-label={playing ? 'Pause music' : 'Play music'}
      title={playing ? 'Pause music' : 'Play music'}
    >
      {playing ? (
        <span className="music__bars" aria-hidden="true"><i /><i /><i /><i /></span>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18.2V6.4l10-2.2v11.6" />
          <circle cx="6.6" cy="18.2" r="2.4" />
          <circle cx="16.6" cy="15.8" r="2.4" />
        </svg>
      )}
    </button>
  );
}
