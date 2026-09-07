import { AppConfig, ComponentConfig, QuadrantValues, SavedPreset } from '../types';

const mkComp = (url: string, slice: QuadrantValues, pad: QuadrantValues, patternScale = 1.4): ComponentConfig => ({
  url,
  slice: [...slice] as QuadrantValues,
  pad: [...pad] as QuadrantValues,
  patternScale,
  dirty: false,
});

export const DEFAULT_PRESETS: SavedPreset[] = [
  {
    id: 'builtin_sully',
    name: 'Sully 预设',
    note: '白框九宫格切片，单层盒模型',
    isBuiltin: true,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    exportType: 'sully',
    config: {
      ai: {
        url: 'https://nos.netease.com/ysf/46882d435e011f0c2c8191370f155579.png',
        slice: [52, 63, 47, 73],
        pad: [0, 4, 2, 4],
        patternScale: 1.5,
        textColor: '#ffffff',
        voice: mkComp('https://nos.netease.com/ysf/46882d435e011f0c2c8191370f155579.png', [52, 63, 47, 73], [0, 8, 1, 8], 1.4),
        transfer: mkComp('https://nos.netease.com/ysf/46882d435e011f0c2c8191370f155579.png', [52, 63, 47, 73], [6, 14, 6, 14], 1.3),
      },
      user: {
        url: 'https://nos.netease.com/ysf/568a947a6b5a5c8b58a789cb3f543942.png',
        slice: [51, 58, 43, 52],
        pad: [0, 4, 2, 4],
        patternScale: 1.5,
        textColor: '#000000',
        voice: mkComp('https://nos.netease.com/ysf/568a947a6b5a5c8b58a789cb3f543942.png', [51, 58, 43, 52], [0, 8, 1, 8], 1.4),
        transfer: mkComp('https://nos.netease.com/ysf/568a947a6b5a5c8b58a789cb3f543942.png', [51, 58, 43, 52], [6, 12, 6, 12], 1.3),
      },
      modalStrategy: 'ai',
    },
  },
  {
    id: 'builtin_classic',
    name: '经典气泡预设',
    note: '经典立体深蓝双向弧度拉伸气泡',
    isBuiltin: true,
    createdAt: 1700000001000,
    updatedAt: 1700000001000,
    exportType: 'sully',
    config: {
      ai: {
        url: 'https://nos.netease.com/ysf/55c0b3a0df9225b169e3655f6d42c22f.png',
        slice: [32, 36, 18, 34],
        pad: [10, 14, 6, 16],
        patternScale: 1.4,
        textColor: '#ffffff',
        voice: mkComp('https://nos.netease.com/ysf/55c0b3a0df9225b169e3655f6d42c22f.png', [32, 36, 18, 34], [6, 12, 6, 12], 1.4),
        transfer: mkComp('https://nos.netease.com/ysf/55c0b3a0df9225b169e3655f6d42c22f.png', [32, 36, 18, 34], [6, 14, 6, 14], 1.4),
      },
      user: {
        url: 'https://nos.netease.com/ysf/8fdb076828f29a6607830d0e6bad6178.png',
        slice: [32, 36, 18, 34],
        pad: [10, 12, 6, 18],
        patternScale: 1.4,
        textColor: '#ffffff',
        voice: mkComp('https://nos.netease.com/ysf/8fdb076828f29a6607830d0e6bad6178.png', [32, 36, 18, 34], [6, 12, 6, 12], 1.4),
        transfer: mkComp('https://nos.netease.com/ysf/8fdb076828f29a6607830d0e6bad6178.png', [32, 36, 18, 34], [6, 14, 6, 14], 1.4),
      },
      modalStrategy: 'ai',
    },
  },
];

const STORAGE_KEY_PRESETS = 'sully_workbench_presets_v3';
const STORAGE_KEY_ACTIVE_ID = 'sully_workbench_active_preset_id_v3';

export function loadSavedPresets(): SavedPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRESETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(DEFAULT_PRESETS));
      return DEFAULT_PRESETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure builtins exist
      const existingIds = new Set(parsed.map((p: SavedPreset) => p.id));
      const missingBuiltins = DEFAULT_PRESETS.filter((d) => !existingIds.has(d.id));
      if (missingBuiltins.length > 0) {
        const merged = [...parsed, ...missingBuiltins];
        localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load presets from localStorage:', err);
  }
  return DEFAULT_PRESETS;
}

export function savePresetsToStorage(presets: SavedPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save presets to localStorage:', err);
  }
}

export function upsertPreset(preset: SavedPreset): SavedPreset[] {
  const current = loadSavedPresets();
  const existingIndex = current.findIndex((p) => p.id === preset.id);

  let updated: SavedPreset[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = {
      ...preset,
      updatedAt: Date.now(),
    };
  } else {
    updated = [
      {
        ...preset,
        createdAt: preset.createdAt || Date.now(),
        updatedAt: Date.now(),
      },
      ...current,
    ];
  }

  savePresetsToStorage(updated);
  return updated;
}

export function deletePresetFromStorage(id: string): SavedPreset[] {
  const current = loadSavedPresets();
  const filtered = current.filter((p) => p.id !== id);
  if (filtered.length === 0) {
    savePresetsToStorage(DEFAULT_PRESETS);
    return DEFAULT_PRESETS;
  }
  savePresetsToStorage(filtered);
  return filtered;
}

export function updatePresetMeta(id: string, name: string, note?: string): SavedPreset[] {
  const current = loadSavedPresets();
  const updated = current.map((p) => {
    if (p.id === id) {
      return {
        ...p,
        name: name.trim() || p.name,
        note: note !== undefined ? note.trim() : p.note,
        updatedAt: Date.now(),
      };
    }
    return p;
  });
  savePresetsToStorage(updated);
  return updated;
}

export function getStoredActivePresetId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || DEFAULT_PRESETS[0].id;
  } catch {
    return DEFAULT_PRESETS[0].id;
  }
}

export function setStoredActivePresetId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } catch (err) {
    console.warn('Failed to set active preset ID:', err);
  }
}

export function resetToDefaults(): SavedPreset[] {
  savePresetsToStorage(DEFAULT_PRESETS);
  setStoredActivePresetId(DEFAULT_PRESETS[0].id);
  return DEFAULT_PRESETS;
}
