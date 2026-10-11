// Small vertical progress dots on the right edge; tapping one jumps to that frame.
export default function FrameDots({ index, count, onSelect }) {
  return (
    <nav className="dots" aria-label="Invitation pages">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          className={`dots__dot ${i === index ? 'is-active' : ''}`}
          aria-label={`Page ${i + 1} of ${count}`}
          aria-current={i === index ? 'step' : undefined}
          onClick={() => onSelect(i)}
        />
      ))}
    </nav>
  );
}
