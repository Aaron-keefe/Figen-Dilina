import { useRef, useState } from 'react';
import useBackgroundMusic from './useBackgroundMusic.js';
import useFrames from './useFrames.js';
import InvitationCover from './components/InvitationCover.jsx';
import MusicController from './components/MusicController.jsx';
import FrameDots from './components/FrameDots.jsx';
import {
  HeroScene, DateScene, FamiliesScene, CoupleScene, CeremonyScene, ReceptionScene, ClosingScene,
} from './components/Scenes.jsx';

export default function App() {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const music = useBackgroundMusic();
  const main = useRef(null);
  const frames = useFrames(main, opened);

  const onOpenStart = () => {
    setOpening(true);
    music.play(); // inside the tap, so the browser allows sound
    frames.intro();
  };

  return (
    <div className="app">
      {!opened && <InvitationCover onOpenStart={onOpenStart} onOpened={() => setOpened(true)} />}

      <main ref={main} className="scenes" aria-hidden={!opening} inert={opening ? undefined : ''}>
        <HeroScene />
        <DateScene />
        <FamiliesScene />
        <CoupleScene />
        <CeremonyScene />
        <ReceptionScene />
        <ClosingScene />
      </main>

      {opened && <FrameDots index={frames.index} count={frames.count} onSelect={frames.go} />}
      {opened && <MusicController status={music.status} onToggle={music.toggle} />}
    </div>
  );
}
