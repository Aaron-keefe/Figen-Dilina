import gsap from 'gsap';

// Time-based sequences that play once when a frame is reached (on top of the
// frame's own enter transition). They never block swiping: leaving mid-way
// jumps the sequence to its end, and later visits show the finished state.

const calendar = {
  // Initial state, set once when the frames are built.
  prepare(scene, reduced) {
    const q = gsap.utils.selector(scene);
    if (reduced) {
      gsap.set(q('.cal__circle path'), { strokeDashoffset: 0 }); // calendar shown already marked
      return;
    }
    gsap.set(q('.cal'), { autoAlpha: 0 });
    gsap.set(q('.cal__circle path'), { strokeDashoffset: 1 });
    gsap.set(q('.date__weekday, .date__long'), { autoAlpha: 0 });
    gsap.set(q('.date .rule'), { scaleX: 0 });
  },

  // The guest marks the date: the calendar appears, a gold pen circles the 7,
  // and once it's marked the full date appears beneath the calendar.
  build(scene) {
    const q = gsap.utils.selector(scene);
    // Paced to breathe: about 6 seconds, with a pause on the circled date.
    const tl = gsap.timeline();
    tl.fromTo(q('.cal'), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: 'power2.out' })
      .to(q('.cal__circle path'), { strokeDashoffset: 0, duration: 1.7, ease: 'power1.inOut' }, '+=0.7')
      .addLabel('reveal', '+=0.8')
      .fromTo(q('.date__weekday'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 'reveal')
      .fromTo(q('.date__long'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: 'power2.out' }, 'reveal+=0.35')
      .fromTo(q('.date .rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 'reveal+=1.0');
    return tl;
  },
};

const registry = { calendar };

export function prepareSequence(scene, reduced) {
  registry[scene.dataset.sequence]?.prepare(scene, reduced);
}

// Plays the frame's sequence the first time it's reached.
export function playSequence(scene) {
  const seq = registry[scene.dataset.sequence];
  if (!seq || scene.__sequence) return;
  scene.__sequence = seq.build(scene);
}

// Leaving the frame: finish instantly so a return visit shows the final state.
export function finishSequence(scene) {
  scene.__sequence?.progress(1);
}
