import { Fragment } from 'react';
import { invitation } from '../config.js';
import { dateParts, weekday, longDate, calendar } from '../date.js';
import Scene from './Scene.jsx';
import Monogram from './Monogram.jsx';
import Sprig from './Sprig.jsx';

// The invitation as a sequence of full-screen frames. Elements marked
// data-step appear in order as the frame scrolls in; data-from, data-rise,
// data-grow and data-draw choose how (see useFrames.js).

const { couple, intro, families, ceremony, reception, closing, backdrops } = invitation;

export function HeroScene() {
  return (
    <Scene id="hero" label="Invitation" backdrop={backdrops.terrace} exit="mist">
      <div className="hero">
        <div data-step><Monogram className="hero__monogram" /></div>
        <p className="hero__intro" data-step>{intro}</p>
        <h1 className="names">
          <span className="names__line" data-step>{couple.groom}</span>
          <span className="names__and" data-step>{couple.joiner}</span>
          <span className="names__line" data-step>{couple.bride}</span>
        </h1>
      </div>
      <div className="scroll-cue" data-step aria-hidden="true">
        <span className="scroll-cue__label">Swipe up</span>
        <span className="scroll-cue__line" />
      </div>
    </Scene>
  );
}

// A hand-drawn-looking loop: slightly irregular, tilted, and overshooting its
// start like a quick pen stroke. Drawn in a 100×100 box around the day number.
const PEN_CIRCLE = (() => {
  const pts = [];
  const a0 = -2.2, turn = Math.PI * 2 + 0.55;
  for (let k = 0; k <= 48; k++) {
    const t = k / 48, a = a0 + t * turn;
    const r = 1 + 0.045 * Math.sin(3 * a + 0.8) + 0.07 * t; // wobble + slight spiral
    pts.push([50 + 44 * r * Math.cos(a), 52 + 37 * r * Math.sin(a)]);
  }
  return 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L');
})();

export function DateScene() {
  const blanks = Array.from({ length: calendar.firstWeekday });
  const days = Array.from({ length: calendar.daysInMonth }, (_, i) => i + 1);
  return (
    <Scene id="date" label={`${weekday}, ${longDate}`} backdrop={backdrops.lake} enter="mist" exit="paper" sequence="calendar">
      <div className="datestack">
        <div className="cal" aria-hidden="true">
          <span className="cal__paper" />
          <p className="cal__month">{calendar.monthName} <span>{calendar.year}</span></p>
          <div className="cal__grid">
            {calendar.weekdays.map((d, i) => <span key={`w${i}`} className="cal__wd">{d}</span>)}
            {blanks.map((_, i) => <span key={`b${i}`} />)}
            {days.map((n) => (
              n === calendar.day ? (
                <span key={n} className="cal__day cal__day--marked">
                  {n}
                  <svg className="cal__circle" viewBox="0 0 100 100" aria-hidden="true">
                    <path d={PEN_CIRCLE} pathLength="1" />
                  </svg>
                </span>
              ) : <span key={n} className="cal__day">{n}</span>
            ))}
          </div>
        </div>

        <div className="date">
          <p className="eyebrow label date__weekday">{weekday}</p>
          <p className="date__long">{longDate}</p>
          <span className="rule" aria-hidden="true" />
        </div>
      </div>
    </Scene>
  );
}

export function FamiliesScene() {
  return (
    <Scene id="families" label="Families">
      <div className="watermark" aria-hidden="true"><Monogram /></div>
      <div className="families">
        <Sprig className="families__sprig" data-step data-draw />
        {families.map((f, i) => (
          <Fragment key={f.relation}>
            {i > 0 && <span className="families__rule" data-step data-grow aria-hidden="true" />}
            <div className="family" data-step data-from={i === 0 ? 'left' : 'right'}>
              <p className="family__relation">{f.relation}</p>
              <p className="family__parents">{f.parents}</p>
              <p className="family__address">{f.address.map((l) => <span key={l}>{l}</span>)}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </Scene>
  );
}

export function CoupleScene() {
  return (
    <Scene id="couple" label="The couple" exit="light">
      <div className="couple">
        <div className="arch" data-arch>
          <img src={invitation.couplePhoto} alt={`${couple.groom} and ${couple.bride}`} decoding="async" />
        </div>
        <span className="arch__outline" data-step aria-hidden="true" />
        <p className="couple__names" data-step>
          {couple.short.groom} <span className="couple__amp">&amp;</span> {couple.short.bride}
        </p>
        <p className="couple__date" data-step>{dateParts.day} · {dateParts.month} · {dateParts.year}</p>
      </div>
    </Scene>
  );
}

function EventPanel({ event, lead }) {
  return (
    <div className="panel" data-step data-from="below">
      <p className={lead ? 'event__lead' : 'eyebrow label'}>{event.eyebrow}</p>
      <h2 className="event__venue">{event.venue}</h2>
      <p className="event__when">
        <span>{weekday}, {longDate}</span>
        <span className="event__time">at {event.time}</span>
      </p>
      <a className="directions" href={event.mapsUrl} target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-6.5-6.1-6.5-11.2A6.5 6.5 0 0 1 18.5 9.8C18.5 14.9 12 21 12 21Z" />
          <circle cx="12" cy="9.8" r="2.3" />
        </svg>
        Get Directions
        <span className="visually-hidden"> to {event.venue} (opens Google Maps)</span>
      </a>
    </div>
  );
}

export function CeremonyScene() {
  return (
    <Scene id="ceremony" label="Engagement ceremony" backdrop={backdrops.church} enter="light" exit="mist">
      <EventPanel event={ceremony} />
    </Scene>
  );
}

export function ReceptionScene() {
  return (
    <Scene id="reception" label="Reception" backdrop={backdrops.gazebo} enter="mist" exit="dusk">
      <EventPanel event={reception} lead />
    </Scene>
  );
}

export function ClosingScene() {
  return (
    <Scene id="closing" label="Closing" backdrop={backdrops.dusk} enter="dusk" tone="dark">
      <div className="closing">
        <Sprig className="closing__sprig" data-step data-draw />
        <p className="event__lead" data-step>{closing.eyebrow}</p>
        <p className="closing__names" data-step>{closing.names}</p>
        <div className="closing__mark" data-step>
          <Monogram />
          <p className="closing__date">{dateParts.day} · {dateParts.month} · {dateParts.year}</p>
        </div>
      </div>
    </Scene>
  );
}
