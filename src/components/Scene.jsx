import mist from '../assets/scenes/mist.webp';

// One full-screen "frame". useFrames() stacks the frames and plays the
// transition between them when the guest swipes.
//
// enter / exit pick the transition veil shared with the neighbouring frame:
//   'mist'  – painted mist rises over the screen and carries on upward
//   'paper' – fades to/from ivory paper
//   'light' – blooms to/from warm white light
//   'dusk'  – dims to/from a warm dusk
export default function Scene({ id, label, backdrop, enter, exit, sequence, tone = 'light', children }) {
  return (
    <section
      className={`scene scene--${id} scene--${tone}`}
      data-scene={id}
      data-enter={enter || undefined}
      data-exit={exit || undefined}
      data-sequence={sequence || undefined}
      aria-label={label}
    >
      <div className="scene__stage">
        {backdrop && (
          <div className="scene__bg" aria-hidden="true">
            <img src={backdrop} alt="" decoding="async" />
          </div>
        )}
        <div className="scene__scrim" aria-hidden="true" />
        <div className="scene__content">{children}</div>
        {enter && <Veil type={enter} role="enter" />}
        {exit && <Veil type={exit} role="exit" />}
      </div>
    </section>
  );
}

function Veil({ type, role }) {
  return (
    <div className={`veil veil--${type} veil--${role}`} aria-hidden="true">
      {type === 'mist' && <img src={mist} alt="" decoding="async" />}
    </div>
  );
}
