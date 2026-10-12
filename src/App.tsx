/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameCanvas } from './components/GameCanvas';
import { OverlayUI } from './components/OverlayUI';

export default function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#7dd3fc] text-white font-sans">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-200 to-amber-100 pointer-events-none"></div>
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_50%_0%,rgba(253,224,71,0.5),transparent_60%)] pointer-events-none"></div>
      <GameCanvas />
      <OverlayUI />
    </div>
  );
}
