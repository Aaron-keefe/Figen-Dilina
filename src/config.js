// ─────────────────────────────────────────────────────────────
//  All invitation content lives here. Edit this file to change
//  names, dates, venues, map links, music or wording.
//  Wording and spelling follow the printed card.
// ─────────────────────────────────────────────────────────────

// Scene backdrops (portrait). To change one, drop new artwork into
// src/assets/scenes/ and point the matching import at it.
import terrace from './assets/scenes/terrace.webp';
import lake from './assets/scenes/lake.webp';
import couplePhoto from './assets/scenes/couple.webp';
import church from './assets/scenes/church.webp';
import gazebo from './assets/scenes/reception.webp';
import dusk from './assets/scenes/forest.webp';

// Background music: the first .mp3 in src/assets/audio/ (if any). With no file
// there, the site still builds and the music button simply doesn't appear.
const tracks = import.meta.glob('./assets/audio/*.mp3', { eager: true, query: '?url', import: 'default' });
const music = Object.values(tracks)[0] || '';

export const invitation = {
  // Monogram letters (used in labels; the artwork itself is src/assets/logo/logo.webp).
  monogram: { left: 'F', right: 'E' },

  couple: {
    groom: 'Figen Philip',
    bride: 'Elizabeth Dilina Justin',
    joiner: '&',
    // Short names used on the cover and the couple frame.
    short: { groom: 'Figen', bride: 'Dilina' },
  },

  intro:
    'With grateful hearts and the blessings of our families, we invite you to celebrate the engagement of',

  // ISO date (local time in Kerala). Used for the date reveal and weekday.
  date: '2026-11-07',

  families: [
    {
      relation: 'Son of',
      parents: 'P.M. Philip (Late) & Fillimol Philip',
      address: ['Panamparambil House,', 'Ponnurunni, Vyttila'],
    },
    {
      relation: 'Daughter of',
      parents: 'Justin Joseph & Deepa Justin',
      address: ['Kalarikkal House,', 'Hillpalace Meadows,', 'Thripunithura'],
    },
  ],

  ceremony: {
    eyebrow: 'Engagement Ceremony',
    venue: "St. Joseph's Church, Vadakkekota",
    time: '10.30 a.m.',
    mapsUrl: 'https://maps.app.goo.gl/iLv39mEd1UK2tZ8E7',
  },

  reception: {
    eyebrow: 'Followed by a Reception at',
    venue: 'Gazebo Hall, Renai Cochin, Palarivattom',
    time: '12.15 p.m.',
    mapsUrl: 'https://maps.app.goo.gl/SjBkN4WaHrmAkNUj9',
  },

  closing: {
    eyebrow: 'Best compliments from',
    names: 'Ashbin, Fristy and Jefina',
  },

  cover: {
    kicker: 'You are invited',
    openLabel: 'Tap the seal to open',
  },

  backdrops: { terrace, lake, church, gazebo, dusk },

  // The couple's photo, shown inside an arch. Portrait orientation works best.
  couplePhoto,

  music: {
    src: music,
    title: 'golden hour (instrumental) — JVKE',
    volume: 0.55,
  },
};
