import { useState, useEffect } from "react";
import {
  Play,
  RotateCcw,
  Coins,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
  Music,
  ArrowLeft,
  User,
  Lock,
  Flag,
  Trophy,
  Zap,
} from "lucide-react";
import { useGameStore, engineState, getLevelDifficulty } from "../store/gameStore";
import { AudioEngine } from "../lib/audioEngine";

export function getLevelThemeName(level: number) {
  const themeIndex = (level - 1) % 4;
  switch (themeIndex) {
    case 0: return "Haunted Ghost Yard (भूतिया मैदान) 👻";
    case 1: return "Lush Forest Park (सुंदर हरा पार्क) 🌳";
    case 2: return "Desert Sunset Oasis (रेगिस्तान और सूर्योदय) 🏜️";
    case 3: return "Snowy Ice Tundra (बर्फ़ीली पहाड़ियां) ❄️";
    default: return "City Subway";
  }
}

function CharacterCard({
  id,
  name,
  color,
  cost,
  power,
}: {
  id: string;
  name: string;
  color: string;
  cost: number;
  power: string;
}) {
  const unlocked = useGameStore((s) => s.unlockedCharacters.includes(id));
  const selected = useGameStore((s) => s.selectedCharacter === id);
  const unlock = useGameStore((s) => s.unlockCharacter);
  const select = useGameStore((s) => s.selectCharacter);

  return (
    <button
      onClick={() => {
        if (unlocked) select(id);
        else unlock(id, cost);
      }}
      className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group
                ${
                  selected
                    ? "border-orange-400 bg-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                    : unlocked
                      ? "border-white/20 bg-black/40 hover:bg-white/10"
                      : "border-white/5 bg-black/80 opacity-80 hover:opacity-100"
                }
            `}
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} mb-2 flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform`}
      >
        <User className="text-white" size={24} />
      </div>
      <p className="font-bold text-xs tracking-wider uppercase mb-0.5">{name}</p>
      <p className="text-[10px] text-zinc-300 font-semibold mb-2">{power}</p>

      {selected && (
        <div className="text-[10px] text-orange-300 font-bold bg-orange-500/20 px-2 py-0.5 rounded-full uppercase">
          Selected
        </div>
      )}
      {unlocked && !selected && (
        <div className="text-[10px] text-white/50 font-bold bg-white/10 px-2 py-0.5 rounded-full uppercase">
          Select
        </div>
      )}
      {!unlocked && (
        <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-bold bg-yellow-500/20 px-2 py-0.5 rounded-full">
          <Lock size={8} /> {cost}
        </div>
      )}
    </button>
  );
}

function GameplayHUD() {
  const score = useGameStore((s) => s.score);
  const coins = useGameStore((s) => s.coins);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const dailyChallenge = useGameStore((s) => s.dailyChallenge);
  const selectedCharacter = useGameStore((s) => s.selectedCharacter);

  // Check the active character's unique name and perk to display on the HUD
  let perkText = "";
  let perkColor = "from-zinc-400 to-zinc-500";
  if (selectedCharacter === "gold") {
    perkText = "Midas Boost: 2x Coins";
    perkColor = "from-amber-400 to-yellow-400";
  } else if (selectedCharacter === "phantom_star") {
    perkText = "Astro Accel: 1.5x Score";
    perkColor = "from-fuchsia-400 to-purple-400";
  } else if (selectedCharacter === "magnet") {
    perkText = "Magno: Emerald Drift";
    perkColor = "from-green-400 to-emerald-500";
  } else if (selectedCharacter === "airplane") {
    perkText = "Jet Glide: Auto Magnet";
    perkColor = "from-cyan-400 to-sky-400";
  } else if (selectedCharacter === "hopper") {
    perkText = "Spring Boots: High Jump";
    perkColor = "from-lime-400 to-green-500";
  } else if (selectedCharacter === "shoe") {
    perkText = "Sneakerboy: Bounce";
    perkColor = "from-purple-400 to-fuchsia-500";
  }

  // Calculate live countdown for active magnet powerup
  const timeLeftMs = Math.max(0, engineState.magnetActiveUntil - Date.now());
  const magnetActive = timeLeftMs > 0;
  const magnetTimeLeftSeconds = (timeLeftMs / 1000).toFixed(1);

  // Powerups timers
  const timeLeftHoverboardMs = Math.max(0, engineState.hoverboardActiveUntil - Date.now());
  const hoverboardActive = timeLeftHoverboardMs > 0;
  const hoverboardTimeLeftSeconds = (timeLeftHoverboardMs / 1000).toFixed(1);

  const timeLeftSneakersMs = Math.max(0, engineState.sneakersActiveUntil - Date.now());
  const sneakersActive = timeLeftSneakersMs > 0;
  const sneakersTimeLeftSeconds = (timeLeftSneakersMs / 1000).toFixed(1);

  const jetpackActive = false;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between font-sans tracking-tight z-10 w-full h-full p-4">
      {/* Top Bar Wrapper - Clean Single Line Unified HUD */}
      <div className="w-full flex items-center justify-between gap-2.5 bg-slate-900/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] pointer-events-auto">
        
        {/* Left Side: Distance Section */}
        <div className="flex items-center gap-2">
          {/* Trophy Cylinder */}
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center border border-white/15 shadow-[0_2px_8px_rgba(16,185,129,0.3)] shrink-0">
            <Trophy size={14} className="text-white drop-shadow animate-pulse" />
          </div>
          
          <div className="leading-none">
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mb-0.5 block">
              Distance
            </span>
            <p className="text-sm md:text-base font-extrabold tracking-tight tabular-nums text-white">
              {Math.floor(score).toLocaleString()}<span className="text-[10px] font-bold text-emerald-400 ml-0.5">m</span>
            </p>
          </div>


        </div>

        {/* Middle Side: Quest & Powerups aligned horizontally */}
        <div className="hidden md:flex items-center gap-2">
          {/* Daily Quest Representation */}
          {!dailyChallenge.completed ? (
            <div className="backdrop-blur-sm bg-white/5 border border-white/5 px-2 py-1 rounded-lg flex items-center gap-1.5 shrink-0">
              <span className="text-xs">🎯</span>
              <p className="text-[8px] font-black tracking-wider text-cyan-300 uppercase leading-none">
                Quest: {dailyChallenge.progress}/{dailyChallenge.target}
              </p>
            </div>
          ) : (
            <div className="backdrop-blur-sm bg-emerald-950/40 border border-emerald-500/20 px-2 py-1 rounded-lg flex items-center gap-1.5 shrink-0 animate-pulse">
              <span className="text-emerald-400 text-[10px] font-bold">✓</span>
              <p className="text-[8px] font-black tracking-wider text-emerald-200 uppercase leading-none">
                Completed!
              </p>
            </div>
          )}

          {/* Active Perk Badges */}
          {perkText && (
            <div className="backdrop-blur-sm bg-white/5 border border-white/5 px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center shrink-0">
                <Zap size={6} className="text-amber-950 font-black fill-amber-950" />
              </div>
              <span className={`text-[8px] font-black tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r ${perkColor}`}>
                {perkText}
              </span>
            </div>
          )}

          {/* Dynamic powerups */}
          {magnetActive && (
            <div className="backdrop-blur-xl bg-rose-950/70 border border-red-500/30 px-2 py-1 rounded-lg flex items-center gap-1 text-left shrink-0 animate-bounce">
              <span className="text-xs">🧲</span>
              <span className="text-[8px] font-black text-rose-300 uppercase tracking-wider">
                {magnetTimeLeftSeconds}s
              </span>
            </div>
          )}

          {hoverboardActive && (
            <div className="backdrop-blur-xl bg-sky-950/70 border border-sky-400/30 px-2 py-1 rounded-lg flex items-center gap-1 text-left shrink-0 animate-pulse">
              <span className="text-xs">🏂</span>
              <span className="text-[8px] font-black text-sky-200 uppercase tracking-wider">
                Shield {hoverboardTimeLeftSeconds}s
              </span>
            </div>
          )}

          {sneakersActive && (
            <div className="backdrop-blur-xl bg-purple-950/70 border border-purple-400/30 px-2 py-1 rounded-lg flex items-center gap-1 text-left shrink-0 animate-pulse">
              <span className="text-xs">👟</span>
              <span className="text-[8px] font-black text-purple-200 uppercase tracking-wider">
                Shoes {sneakersTimeLeftSeconds}s
              </span>
            </div>
          )}

          {/* Jetpack HUD disabled */}
        </div>

        {/* Right Side: Coins & Multiplier and Pause controls */}
        <div className="flex items-center gap-2.5">
          {/* Small Device Powerup Overlays */}
          <div className="flex md:hidden items-center gap-1">
            {magnetActive && <span className="text-xs animate-bounce">🧲</span>}
            {hoverboardActive && <span className="text-xs animate-pulse">🏂</span>}
            {sneakersActive && <span className="text-xs animate-bounce">👟</span>}
            {perkText && <span className="text-[10.5px]">⚡</span>}
          </div>

          {/* Coins obtained Card */}
          <div className="flex items-center gap-2">
            <div className="leading-none text-right">
              <span className="text-[8px] font-bold text-yellow-400 uppercase tracking-widest mb-0.5 block">
                Coins
              </span>
              <p className="text-sm md:text-base font-extrabold tracking-tight tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400 drop-shadow-sm">
                {coins.toLocaleString()}
              </p>
            </div>
            {/* Spinning Coin Icon */}
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg flex items-center justify-center border border-white/15 shadow-[0_2px_8px_rgba(245,158,11,0.3)] shrink-0 animate-[spin_8s_linear_infinite]">
              <Coins size={14} className="text-yellow-950 stroke-[2.5]" />
            </div>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-white/10 shrink-0"></div>

          {/* Sleek Landscape PAUSE BUTTON */}
          <button
            onClick={() => useGameStore.getState().setStatus("paused")}
            className="w-8 h-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg flex items-center justify-center shadow-lg hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all cursor-pointer group shrink-0"
          >
            <div className="flex gap-1">
              <div className="w-0.5 h-3 bg-white rounded-sm group-hover:bg-amber-400 transition-colors"></div>
              <div className="w-0.5 h-3 bg-white rounded-sm group-hover:bg-amber-400 transition-colors"></div>
            </div>
          </button>
        </div>

      </div>

      {/* Bottom overlay: Hoverboard summoning trigger key & touch pad */}
      <div className="w-full py-2 flex items-center justify-between pointer-events-auto">
        {/* Summon Hoverboard Button on Left (extremely intuitive layout) */}
        <button
          onClick={() => {
            const activated = useGameStore.getState().useHoverboard();
            if (activated && useGameStore.getState().soundEnabled) {
              AudioEngine.playMagnetActivate();
            }
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs px-3 py-2 rounded-2xl shadow-[0_8px_25px_rgba(14,165,233,0.4)] border border-sky-450/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="text-sm">🏂</span>
          <div className="text-left font-black tracking-tight leading-none">
            <p className="text-[8px] uppercase font-bold tracking-widest text-sky-200">SUMMON BOARD</p>
            <p className="text-xs">STOCKS: <span className="text-yellow-300 font-black">{useGameStore((s) => s.hoverboards)}</span></p>
          </div>
        </button>

        {/* Small desktop tip on right */}
        <div className="hidden sm:block text-[9px] font-semibold text-zinc-300 uppercase tracking-widest font-mono bg-black/70 px-3 py-1.5 rounded-full border border-white/5">
          Tip: Press <span className="text-amber-400 font-extrabold bg-amber-500/20 px-1.5 py-0.5 rounded">Enter</span> / <span className="text-amber-400 font-extrabold bg-amber-500/20 px-1.5 py-0.5 rounded">Shift</span> to Activate Board!
        </div>
      </div>
    </div>
  );
}

function GameOverMenu({ handleStart }: { handleStart: () => void }) {
  const score = useGameStore((s) => s.score);
  const coins = useGameStore((s) => s.coins);
  const setStatus = useGameStore((s) => s.setStatus);

  return (
    <div className="backdrop-blur-xl bg-red-950/60 p-12 rounded-[2.5rem] border border-red-500/50 shadow-2xl flex flex-col items-center text-white animate-in zoom-in duration-300 min-w-[320px] max-w-sm text-center">
      <h2 className="text-5xl font-black mb-8 text-red-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,0.7)] italic">
        CAUGHT!
      </h2>

      <div className="grid grid-cols-2 gap-4 w-full mb-8">
        <div className="backdrop-blur-md bg-white/10 p-5 rounded-2xl border border-white/20 flex flex-col items-center shadow-xl">
          <div className="text-orange-300 text-xs font-bold mb-2 uppercase tracking-widest font-sans">
            Distance
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {Math.floor(score)}m
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 p-5 rounded-2xl border border-white/20 flex flex-col items-center shadow-xl">
          <div className="text-yellow-300 text-xs font-bold mb-2 uppercase tracking-widest font-sans">
            Coins
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {coins}
          </div>
        </div>
      </div>

      <button
        onClick={handleStart}
        className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-650 to-orange-600 border border-red-400/50 hover:from-red-500 hover:to-orange-500 text-white w-full py-5 rounded-full text-xl font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)] mb-3 cursor-pointer"
      >
        <RotateCcw size={24} />
        TRY AGAIN
      </button>

      <div className="grid grid-cols-2 gap-3 w-full">
        <button
          onClick={() => setStatus("levels")}
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white py-3 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer uppercase"
        >
          SELECT LEVEL
        </button>
        <button
          onClick={() => setStatus("mainMenu")}
          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white py-3 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer uppercase"
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
}



function PauseMenu({ handleStart }: { handleStart: () => void }) {
  const setStatus = useGameStore((s) => s.setStatus);
  return (
    <div className="backdrop-blur-xl bg-slate-900/60 p-12 rounded-[2.5rem] border border-blue-400/50 shadow-2xl flex flex-col items-center text-white animate-in zoom-in duration-300 min-w-[320px] max-w-sm text-center">
      <h2 className="text-4xl font-black mb-8 text-blue-400 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(96,165,250,0.7)] italic">
        PAUSED
      </h2>
      <div className="w-full space-y-4">
        <button
          onClick={() => setStatus("playing")}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 border border-blue-400/50 hover:from-blue-400 hover:to-indigo-400 text-white w-full py-4 rounded-full text-xl font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.3)] cursor-pointer uppercase"
        >
          Resume
        </button>
        <button
          onClick={handleStart}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-yellow-500 border border-yellow-400/50 hover:from-orange-400 hover:to-yellow-400 text-white w-full py-4 rounded-full text-xl font-bold transition-all active:scale-95 shadow-[0_0_15px_rgba(249,115,22,0.3)] cursor-pointer uppercase"
        >
          <RotateCcw size={20} />
          Restart
        </button>
        <button
          onClick={() => setStatus("mainMenu")}
          className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white w-full py-4 rounded-full text-xl font-bold transition-all active:scale-95 cursor-pointer uppercase"
        >
          Home
        </button>
      </div>
    </div>
  );
}

function ProgressionShopMenu() {
  const coins = useGameStore((s) => s.coins);
  const hoverboards = useGameStore((s) => s.hoverboards);
  const setStatus = useGameStore((s) => s.setStatus);

  // Upgrade states
  const magnetUpgradeLevel = useGameStore((s) => s.magnetUpgradeLevel);
  const sneakersUpgradeLevel = useGameStore((s) => s.sneakersUpgradeLevel);
  const upgradeMagnet = useGameStore((s) => s.upgradeMagnet);
  const upgradeSneakers = useGameStore((s) => s.upgradeSneakers);
  const soundEnabled = useGameStore((s) => s.soundEnabled);

  // Mission stats
  const totalRunDistance = useGameStore((s) => s.totalRunDistance);
  const totalCoinsCollected = useGameStore((s) => s.totalCoinsCollected);
  const totalHoverboardsUsed = useGameStore((s) => s.totalHoverboardsUsed);
  const claimedMissions = useGameStore((s) => s.claimedMissions);
  const claimMission = useGameStore((s) => s.claimMission);
  const incCoins = useGameStore((s) => s.incCoins);

  const [activeTab, setActiveTab] = useState<"skins" | "upgrades" | "spin" | "missions">("skins");

  // Spin Wheel states
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinReward, setSpinReward] = useState<string | null>(null);

  const spinSlices = [
    { text: "Jackpot (+500 Coins!) 🌟", award: () => incCoins(500) },
    { text: "+1 Hoverboard 🏂", award: () => useGameStore.setState(s => ({ hoverboards: s.hoverboards + 1 })) },
    { text: "+50 Coins 🪙", award: () => incCoins(50) },
    { text: "+2 Hoverboards 🏂", award: () => useGameStore.setState(s => ({ hoverboards: s.hoverboards + 2 })) },
    { text: "+200 Coins 🪙", award: () => incCoins(200) },
    { text: "+100 Coins 🪙", award: () => incCoins(100) },
  ];

  const handleSpin = () => {
    if (isSpinning || coins < 100) {
      if (soundEnabled && coins < 100) AudioEngine.playGameOver();
      return;
    }

    // Deduct entry fee
    incCoins(-100);
    
    // Choose random sectors (6 slots, 60 degrees each)
    const extraDeg = Math.floor(Math.random() * 360);
    const newRot = rotation + 1800 + extraDeg;
    setRotation(newRot);
    setIsSpinning(true);
    setSpinReward(null);

    if (soundEnabled) AudioEngine.playJump();

    setTimeout(() => {
      // Find sector (pointer is at top 0 degrees)
      const finalAngle = (360 - (newRot % 360)) % 360;
      const sectorIndex = Math.floor(finalAngle / 60) % 6;
      const sector = spinSlices[sectorIndex];
      
      sector.award();
      setSpinReward(sector.text);
      setIsSpinning(false);

      if (soundEnabled) {
        AudioEngine.playCoinCollect();
      }
    }, 3200);
  };

  // Achievements definition
  const RUNNER_MISSIONS = [
    { id: "dist_1", title: "Subway Runner I", desc: "Run 1,000m total", target: 1000, current: Math.floor(totalRunDistance), reward: 200 },
    { id: "dist_2", title: "Subway Runner II", desc: "Run 5,000m total", target: 5000, current: Math.floor(totalRunDistance), reward: 500 },
    { id: "coins_1", title: "Bazaar Tycoon I", desc: "Collect 150 total coins", target: 150, current: totalCoinsCollected, reward: 150 },
    { id: "coins_2", title: "Bazaar Tycoon II", desc: "Collect 1,000 total coins", target: 1000, current: totalCoinsCollected, reward: 400 },
    { id: "boards_1", title: "Shield Master", desc: "Use hoverboard 3 times", target: 3, current: totalHoverboardsUsed, reward: 150 },
  ];

  return (
    <div className="backdrop-blur-xl bg-slate-900/50 p-6 md:p-8 rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col items-center text-white w-full max-w-lg text-center animate-in zoom-in duration-300">
      
      {/* Title & Wallet bar combined */}
      <div className="w-full flex items-center justify-between mb-5">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)] uppercase tracking-tight italic">
          Runner Zone
        </h2>
        
        <div className="backdrop-blur-md bg-yellow-500/10 border border-yellow-500/30 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg">
          <Coins size={14} className="text-yellow-400 animate-pulse" />
          <span className="text-lg font-black text-yellow-300 font-mono tracking-tight">{coins}</span>
        </div>
      </div>

      {/* Modern Horizontal Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 w-full bg-black/40 border border-white/5 p-1 rounded-2xl mb-6">
        {(["skins", "upgrades", "spin", "missions"] as const).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSpinReward(null);
                if (soundEnabled) AudioEngine.playCoinCollect();
              }}
              className={`py-2 text-[10px] md:text-xs font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-md border border-yellow-300/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab === "skins" && "🎭 Skins"}
              {tab === "upgrades" && "⚡ Upgs"}
              {tab === "spin" && "🎡 Spin"}
              {tab === "missions" && "🏆 Misns"}
            </button>
          );
        })}
      </div>

      {/* Main Container with custom tabs content */}
      <div className="w-full min-h-[300px] mb-6 flex flex-col justify-between">
        
        {/* TAB 1: SKINS */}
        {activeTab === "skins" && (
          <div className="w-full flex flex-col">
            <div className="grid grid-cols-2 gap-3 w-full max-h-60 overflow-y-auto pr-1">
              <CharacterCard
                id="default"
                name="Runner"
                color="from-orange-400 to-red-500"
                cost={0}
                power="Classic Speed"
              />
              <CharacterCard
                id="shoe"
                name="Sneakerboy"
                color="from-purple-500 to-fuchsia-400"
                cost={350}
                power="Spring Dash"
              />
              <CharacterCard
                id="blue"
                name="Cyber"
                color="from-blue-400 to-cyan-500"
                cost={200}
                power="Laser Aura"
              />
              <CharacterCard
                id="green"
                name="Toxico"
                color="from-green-400 to-emerald-500"
                cost={400}
                power="Emerald Core"
              />
              <CharacterCard
                id="purple"
                name="Phantom"
                color="from-blue-500 to-indigo-600"
                cost={600}
                power="Gravity Shift"
              />
              <CharacterCard
                id="magnet"
                name="Magno"
                color="from-green-500 to-emerald-700"
                cost={850}
                power="Emerald Drift"
              />
              <CharacterCard
                id="gold"
                name="Midas"
                color="from-amber-400 to-yellow-600"
                cost={1000}
                power="2x Gold Coins"
              />
              <CharacterCard
                id="phantom_star"
                name="Astro"
                color="from-fuchsia-500 to-purple-800"
                cost={1200}
                power="1.5x Score Boost"
              />
              <CharacterCard
                id="airplane"
                name="Aero Jet"
                color="from-sky-400 via-indigo-400 to-red-400"
                cost={1500}
                power="Jet Glide: Auto"
              />
              <CharacterCard
                id="hopper"
                name="Hopper"
                color="from-lime-400 to-green-600"
                cost={900}
                power="High Jump"
              />
            </div>
            
            {/* Purchase hovering boards shield block */}
            <div className="w-full bg-slate-950/40 border border-white/5 rounded-2xl p-3 mt-4 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏂</span>
                <div>
                  <h4 className="font-extrabold text-xs text-sky-200 uppercase leading-none">Hoverboard Stock</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-none">Protective Shield (In stock: {hoverboards})</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const success = useGameStore.getState().buyHoverboard();
                  if (success) {
                    if (soundEnabled) AudioEngine.playCoinCollect();
                  } else {
                    if (soundEnabled) AudioEngine.playGameOver();
                  }
                }}
                className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95 cursor-pointer flex flex-col items-center"
              >
                <span>BUY</span>
                <span className="text-[8px] font-bold text-amber-950 opacity-80 mt-0.5">150 COINS</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: POWERUP UPGRADES */}
        {activeTab === "upgrades" && (
          <div className="w-full flex flex-col gap-4 text-left">
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest leading-none mb-1 font-bold">
              Upgrade power-up durations permanently (परमानेंट बढ़ाएं)
            </p>
            
            {/* Magnet Durability Upgrade Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧲</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-rose-300 uppercase leading-none">Coin Magnet Duration</h4>
                    <p className="text-[9px] text-zinc-400 mt-1">Level {magnetUpgradeLevel}/5 ({8 + (magnetUpgradeLevel-1)*2}s active)</p>
                  </div>
                </div>
                
                {magnetUpgradeLevel < 5 ? (
                  <button
                    onClick={() => {
                      const success = upgradeMagnet();
                      if (success && soundEnabled) AudioEngine.playCoinCollect();
                    }}
                    className="bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-black text-xs px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer leading-none flex flex-col items-center shrink-0"
                  >
                    <span>UPGRADE</span>
                    <span className="text-[8px] mt-0.5 text-yellow-950 font-bold">{(magnetUpgradeLevel + 1) * 200} COINS</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0">MAXED</span>
                )}
              </div>
              {/* Star level visual ticks */}
              <div className="flex gap-1.5 w-full">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i < magnetUpgradeLevel ? "bg-gradient-to-r from-rose-400 to-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-white/10"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Sneakers Bounce Upgrade Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👟</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-purple-300 uppercase leading-none">Super Sneakers Jump</h4>
                    <p className="text-[9px] text-zinc-400 mt-1">Level {sneakersUpgradeLevel}/5 ({15 + (sneakersUpgradeLevel-1)*3}s active)</p>
                  </div>
                </div>
                
                {sneakersUpgradeLevel < 5 ? (
                  <button
                    onClick={() => {
                      const success = upgradeSneakers();
                      if (success && soundEnabled) AudioEngine.playCoinCollect();
                    }}
                    className="bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-black text-xs px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer leading-none flex flex-col items-center shrink-0"
                  >
                    <span>UPGRADE</span>
                    <span className="text-[8px] mt-0.5 text-yellow-950 font-bold">{(sneakersUpgradeLevel + 1) * 200} COINS</span>
                  </button>
                ) : (
                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 rounded-lg shrink-0">MAXED</span>
                )}
              </div>
              {/* Star level visual ticks */}
              <div className="flex gap-1.5 w-full">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i < sneakersUpgradeLevel ? "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-white/10"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: LUCKY SPIN WHEEL */}
        {activeTab === "spin" && (
          <div className="w-full flex flex-col items-center">
            
            {/* Spinning congratulations text box */}
            {spinReward && (
              <div className="w-full py-2 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold mb-4 text-xs tracking-wide animate-bounce leading-tight">
                🎉 BADHAI HO! YOU WON: <br/>
                <span className="text-white text-sm font-black uppercase">{spinReward}</span>
              </div>
            )}

            {/* Spinner Wheel Graphic Centerpiece */}
            <div className="relative w-40 h-40 flex items-center justify-center my-3 bg-slate-950/40 rounded-full border border-white/10 p-2 shadow-2xl">
              
              {/* Central pointer vector */}
              <div className="absolute top-0 left-1/2 -ml-2 -mt-1 w-4 h-4 bg-orange-500 border-x-4 border-x-transparent border-t-8 border-t-white shrink-0 z-30 pointer-events-none filter drop-shadow"></div>
              
              {/* Rotating main drum wheel with sectors */}
              <div 
                className="w-full h-full rounded-full bg-gradient-to-tr from-slate-900 to-slate-950 border-4 border-orange-500/50 relative overflow-hidden flex items-center justify-center"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? "transform 3.2s cubic-bezier(0.15, 0.85, 0.25, 1.02)" : "none",
                }}
              >
                {/* Sector dividers inside */}
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div 
                    key={idx}
                    className="absolute w-0.5 h-1/2 bg-white/20 origin-bottom"
                    style={{
                      transform: `rotate(${idx * 60}deg)`,
                      bottom: "50%"
                    }}
                  />
                ))}

                {/* Slices prize displays mapping around circle */}
                {spinSlices.map((slice, idx) => {
                  const angle = idx * 60 + 30; // offset in center of sector
                  const shortText = slice.text.replace("Jackpot (", "★ ").replace("Hoverboard", "Board").replace("Coins", "C");
                  return (
                    <div 
                      key={idx}
                      className="absolute font-mono text-[7px] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-orange-400 cursor-default select-none pb-12 origin-bottom text-center"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        bottom: "50%",
                        height: "44%"
                      }}
                    >
                      {shortText}
                    </div>
                  );
                })}

                {/* Middle central hub decoration */}
                <div className="absolute w-8 h-8 rounded-full bg-slate-950 border border-white/25 flex items-center justify-center z-10 shadow-lg">
                  <span className="text-xs">🎲</span>
                </div>
              </div>
            </div>

            {/* Spin action buttons */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || coins < 100}
              className={`w-full max-w-[240px] py-3.5 rounded-full text-base font-black transition-all active:scale-95 shadow-md flex flex-col items-center justify-center cursor-pointer ${
                isSpinning
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed border border-white/5 opacity-50 animate-pulse"
                  : coins >= 100
                    ? "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white border border-yellow-300/40 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                    : "bg-red-950/40 text-red-400 cursor-not-allowed border border-red-500/20"
              }`}
            >
              <span>{isSpinning ? "SPINNING... 🎪" : "SPIN FOR 100 COINS 🎡"}</span>
              {!isSpinning && <span className="text-[9px] text-yellow-100 opacity-90 mt-0.5 font-bold uppercase">लकी चांस स्पिनर</span>}
            </button>

          </div>
        )}

        {/* TAB 4: RUNNER MISSIONS */}
        {activeTab === "missions" && (
          <div className="w-full flex flex-col gap-3 text-left">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest leading-none mb-1">
              Accomplishments & Claims (इनाम प्राप्त करें)
            </h3>
            
            <div className="space-y-3 w-full max-h-64 overflow-y-auto pr-1">
              {RUNNER_MISSIONS.map((mission) => {
                const isCompleted = mission.current >= mission.target;
                const isClaimed = claimedMissions.includes(mission.id);
                const progressPercent = Math.min(100, (mission.current / mission.target) * 100);

                return (
                  <div key={mission.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col gap-2 relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-[11px] leading-none text-zinc-100">{mission.title}</h4>
                        <p className="text-[9px] text-zinc-400 mt-1 leading-none">{mission.desc}</p>
                      </div>
                      
                      {/* Interactive claiming triggers */}
                      {isClaimed ? (
                        <span className="text-[9px] font-black uppercase text-zinc-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">CLAIMED (प्राप्तेड)</span>
                      ) : isCompleted ? (
                        <button
                          onClick={() => {
                            claimMission(mission.id, mission.reward);
                            if (soundEnabled) AudioEngine.playCoinCollect();
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-[9px] px-3 py-1.5 rounded-lg border-2 border-emerald-300 transition-all active:scale-95 animate-pulse cursor-pointer shrink-0"
                        >
                          CLAIM {mission.reward} C
                        </button>
                      ) : (
                        <span className="text-[9px] font-bold uppercase text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 shrink-0">
                          {mission.current.toLocaleString()} / {mission.target.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Progress Slider bar inside accomplishment card */}
                    <div className="w-full h-1 bg-black/45 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-orange-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <button
        onClick={() => setStatus("mainMenu")}
        className="flex items-center justify-center gap-3 bg-white/15 hover:bg-white/20 border border-white/20 text-white w-full py-4 rounded-full font-extrabold text-sm transition-all active:scale-95 cursor-pointer uppercase font-mono tracking-widest mt-2 shrink-0 select-none"
      >
        <ArrowLeft size={18} />
        BACK TO MAIN MENU
      </button>

    </div>
  );
}

export function OverlayUI() {
  const status = useGameStore((s) => s.status);
  const playerName = useGameStore((s) => s.playerName);
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const musicEnabled = useGameStore((s) => s.musicEnabled);
  const currentLevel = useGameStore((s) => s.currentLevel);
  const unlockedLevels = useGameStore((s) => s.unlockedLevels);

  // Graphics states & actions
  const [playerNameInput, setPlayerNameInput] = useState("");

  // Actions
  const reset = useGameStore((s) => s.reset);
  const setStatus = useGameStore((s) => s.setStatus);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const toggleSound = useGameStore((s) => s.toggleSound);
  const toggleMusic = useGameStore((s) => s.toggleMusic);
  const setCurrentLevel = useGameStore((s) => s.setCurrentLevel);
  
  useEffect(() => {
    if (musicEnabled && (status === "playing" || status === "paused")) {
      AudioEngine.init();
      AudioEngine.startMusic();
    } else if (!musicEnabled || status === "gameover" || status === "login") {
      AudioEngine.stopMusic();
    }
  }, [musicEnabled, status]);

  // Get score and coins only when we are in a screen that needs them (not playing)
  // To prevent re-rendering during gameplay, we read directly from getState() when
  // rendering gameover or levelComplete, or we just let them be 0 until menu is active
  // Wait, Zustand triggers on any change if we select them. We can use isolated components.

  const handleStart = () => {
    setCurrentLevel(1);
    engineState.nextGateZ = -500;
    engineState.playerZ = 0;
    const diff = getLevelDifficulty(1);
    engineState.speed = diff.startSpeed;
    engineState.maxSpeed = diff.maxSpeed;
    engineState.playerLane = 0;
    engineState.playerY = 0;
    engineState.isSliding = false;
    engineState.introProgress = 0;
    reset(); // Changes status to 'playing'
    if (useGameStore.getState().soundEnabled) {
      AudioEngine.init();
      AudioEngine.playGlassShatter();
    }
    if (useGameStore.getState().musicEnabled) {
      AudioEngine.init();
      AudioEngine.startMusic();
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col items-center justify-center font-sans tracking-tight z-10 w-full h-full">
      {/* Gameplay HUD */}
      {status === "playing" && <GameplayHUD />}

      {/* Menu Overlays */}
      <div className="pointer-events-auto">
        {status === "login" && (
          <div className="backdrop-blur-xl bg-slate-900/50 p-12 rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col items-center text-white min-w-[320px] max-w-sm text-center">
            <div className="bg-gradient-to-br from-orange-400 to-yellow-600 w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/30 border-2 border-white/30">
              <User size={48} className="text-white" />
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 mb-2 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]">
              BAZAAR RUN
            </h1>
            <p className="text-white/60 mb-8 text-sm">
              Enter your name to start running
            </p>

            <div className="w-full mb-6 relative">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="YOUR NAME"
                className="w-full bg-black/40 border border-white/20 rounded-2xl px-6 py-4 text-center text-xl font-bold focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 transition-all placeholder:text-white/20 uppercase"
              />
            </div>

            <button
              disabled={!playerName.trim()}
              onClick={() => {
                AudioEngine.init();
                setStatus("mainMenu");
              }}
              className="bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md border border-white/30 text-white w-full py-5 rounded-full text-xl font-bold hover:bg-white/30 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer"
            >
              CONTINUE
            </button>
          </div>
        )}

        {status === "mainMenu" && (
          <div className="backdrop-blur-xl bg-slate-900/50 p-12 rounded-[2.5rem] border border-white/20 shadow-2xl flex flex-col items-center text-white min-w-[320px] max-w-sm text-center">
            <div className="bg-gradient-to-br from-orange-400 to-yellow-500 w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/30 border-2 border-white/30">
              <Play
                size={48}
                className="text-white translate-x-1"
                fill="currentColor"
              />
            </div>
            <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 mb-2 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] leading-tight">
              SUBWAY RUN
            </h1>
            <p className="text-orange-300/80 mb-8 text-xs font-bold uppercase tracking-widest">
              Speeding City Yards | Runner: {playerName || "Runner"}
            </p>

            <div className="w-full space-y-4">
              <button
                onClick={handleStart}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 border border-yellow-300 text-white w-full py-4 rounded-full text-2xl font-black tracking-wider hover:scale-105 hover:shadow-[0_0_35px_rgba(249,115,22,0.7)] hover:from-orange-400 hover:to-yellow-400 transition-all active:scale-95 shadow-[0_0_25px_rgba(249,115,22,0.45)] cursor-pointer uppercase"
              >
                START RUN
              </button>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setStatus("shop")}
                  className="bg-gradient-to-r from-blue-500/50 to-purple-500/50 backdrop-blur-md border border-purple-300 text-white w-full py-3.5 rounded-full text-sm font-bold hover:from-blue-500/70 hover:to-purple-500/70 transition-all active:scale-95 cursor-pointer uppercase text-center flex items-center justify-center gap-2"
                >
                  <User size={16} /> SKIN SHOP
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setStatus("howToPlay")}
                  className="flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 text-white/80 w-full py-3 rounded-2xl text-xs font-bold hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  <HelpCircle size={16} />
                  HOW TO PLAY
                </button>
                <button
                  onClick={() => setStatus("settings")}
                  className="flex items-center justify-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 text-white/80 w-full py-3 rounded-2xl text-xs font-bold hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  <Settings size={16} />
                  SETTINGS
                </button>
              </div>
            </div>
          </div>
        )}



        {status === "shop" && <ProgressionShopMenu />}

        {status === "howToPlay" && (
          <div className="backdrop-blur-xl bg-slate-900/85 p-6 md:p-8 rounded-[2.5rem] border border-white/25 shadow-2xl flex flex-col items-center text-white w-full max-w-lg text-center/left animate-in fade-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border border-orange-400 flex items-center justify-center mb-4 shrink-0 shadow-lg">
              <HelpCircle size={24} className="text-white" />
            </div>
            
            <h2 className="text-2xl font-black mb-1 text-white uppercase tracking-wider drop-shadow-[0_0_10px_rgba(251,146,60,0.4)]">
              KAISE KHELEIN? / HOW TO PLAY
            </h2>
            <p className="text-[11px] text-zinc-400 uppercase tracking-widest font-bold mb-5">
              Subway Runner Ultimate Survival Guide
            </p>

            <div className="w-full space-y-4">
              {/* Section 1: Controls Grid */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5 leading-none">
                  🎮 Controls (कंट्रोल्स)
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-black/30 border border-white/5 p-2 rounded-xl flex flex-col justify-between">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Move Left / Right</span>
                    <span className="font-extrabold text-white text-[11px] mt-1.5 flex gap-1 items-center flex-wrap">
                      <kbd className="px-1.5 py-0.5 bg-white/15 rounded border border-white/10">A</kbd> / 
                      <kbd className="px-1.5 py-0.5 bg-white/15 rounded border border-white/10">D</kbd> or 
                      <kbd className="px-1 py-0.5 bg-white/15 rounded border border-white/10">←</kbd> / 
                      <kbd className="px-1 py-0.5 bg-white/15 rounded border border-white/10">→</kbd>
                    </span>
                    <span className="text-zinc-500 text-[9px] mt-1">बाईं/दाईं तरफ जाएं</span>
                  </div>

                  <div className="bg-black/30 border border-white/5 p-2 rounded-xl flex flex-col justify-between">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Jump / Glide High</span>
                    <span className="font-extrabold text-white text-[11px] mt-1.5 flex gap-1 items-center flex-wrap">
                      <kbd className="px-1.5 py-0.5 bg-white/15 rounded border border-white/10">W</kbd> or 
                      <kbd className="px-1 py-0.5 bg-white/15 rounded border border-white/10">↑</kbd> or 
                      <span className="px-1.5 py-0.5 bg-white/15 rounded border border-white/10 text-[9px]">Space</span>
                    </span>
                    <span className="text-zinc-500 text-[9px] mt-1">ऊपर की ओर कूदें</span>
                  </div>

                  <div className="bg-black/30 border border-white/5 p-2 rounded-xl flex flex-col justify-between">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Slide / Crawl</span>
                    <span className="font-extrabold text-white text-[11px] mt-1.5 flex gap-1 items-center flex-wrap">
                      <kbd className="px-1.5 py-0.5 bg-white/15 rounded border border-white/10">S</kbd> or 
                      <kbd className="px-1 py-0.5 bg-white/15 rounded border border-white/10">↓</kbd>
                    </span>
                    <span className="text-zinc-500 text-[9px] mt-1">स्लाइड करके नीचे से निकलें</span>
                  </div>

                  <div className="bg-black/30 border border-white/5 p-2 rounded-xl flex flex-col justify-between">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">Summon Board (Shield)</span>
                    <span className="font-extrabold text-white text-[11px] mt-1.5 flex gap-1 items-center flex-wrap">
                      <kbd className="px-1 py-0.5 bg-white/15 rounded border border-white/10">Enter</kbd> / 
                      <kbd className="px-1 py-0.5 bg-white/15 rounded border border-white/10">Shift</kbd>
                    </span>
                    <span className="text-zinc-500 text-[9px] mt-1">होवरबोर्ड शील्ड चालू करें</span>
                  </div>
                </div>

                <div className="mt-3 text-center border-t border-white/10 pt-2.5">
                  <p className="text-[10px] text-orange-200">
                    💡 <span className="font-extrabold">MOBILE TOUCH:</span> Swipe anywhere to change lanes, jump or slide!
                  </p>
                </div>
              </div>

              {/* Section 2: Power-Ups Guide */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 leading-none">
                  ⚡ Ultimate Power-Ups (पावर-अप्स)
                </h3>
                <div className="space-y-2.5 text-[11px]">

                  <div className="flex items-start gap-2.5 bg-black/20 p-2 rounded-xl border border-white/5">
                    <span className="text-xl shrink-0">🏂</span>
                    <div>
                      <h4 className="font-extrabold text-cyan-300 uppercase text-[10px]">Hoverboard Shield (होवरबोर्ड)</h4>
                      <p className="text-zinc-300 leading-tight">Gives crash safety! If you hit an obstacle or train, the board shatters but saves your life!</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-black/20 p-2 rounded-xl border border-white/5">
                    <span className="text-xl shrink-0">👟</span>
                    <div>
                      <h4 className="font-extrabold text-purple-300 uppercase text-[10px]">Super Bouncy Sneakers (स्प्रिंग शूज़)</h4>
                      <p className="text-zinc-300 leading-tight">Spring-loaded jumps that allow leaping directly over giant barriers and subway trains!</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-black/20 p-2 rounded-xl border border-white/5">
                    <span className="text-xl shrink-0">🧲</span>
                    <div>
                      <h4 className="font-extrabold text-rose-300 uppercase text-[10px]">Coin Magnet (चुंबक)</h4>
                      <p className="text-zinc-300 leading-tight">Attracts all subway coins into your pocket automatically without stepping into danagerous tracks!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Level Goal */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left">
                <p className="text-[10px] text-zinc-300 leading-relaxed">
                  🏆 <span className="font-black text-amber-300">GOAL:</span> Subway tracks par run karte hue level distance complete karein to jump to the **next level**. Apne score aur gold coins bachaate hue obstacle aur train crash se bachein!
                </p>
              </div>
            </div>

            <button
              onClick={() => setStatus("mainMenu")}
              className="flex items-center justify-center gap-2 mt-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white w-full py-4 rounded-full font-black text-sm tracking-wider transition-all active:scale-95 shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <ArrowLeft size={18} />
              SAMJH GAYE / BACK TO HOME
            </button>
          </div>
        )}

        {status === "settings" && (
          <div className="backdrop-blur-2xl bg-slate-950/90 p-6 md:p-8 max-w-md rounded-[2.5rem] border border-white/15 shadow-2xl flex flex-col items-center text-white w-full text-center animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto pointer-events-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 border border-orange-400 flex items-center justify-center mb-3 shadow-lg">
              <Settings size={24} className="text-white" />
            </div>
            
            <h2 className="text-xl font-black mb-1 text-white uppercase tracking-wider">
              GAME SETUP
            </h2>
            <p className="text-[9px] text-orange-300 uppercase tracking-widest font-black mb-5">
              Audio and Sound Settings (ध्वनि सेटिंग्स)
            </p>

            <div className="w-full space-y-3.5 mb-6">
                {/* Sound Effects Switcher */}
                <div
                  className={`w-full flex flex-col gap-2 p-4 rounded-2xl border transition-all text-left ${
                    soundEnabled 
                      ? "bg-orange-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.05)]" 
                      : "bg-black/40 border-white/10 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${soundEnabled ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-zinc-500"}`}>
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                      </div>
                      <div>
                        <p className={`font-extrabold text-xs uppercase tracking-wider ${soundEnabled ? "text-orange-200" : "text-zinc-400"}`}>
                          Sound FX (शब्दावली)
                        </p>
                        <p className="text-[8.5px] text-zinc-400 mt-0.5 font-bold leading-tight">Cheer aur coin collect feedback</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={toggleSound}
                      className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer focus:outline-none ${
                        soundEnabled ? "bg-orange-500" : "bg-white/15"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-md ${
                          soundEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></div>
                    </button>
                  </div>
                  
                  {soundEnabled && (
                    <button
                      type="button"
                      onClick={() => {
                        AudioEngine.init();
                        AudioEngine.playCoinCollect();
                      }}
                      className="w-full py-1.5 text-[9px] text-center uppercase tracking-widest font-black font-mono border border-orange-400/25 text-orange-300 hover:bg-orange-500/10 rounded-xl transition-all active:scale-95 cursor-pointer leading-none mt-1"
                    >
                      🔊 Practice Sound Test (चेक करें)
                    </button>
                  )}
                </div>

                {/* Music Switcher */}
                <div
                  className={`w-full flex flex-col gap-2 p-4 rounded-2xl border transition-all text-left ${
                    musicEnabled 
                      ? "bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.05)]" 
                      : "bg-black/40 border-white/10 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${musicEnabled ? "bg-yellow-500/20 text-yellow-500" : "bg-white/5 text-zinc-500"}`}>
                        <Music size={16} />
                      </div>
                      <div>
                        <p className={`font-extrabold text-xs uppercase tracking-wider ${musicEnabled ? "text-yellow-200" : "text-zinc-400"}`}>
                          Background Track (धून)
                        </p>
                        <p className="text-[8.5px] text-zinc-400 mt-0.5 font-bold leading-tight">Aesthetic synth background loop</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={toggleMusic}
                      className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer focus:outline-none ${
                        musicEnabled ? "bg-yellow-500" : "bg-white/15"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-md ${
                          musicEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></div>
                    </button>
                  </div>

                  {musicEnabled && (
                    <button
                      type="button"
                      onClick={() => {
                        AudioEngine.init();
                        AudioEngine.startMusic();
                      }}
                      className="w-full py-1.5 text-[9px] text-center uppercase tracking-widest font-black font-mono border border-yellow-400/25 text-yellow-300 hover:bg-yellow-500/10 rounded-xl transition-all active:scale-95 cursor-pointer leading-none mt-1"
                    >
                      🎵 Start / Force Play Music (संगीत बजाएं)
                    </button>
                  )}
                </div>
              </div>
            <button
              type="button"
              onClick={() => setStatus("mainMenu")}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-white w-full py-3.5 rounded-full font-black text-xs tracking-wider transition-all active:scale-95 shadow-lg shadow-orange-500/20 cursor-pointer uppercase border border-orange-400/20 select-none font-mono"
            >
              <ArrowLeft size={16} />
              Save & Back to Home (लागू करें)
            </button>
          </div>
        )}

        {status === "gameover" && <GameOverMenu handleStart={handleStart} />}

        {status === "paused" && <PauseMenu handleStart={handleStart} />}
      </div>
    </div>
  );
}
