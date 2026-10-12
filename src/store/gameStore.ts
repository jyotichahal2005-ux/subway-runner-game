import { create } from "zustand";

interface GameState {
  status:
    | "login"
    | "mainMenu"
    | "levels"
    | "howToPlay"
    | "settings"
    | "playing"
    | "gameover"
    | "levelComplete"
    | "shop"
    | "paused";
  score: number;
  coins: number;
  playerName: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  currentLevel: number;
  unlockedLevels: number;
  selectedCharacter: string;
  unlockedCharacters: string[];
  dailyChallenge: { target: number; progress: number; completed: boolean };
  hoverboards: number;

  // Powerup Upgrades
  magnetUpgradeLevel: number;
  sneakersUpgradeLevel: number;
  upgradeMagnet: () => boolean;
  upgradeSneakers: () => boolean;

  // Stats for Missions / Accomplishments
  totalRunDistance: number;
  totalCoinsCollected: number;
  totalHoverboardsUsed: number;
  claimedMissions: string[];
  claimMission: (id: string, reward: number) => void;
  
  // Graphics Settings (Bloom, Color Adjustment, AO, Texture/Aniso, Resolution, Shadows, Skybox)
  bloomEnabled: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  colorBrightness: number;
  colorContrast: number;
  colorSaturation: number;
  ambientOcclusionEnabled: boolean;
  ambientOcclusionIntensity: number;
  textureQuality: "low" | "medium" | "high" | "ultra";
  anisotropicFiltering: 1 | 2 | 4 | 8 | 16;
  resolutionScale: number;
  shadowResolution: 512 | 1024 | 2048 | 4096;
  skyboxStyle: "auto" | "day" | "sunset" | "cyberpunk" | "frosty" | "forest";
  
  setBloomEnabled: (v: boolean) => void;
  setBloomIntensity: (v: number) => void;
  setBloomThreshold: (v: number) => void;
  setColorBrightness: (v: number) => void;
  setColorContrast: (v: number) => void;
  setColorSaturation: (v: number) => void;
  setAmbientOcclusionEnabled: (v: boolean) => void;
  setAmbientOcclusionIntensity: (v: number) => void;
  setTextureQuality: (v: "low" | "medium" | "high" | "ultra") => void;
  setAnisotropicFiltering: (v: 1 | 2 | 4 | 8 | 16) => void;
  setResolutionScale: (v: number) => void;
  setShadowResolution: (v: 512 | 1024 | 2048 | 4096) => void;
  setSkyboxStyle: (v: "auto" | "day" | "sunset" | "cyberpunk" | "frosty" | "forest") => void;
  resetGraphicsDefaults: () => void;

  buyHoverboard: () => boolean;
  useHoverboard: () => boolean;
  setStatus: (
    s:
      | "login"
      | "mainMenu"
      | "levels"
      | "howToPlay"
      | "settings"
      | "playing"
      | "gameover"
      | "levelComplete"
      | "shop"
      | "paused",
  ) => void;
  incScore: (v: number) => void;
  incCoins: (v: number) => void;
  setPlayerName: (name: string) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  setCurrentLevel: (level: number) => void;
  completeLevel: () => void;
  unlockCharacter: (id: string, cost: number) => void;
  selectCharacter: (id: string) => void;
  reset: () => void;
}

const savedName = typeof window !== 'undefined' ? localStorage.getItem("subway_playerName") || "" : "";
const savedCoins = typeof window !== 'undefined' && localStorage.getItem("subway_coins") ? parseInt(localStorage.getItem("subway_coins")!) : 1500;
const savedUnlockedLevels = typeof window !== 'undefined' && localStorage.getItem("subway_unlockedLevels") ? parseInt(localStorage.getItem("subway_unlockedLevels")!) : 1;
const savedHoverboards = typeof window !== 'undefined' && localStorage.getItem("subway_hoverboards") ? parseInt(localStorage.getItem("subway_hoverboards")!) : 5;
const savedUnlockedCharacters = typeof window !== 'undefined' && localStorage.getItem("subway_unlockedCharacters") ? JSON.parse(localStorage.getItem("subway_unlockedCharacters")!) : ["default"];
const savedSelectedCharacter = typeof window !== 'undefined' ? localStorage.getItem("subway_selectedCharacter") || "default" : "default";
const savedCurrentLevel = typeof window !== 'undefined' && localStorage.getItem("subway_currentLevel") ? parseInt(localStorage.getItem("subway_currentLevel")!) : 1;

const savedMagnetLevel = typeof window !== 'undefined' && localStorage.getItem("subway_upgrade_magnet") ? parseInt(localStorage.getItem("subway_upgrade_magnet")!) : 1;
const savedSneakersLevel = typeof window !== 'undefined' && localStorage.getItem("subway_upgrade_sneakers") ? parseInt(localStorage.getItem("subway_upgrade_sneakers")!) : 1;

const savedTotalDistance = typeof window !== 'undefined' && localStorage.getItem("subway_stat_distance") ? parseFloat(localStorage.getItem("subway_stat_distance")!) : 0;
const savedTotalCoins = typeof window !== 'undefined' && localStorage.getItem("subway_stat_coins") ? parseInt(localStorage.getItem("subway_stat_coins")!) : 0;
const savedTotalHoverboardsUsed = typeof window !== 'undefined' && localStorage.getItem("subway_stat_hoverboards") ? parseInt(localStorage.getItem("subway_stat_hoverboards")!) : 0;
const savedClaimedMissions = typeof window !== 'undefined' && localStorage.getItem("subway_claimed_missions") ? JSON.parse(localStorage.getItem("subway_claimed_missions")!) : [];

// Persisted Graphics configs
const savedBloomEnabled = typeof window !== 'undefined' ? localStorage.getItem("subway_graphics_bloomEnabled") !== "false" : true;
const savedBloomIntensity = typeof window !== 'undefined' && localStorage.getItem("subway_graphics_bloomIntensity") ? parseFloat(localStorage.getItem("subway_graphics_bloomIntensity")!) : 1.1;
const savedBloomThreshold = typeof window !== 'undefined' && localStorage.getItem("subway_graphics_bloomThreshold") ? parseFloat(localStorage.getItem("subway_graphics_bloomThreshold")!) : 0.65;
const savedColorBrightness = typeof window !== 'undefined' && localStorage.getItem("subway_graphics_colorBrightness") ? parseFloat(localStorage.getItem("subway_graphics_colorBrightness")!) : 1.0;
const savedColorContrast = typeof window !== 'undefined' && localStorage.getItem("subway_graphics_colorContrast") ? parseFloat(localStorage.getItem("subway_graphics_colorContrast")!) : 1.0;
const savedColorSaturation = typeof window !== 'undefined' && localStorage.getItem("subway_graphics_colorSaturation") ? parseFloat(localStorage.getItem("subway_graphics_colorSaturation")!) : 1.05;
const savedAmbientOcclusionEnabled = typeof window !== 'undefined' ? localStorage.getItem("subway_graphics_aoEnabled") !== "false" : true;
const savedAmbientOcclusionIntensity = typeof window !== 'undefined' && localStorage.getItem("subway_graphics_aoIntensity") ? parseFloat(localStorage.getItem("subway_graphics_aoIntensity")!) : 1.0;
const savedTextureQuality = typeof window !== 'undefined' ? (localStorage.getItem("subway_graphics_textureQuality") as "low" | "medium" | "high" | "ultra") || "high" : "high";
const savedAnisotropicFiltering = typeof window !== 'undefined' && localStorage.getItem("subway_graphics_anisotropicFiltering") ? (parseInt(localStorage.getItem("subway_graphics_anisotropicFiltering")!) as 1 | 2 | 4 | 8 | 16) : 8;
const savedResolutionScale = typeof window !== 'undefined' && localStorage.getItem("subway_graphics_resolutionScale") ? parseFloat(localStorage.getItem("subway_graphics_resolutionScale")!) : typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
const savedShadowResolution = typeof window !== 'undefined' && localStorage.getItem("subway_graphics_shadowResolution") ? (parseInt(localStorage.getItem("subway_graphics_shadowResolution")!) as 512 | 1024 | 2048 | 4096) : 2048;
const savedSkyboxStyle = typeof window !== 'undefined' ? (localStorage.getItem("subway_graphics_skyboxStyle") as "auto" | "day" | "sunset" | "cyberpunk" | "frosty" | "forest") || "auto" : "auto";

export const useGameStore = create<GameState>((set) => ({
  status: "login",
  score: 0,
  coins: savedCoins,
  playerName: savedName,
  soundEnabled: true,
  musicEnabled: true,
  currentLevel: savedCurrentLevel,
  unlockedLevels: savedUnlockedLevels,
  selectedCharacter: savedSelectedCharacter,
  unlockedCharacters: savedUnlockedCharacters,
  dailyChallenge: { target: 500, progress: 0, completed: false },
  hoverboards: savedHoverboards,

  magnetUpgradeLevel: savedMagnetLevel,
  sneakersUpgradeLevel: savedSneakersLevel,
  totalRunDistance: savedTotalDistance,
  totalCoinsCollected: savedTotalCoins,
  totalHoverboardsUsed: savedTotalHoverboardsUsed,
  claimedMissions: savedClaimedMissions,

  // Graphics default state values
  bloomEnabled: savedBloomEnabled,
  bloomIntensity: savedBloomIntensity,
  bloomThreshold: savedBloomThreshold,
  colorBrightness: savedColorBrightness,
  colorContrast: savedColorContrast,
  colorSaturation: savedColorSaturation,
  ambientOcclusionEnabled: savedAmbientOcclusionEnabled,
  ambientOcclusionIntensity: savedAmbientOcclusionIntensity,
  textureQuality: savedTextureQuality,
  anisotropicFiltering: savedAnisotropicFiltering,
  resolutionScale: savedResolutionScale,
  shadowResolution: savedShadowResolution,
  skyboxStyle: savedSkyboxStyle,

  // Graphics update setters
  setBloomEnabled: (v) => set(() => {
    localStorage.setItem("subway_graphics_bloomEnabled", String(v));
    return { bloomEnabled: v };
  }),
  setBloomIntensity: (v) => set(() => {
    localStorage.setItem("subway_graphics_bloomIntensity", String(v));
    return { bloomIntensity: v };
  }),
  setBloomThreshold: (v) => set(() => {
    localStorage.setItem("subway_graphics_bloomThreshold", String(v));
    return { bloomThreshold: v };
  }),
  setColorBrightness: (v) => set(() => {
    localStorage.setItem("subway_graphics_colorBrightness", String(v));
    return { colorBrightness: v };
  }),
  setColorContrast: (v) => set(() => {
    localStorage.setItem("subway_graphics_colorContrast", String(v));
    return { colorContrast: v };
  }),
  setColorSaturation: (v) => set(() => {
    localStorage.setItem("subway_graphics_colorSaturation", String(v));
    return { colorSaturation: v };
  }),
  setAmbientOcclusionEnabled: (v) => set(() => {
    localStorage.setItem("subway_graphics_aoEnabled", String(v));
    return { ambientOcclusionEnabled: v };
  }),
  setAmbientOcclusionIntensity: (v) => set(() => {
    localStorage.setItem("subway_graphics_aoIntensity", String(v));
    return { ambientOcclusionIntensity: v };
  }),
  setTextureQuality: (v) => set(() => {
    localStorage.setItem("subway_graphics_textureQuality", v);
    return { textureQuality: v };
  }),
  setAnisotropicFiltering: (v) => set(() => {
    localStorage.setItem("subway_graphics_anisotropicFiltering", String(v));
    return { anisotropicFiltering: v };
  }),
  setResolutionScale: (v) => set(() => {
    localStorage.setItem("subway_graphics_resolutionScale", String(v));
    return { resolutionScale: v };
  }),
  setShadowResolution: (v) => set(() => {
    localStorage.setItem("subway_graphics_shadowResolution", String(v));
    return { shadowResolution: v };
  }),
  setSkyboxStyle: (v) => set(() => {
    localStorage.setItem("subway_graphics_skyboxStyle", v);
    return { skyboxStyle: v };
  }),
  resetGraphicsDefaults: () => set(() => {
    localStorage.setItem("subway_graphics_bloomEnabled", "true");
    localStorage.setItem("subway_graphics_bloomIntensity", "1.1");
    localStorage.setItem("subway_graphics_bloomThreshold", "0.65");
    localStorage.setItem("subway_graphics_colorBrightness", "1.0");
    localStorage.setItem("subway_graphics_colorContrast", "1.0");
    localStorage.setItem("subway_graphics_colorSaturation", "1.05");
    localStorage.setItem("subway_graphics_aoEnabled", "true");
    localStorage.setItem("subway_graphics_aoIntensity", "1.0");
    localStorage.setItem("subway_graphics_textureQuality", "high");
    localStorage.setItem("subway_graphics_anisotropicFiltering", "8");
    localStorage.setItem("subway_graphics_resolutionScale", "1.0");
    localStorage.setItem("subway_graphics_shadowResolution", "2048");
    localStorage.setItem("subway_graphics_skyboxStyle", "auto");
    return {
      bloomEnabled: true,
      bloomIntensity: 1.1,
      bloomThreshold: 0.65,
      colorBrightness: 1.0,
      colorContrast: 1.0,
      colorSaturation: 1.05,
      ambientOcclusionEnabled: true,
      ambientOcclusionIntensity: 1.0,
      textureQuality: "high",
      anisotropicFiltering: 8,
      resolutionScale: 1.0,
      shadowResolution: 2048,
      skyboxStyle: "auto"
    };
  }),
  buyHoverboard: () => {
    let success = false;
    set((s) => {
      if (s.coins >= 150) {
        success = true;
        const newCoins = s.coins - 150;
        const newBoards = s.hoverboards + 1;
        localStorage.setItem("subway_coins", String(newCoins));
        localStorage.setItem("subway_hoverboards", String(newBoards));
        return { coins: newCoins, hoverboards: newBoards };
      }
      return s;
    });
    return success;
  },
  useHoverboard: () => {
    let success = false;
    set((s) => {
      const isPlaying = s.status === 'playing';
      const hasBoards = s.hoverboards > 0;
      const isNotActiveYet = engineState.hoverboardActiveUntil <= Date.now();
      if (isPlaying && hasBoards && isNotActiveYet) {
        engineState.hoverboardActiveUntil = Date.now() + 15000; // 15 seconds active!
        success = true;
        const newBoards = s.hoverboards - 1;
        const newTotalHoverboards = s.totalHoverboardsUsed + 1;
        localStorage.setItem("subway_hoverboards", String(newBoards));
        localStorage.setItem("subway_stat_hoverboards", String(newTotalHoverboards));
        return { hoverboards: newBoards, totalHoverboardsUsed: newTotalHoverboards };
      }
      return s;
    });
    return success;
  },
  upgradeMagnet: () => {
    let success = false;
    set((s) => {
      const nextLevel = s.magnetUpgradeLevel + 1;
      if (nextLevel <= 5) {
        const cost = nextLevel * 200;
        if (s.coins >= cost) {
          success = true;
          const newCoins = s.coins - cost;
          localStorage.setItem("subway_coins", String(newCoins));
          localStorage.setItem("subway_upgrade_magnet", String(nextLevel));
          return { coins: newCoins, magnetUpgradeLevel: nextLevel };
        }
      }
      return s;
    });
    return success;
  },
  upgradeSneakers: () => {
    let success = false;
    set((s) => {
      const nextLevel = s.sneakersUpgradeLevel + 1;
      if (nextLevel <= 5) {
        const cost = nextLevel * 200;
        if (s.coins >= cost) {
          success = true;
          const newCoins = s.coins - cost;
          localStorage.setItem("subway_coins", String(newCoins));
          localStorage.setItem("subway_upgrade_sneakers", String(nextLevel));
          return { coins: newCoins, sneakersUpgradeLevel: nextLevel };
        }
      }
      return s;
    });
    return success;
  },
  claimMission: (id, reward) => {
    set((s) => {
      if (!s.claimedMissions.includes(id)) {
        const newCoins = s.coins + reward;
        const newClaimed = [...s.claimedMissions, id];
        localStorage.setItem("subway_coins", String(newCoins));
        localStorage.setItem("subway_claimed_missions", JSON.stringify(newClaimed));
        return { coins: newCoins, claimedMissions: newClaimed };
      }
      return s;
    });
  },
  setStatus: (s) => set({ status: s }),
  incScore: (v) => set((s) => {
    const newDist = s.totalRunDistance + v;
    localStorage.setItem("subway_stat_distance", String(newDist));
    return { score: s.score + v, totalRunDistance: newDist };
  }),
  incCoins: (v) =>
    set((s) => {
      let newProgress = s.dailyChallenge.progress + v;
      let completed = s.dailyChallenge.completed;
      if (newProgress >= s.dailyChallenge.target && !completed) {
        completed = true;
      }
      const newCoins = s.coins + v;
      localStorage.setItem("subway_coins", String(newCoins));

      let newTotalCoins = s.totalCoinsCollected;
      if (v > 0) {
        newTotalCoins += v;
        localStorage.setItem("subway_stat_coins", String(newTotalCoins));
      }

      return {
        coins: newCoins,
        totalCoinsCollected: newTotalCoins,
        dailyChallenge: {
          ...s.dailyChallenge,
          progress: newProgress,
          completed,
        },
      };
    }),
  setPlayerName: (name) => {
    localStorage.setItem("subway_playerName", name);
    set({ playerName: name });
  },
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  toggleMusic: () => set((s) => ({ musicEnabled: !s.musicEnabled })),
  setCurrentLevel: (level) => {
    localStorage.setItem("subway_currentLevel", String(level));
    set({ currentLevel: level });
  },
  completeLevel: () =>
    set((s) => {
      const nextLevel = s.currentLevel + 1;
      const newUnlocked = Math.max(s.unlockedLevels, nextLevel);
      localStorage.setItem("subway_unlockedLevels", String(newUnlocked));
      localStorage.setItem("subway_currentLevel", String(nextLevel));
      return { status: "levelComplete", currentLevel: nextLevel, unlockedLevels: newUnlocked };
    }),
  unlockCharacter: (id, cost) =>
    set((s) => {
      if (s.coins >= cost && !s.unlockedCharacters.includes(id)) {
        const newCoins = s.coins - cost;
        const newUnlockedChars = [...s.unlockedCharacters, id];
        localStorage.setItem("subway_coins", String(newCoins));
        localStorage.setItem("subway_unlockedCharacters", JSON.stringify(newUnlockedChars));
        return {
          coins: newCoins,
          unlockedCharacters: newUnlockedChars,
        };
      }
      return s;
    }),
  selectCharacter: (id) => {
    localStorage.setItem("subway_selectedCharacter", id);
    set({ selectedCharacter: id });
  },
  reset: () => set((s) => ({ status: "playing", score: 0 })),
}));

export const engineState = {
  speed: 0,
  maxSpeed: 45,
  playerLane: 0, // -1, 0, 1
  playerX: 0,
  playerY: 0, // 0 is ground
  playerZ: 0,
  isSliding: false,
  magnetActiveUntil: 0,
  hoverboardActiveUntil: 0,
  sneakersActiveUntil: 0,
  jetpackActiveUntil: 0,
  invincibleUntil: 0,
  introProgress: 1,
  magicWallZ: 0,
  magicWallLane: 0,
  magicWallActive: false,
  trainFloorY: 0,
  themeIndex: 0,
  nextGateZ: -500,
};

export interface LevelDifficulty {
  startSpeed: number;
  maxSpeed: number;
  accel: number;
  obstacleSpacingFactor: number;
  trainSpeedBonus: number;
}

export function getLevelDifficulty(level: number): LevelDifficulty {
  const lvl = Math.max(1, Math.min(30, level));
  
  // Continuous challenge progression curve. Game gets progressively cleaner & more intense with every individual level
  const ratio = (lvl - 1) / 29; // 0.0 at level 1, 1.0 at level 30

  return {
    startSpeed: 10 + ratio * 15,                // 10 at level 1, scaling up to 25
    maxSpeed: 25 + ratio * 25,                  // 25 at level 1, scaling up to 50
    accel: 0.10 + ratio * 0.25,                 // slightly faster acceleration
    obstacleSpacingFactor: Math.max(0.42, 1.0 - ratio * 0.55), // Gaps get much closer together at high levels (from 1.0 down to 0.45)
    trainSpeedBonus: ratio * 20,                // Oncoming trains approach dramatically faster as you pass more levels
  };
}
