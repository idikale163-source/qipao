import React, { useState, useRef, useEffect } from 'react';
import {
  ActiveComponent,
  ActiveMode,
  ActiveRole,
  AppConfig,
  ComponentConfig,
  ExportType,
  ModalAssetStrategy,
  QuadrantValues,
  SavedPreset,
} from './types';
import { SlicingCanvas } from './components/SlicingCanvas';
import { ColorPanel } from './components/ColorPanel';
import { ModalStrategyControl } from './components/ModalStrategyControl';
import { PreviewSection } from './components/PreviewSection';
import { CodeExport } from './components/CodeExport';
import { MobileLivePreviewDock, MobileViewMode } from './components/MobileLivePreviewDock';
import { PresetManagerModal } from './components/PresetManagerModal';
import {
  loadSavedPresets,
  upsertPreset,
  deletePresetFromStorage,
  updatePresetMeta,
  getStoredActivePresetId,
  setStoredActivePresetId,
  resetToDefaults,
  DEFAULT_PRESETS,
} from './utils/presetStorage';
import { Upload, Link2, RefreshCw, Smartphone, Save, Plus, ChevronDown, Check, Bookmark } from 'lucide-react';

export default function App() {
  const [presets, setPresets] = useState<SavedPreset[]>(() => loadSavedPresets());
  const [activePresetId, setActivePresetId] = useState<string | null>(() => getStoredActivePresetId());
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'list' | 'save_new'>('list');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize config from active preset or default
  const [config, setConfig] = useState<AppConfig>(() => {
    const savedList = loadSavedPresets();
    const storedId = getStoredActivePresetId();
    const found = savedList.find((p) => p.id === storedId) || savedList[0] || DEFAULT_PRESETS[0];
    return JSON.parse(JSON.stringify(found.config));
  });

  const [activeRole, setActiveRole] = useState<ActiveRole>('ai');
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>('bubble');
  const [activeMode, setActiveMode] = useState<ActiveMode>('s');
  const [exportType, setExportType] = useState<ExportType>(() => {
    const savedList = loadSavedPresets();
    const storedId = getStoredActivePresetId();
    const found = savedList.find((p) => p.id === storedId) || savedList[0];
    return found?.exportType || 'sully';
  });
  const [mobileViewMode, setMobileViewMode] = useState<MobileViewMode>('split');
  const [urlInput, setUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  // Keyboard shortcut Ctrl+S / Cmd+S to quickly save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleQuickSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePreset, config, exportType]);

  // Apply a preset (restores config + exportType)
  const handleSelectPreset = (preset: SavedPreset) => {
    setActivePresetId(preset.id);
    setStoredActivePresetId(preset.id);
    setConfig(JSON.parse(JSON.stringify(preset.config)));
    if (preset.exportType) {
      setExportType(preset.exportType);
    }
    showToast(`已载入预设：${preset.name}（${preset.exportType.toUpperCase()} 模式）`);
  };

  // Quick save button
  const handleQuickSave = () => {
    if (!activePreset || activePreset.isBuiltin) {
      // If current is builtin, open save new modal
      setModalMode('save_new');
      setIsPresetModalOpen(true);
    } else {
      // Update existing custom preset directly
      const updatedPreset: SavedPreset = {
        ...activePreset,
        config: JSON.parse(JSON.stringify(config)),
        exportType,
        updatedAt: Date.now(),
      };
      const updatedList = upsertPreset(updatedPreset);
      setPresets(updatedList);
      showToast(`已保存对预设「${activePreset.name}」的修改！`);
    }
  };

  // Save new preset
  const handleSaveNewPreset = (name: string, note: string) => {
    const newPreset: SavedPreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      note,
      isBuiltin: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      exportType,
      config: JSON.parse(JSON.stringify(config)),
    };
    const updated = upsertPreset(newPreset);
    setPresets(updated);
    setActivePresetId(newPreset.id);
    setStoredActivePresetId(newPreset.id);
    showToast(`预设「${name}」已保存（${exportType.toUpperCase()} 模式）`);
  };

  // Update preset metadata (name & note)
  const handleUpdatePresetMeta = (id: string, name: string, note: string) => {
    const updated = updatePresetMeta(id, name, note);
    setPresets(updated);
    showToast('预设信息已更新');
  };

  // Delete preset
  const handleDeletePreset = (id: string) => {
    const target = presets.find((p) => p.id === id);
    const updated = deletePresetFromStorage(id);
    setPresets(updated);
    if (activePresetId === id) {
      const next = updated[0];
      setActivePresetId(next.id);
      setStoredActivePresetId(next.id);
      setConfig(JSON.parse(JSON.stringify(next.config)));
      if (next.exportType) {
        setExportType(next.exportType);
      }
    }
    showToast(`已删除预设「${target?.name || ''}」`);
  };

  const roleConfig = config[activeRole];
  const currentComp: ComponentConfig =
    activeComponent === 'bubble'
      ? {
          url: roleConfig.url,
          slice: roleConfig.slice,
          pad: roleConfig.pad,
          patternScale: roleConfig.patternScale,
        }
      : roleConfig[activeComponent] || {
          url: roleConfig.url,
          slice: [...roleConfig.slice],
          pad: activeComponent === 'voice' ? [6, 12, 6, 12] : [6, 14, 6, 14],
          patternScale: roleConfig.patternScale,
          dirty: false,
        };

  const isCurrentCompDirty = activeComponent !== 'bubble' && Boolean(roleConfig[activeComponent]?.dirty);

  // Update Slice (targets activeComponent)
  const handleUpdateSlice = (index: number, value: number) => {
    setConfig((prev) => {
      const roleCfg = prev[activeRole];
      if (activeComponent === 'bubble') {
        const nextSlice = [...roleCfg.slice] as QuadrantValues;
        nextSlice[index] = value;
        const nextVoice = roleCfg.voice?.dirty ? roleCfg.voice : { ...roleCfg.voice, slice: nextSlice };
        const nextTransfer = roleCfg.transfer?.dirty ? roleCfg.transfer : { ...roleCfg.transfer, slice: nextSlice };
        return {
          ...prev,
          [activeRole]: {
            ...roleCfg,
            slice: nextSlice,
            voice: nextVoice,
            transfer: nextTransfer,
          },
        };
      } else {
        const compCfg = roleCfg[activeComponent] || {
          url: roleCfg.url,
          slice: [...roleCfg.slice],
          pad: activeComponent === 'voice' ? [6, 12, 6, 12] : [6, 14, 6, 14],
          patternScale: roleCfg.patternScale,
          dirty: true,
        };
        const nextSlice = [...compCfg.slice] as QuadrantValues;
        nextSlice[index] = value;
        return {
          ...prev,
          [activeRole]: {
            ...roleCfg,
            [activeComponent]: {
              ...compCfg,
              slice: nextSlice,
              dirty: true,
            },
          },
        };
      }
    });
  };

  // Update Pad (targets activeComponent)
  const handleUpdatePad = (index: number, value: number) => {
    setConfig((prev) => {
      const roleCfg = prev[activeRole];
      if (activeComponent === 'bubble') {
        const nextPad = [...roleCfg.pad] as QuadrantValues;
        nextPad[index] = value;
        return {
          ...prev,
          [activeRole]: {
            ...roleCfg,
            pad: nextPad,
          },
        };
      } else {
        const compCfg = roleCfg[activeComponent] || {
          url: roleCfg.url,
          slice: [...roleCfg.slice],
          pad: activeComponent === 'voice' ? [6, 12, 6, 12] : [6, 14, 6, 14],
          patternScale: roleCfg.patternScale,
          dirty: true,
        };
        const nextPad = [...compCfg.pad] as QuadrantValues;
        nextPad[index] = value;
        return {
          ...prev,
          [activeRole]: {
            ...roleCfg,
            [activeComponent]: {
              ...compCfg,
              pad: nextPad,
              dirty: true,
            },
          },
        };
      }
    });
  };

  // Update Color (linked across all components for the role)
  const handleUpdateColor = (role: ActiveRole, color: string) => {
    setConfig((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        textColor: color,
      },
    }));
  };

  // Update Scale (targets activeComponent)
  const handleUpdateScale = (scale: number) => {
    setConfig((prev) => {
      const roleCfg = prev[activeRole];
      if (activeComponent === 'bubble') {
        return {
          ...prev,
          [activeRole]: {
            ...roleCfg,
            patternScale: scale,
          },
        };
      } else {
        const compCfg = roleCfg[activeComponent] || {
          url: roleCfg.url,
          slice: [...roleCfg.slice],
          pad: activeComponent === 'voice' ? [6, 12, 6, 12] : [6, 14, 6, 14],
          patternScale: roleCfg.patternScale,
          dirty: true,
        };
        return {
          ...prev,
          [activeRole]: {
            ...roleCfg,
            [activeComponent]: {
              ...compCfg,
              patternScale: scale,
              dirty: true,
            },
          },
        };
      }
    });
  };

  // Update Modal Strategy
  const handleUpdateModalStrategy = (strategy: ModalAssetStrategy) => {
    setConfig((prev) => ({
      ...prev,
      modalStrategy: strategy,
    }));
  };

  // Apply new URL
  const handleApplyUrl = (url: string) => {
    setConfig((prev) => {
      const roleCfg = prev[activeRole];
      if (activeComponent === 'bubble') {
        const nextVoice = roleCfg.voice?.dirty ? roleCfg.voice : { ...roleCfg.voice, url };
        const nextTransfer = roleCfg.transfer?.dirty ? roleCfg.transfer : { ...roleCfg.transfer, url };
        return {
          ...prev,
          [activeRole]: {
            ...roleCfg,
            url,
            voice: nextVoice,
            transfer: nextTransfer,
          },
        };
      } else {
        const compCfg = roleCfg[activeComponent] || {
          url,
          slice: [...roleCfg.slice],
          pad: activeComponent === 'voice' ? [6, 12, 6, 12] : [6, 14, 6, 14],
          patternScale: roleCfg.patternScale,
          dirty: true,
        };
        return {
          ...prev,
          [activeRole]: {
            ...roleCfg,
            [activeComponent]: {
              ...compCfg,
              url,
              dirty: true,
            },
          },
        };
      }
    });
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        handleApplyUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // URL Load
  const handleUrlLoad = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    handleApplyUrl(trimmed);
    setUrlInput('');
  };

  // Reset current active component
  const handleResetCurrent = () => {
    setConfig((prev) => {
      const roleCfg = prev[activeRole];
      if (activeComponent === 'bubble') {
        const defaultCfg = DEFAULT_PRESETS[0].config[activeRole];
        return {
          ...prev,
          [activeRole]: {
            ...roleCfg,
            url: defaultCfg.url,
            slice: [...defaultCfg.slice] as QuadrantValues,
            pad: [...defaultCfg.pad] as QuadrantValues,
            patternScale: defaultCfg.patternScale,
          },
        };
      } else {
        return {
          ...prev,
          [activeRole]: {
            ...roleCfg,
            [activeComponent]: {
              url: roleCfg.url,
              slice: [...roleCfg.slice],
              pad: activeComponent === 'voice' ? [6, 12, 6, 12] : [6, 14, 6, 14],
              patternScale: roleCfg.patternScale,
              dirty: false,
            },
          },
        };
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-slate-900 pb-12 font-sans">
      {/* 顶部导航与预设 - Clean Minimalism */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-black text-sm shadow-[2px_2px_0px_rgba(0,0,0,0.3)] shrink-0">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-black tracking-tight text-gray-900">
                  九宫格切片与即时预览工作台
                </h1>
                <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded-md shadow-xs">
                  v13.0
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-500 px-1.5 py-0.5 rounded">
                  浏览器永久存储
                </span>
              </div>
              <p className="text-[10px] text-green-700 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                <span>一边拖拽移动，一边零延迟看预览 · 所有手机皮肤永久保存在本地</span>
              </p>
            </div>
          </div>

          {/* 预设与小手机管理操作栏 */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {/* 当前选用的小手机快速选择器 */}
            {/* 当前选用预设选择器 */}
            <div className="relative flex items-center">
              <select
                id="preset-quick-selector"
                value={activePresetId || ''}
                onChange={(e) => {
                  const target = presets.find((p) => p.id === e.target.value);
                  if (target) handleSelectPreset(target);
                }}
                className="text-xs font-black bg-[#f0f2f5] text-black border-2 border-black rounded-lg pl-2.5 pr-7 py-1.5 shadow-[2px_2px_0px_#000] focus:outline-none cursor-pointer appearance-none"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.exportType?.toUpperCase() || 'SULLY'}] {p.name} {p.isBuiltin ? '(内置)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-black absolute right-2 pointer-events-none" />
            </div>

            {/* 保存预设按钮 */}
            <button
              type="button"
              id="save-new-preset-btn"
              onClick={() => {
                setModalMode('save_new');
                setIsPresetModalOpen(true);
              }}
              title="保存当前切片数值与平台模式为新预设"
              className="text-xs font-black px-3 py-1.5 rounded-lg border-2 border-black bg-black text-white hover:bg-neutral-800 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[2px_2px_0px_#000] transition-all flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>保存预设</span>
            </button>

            {/* 管理预设 */}
            <button
              type="button"
              id="open-preset-manager-btn"
              onClick={() => {
                setModalMode('list');
                setIsPresetModalOpen(true);
              }}
              className="text-xs font-black px-3 py-1.5 rounded-lg border-2 border-black bg-white text-black hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[2px_2px_0px_#000] transition-all flex items-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5 text-black" />
              <span>预设管理</span>
              <span className="text-[10px] font-black bg-black text-white px-1.5 py-0.2 rounded-full">
                {presets.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 主体工作区 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-1 sm:pt-3 space-y-3">
        {/* 移动端专属：边调边看即时视窗 (吸顶分屏 / 悬浮画中画) */}
        <MobileLivePreviewDock
          config={config}
          activeRole={activeRole}
          activeComponent={activeComponent}
          exportType={exportType}
          mobileViewMode={mobileViewMode}
          onSelectMobileViewMode={setMobileViewMode}
          onSelectExportType={setExportType}
          onSelectComponent={(comp, role) => {
            setActiveComponent(comp);
            setActiveRole(role);
          }}
        />

        {/* 紧凑统一快捷控制条 (角色 / 组件 / 模式 / 换图 一览无余) */}
        <div className="bg-white rounded-xl p-2.5 border-2 border-black shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-2.5">
          {/* 1. 角色选择 */}
          <div className="flex items-center gap-1.5 bg-[#f0f2f5] p-1 border border-black rounded-lg">
            <button
              type="button"
              id="role-btn-ai"
              onClick={() => setActiveRole('ai')}
              className={`px-3 py-1 rounded-md text-xs font-black transition-all flex items-center gap-1 ${
                activeRole === 'ai'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <span>🤖 对方 (AI)</span>
            </button>
            <button
              type="button"
              id="role-btn-user"
              onClick={() => setActiveRole('user')}
              className={`px-3 py-1 rounded-md text-xs font-black transition-all flex items-center gap-1 ${
                activeRole === 'user'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <span>👤 己方 (用户)</span>
            </button>
          </div>

          {/* 2. 组件切换 */}
          <div className="flex items-center gap-1 bg-[#f0f2f5] p-1 border border-black rounded-lg">
            <button
              type="button"
              id="comp-btn-bubble"
              onClick={() => setActiveComponent('bubble')}
              className={`px-2.5 py-1 rounded-md text-xs font-black transition-all flex items-center gap-1 ${
                activeComponent === 'bubble'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <span>💬 气泡</span>
            </button>
            <button
              type="button"
              id="comp-btn-voice"
              onClick={() => setActiveComponent('voice')}
              className={`px-2.5 py-1 rounded-md text-xs font-black transition-all flex items-center gap-1 ${
                activeComponent === 'voice'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <span>🎙️ 语音条</span>
            </button>
            <button
              type="button"
              id="comp-btn-transfer"
              onClick={() => setActiveComponent('transfer')}
              className={`px-2.5 py-1 rounded-md text-xs font-black transition-all flex items-center gap-1 ${
                activeComponent === 'transfer'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <span>💰 转账卡</span>
            </button>
          </div>

          {/* 3. 调节线切换 (拉伸线 vs 留白线) */}
          <div className="flex items-center gap-1 bg-[#f0f2f5] p-1 border border-black rounded-lg">
            <button
              type="button"
              onClick={() => setActiveMode('s')}
              className={`px-2.5 py-1 rounded-md text-xs font-black transition-all flex items-center gap-1.5 ${
                activeMode === 's'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white inline-block" />
              <span>拉伸线 (Slice)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('c')}
              className={`px-2.5 py-1 rounded-md text-xs font-black transition-all flex items-center gap-1.5 ${
                activeMode === 'c'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white inline-block" />
              <span>留白线 (Pad)</span>
            </button>
          </div>

          {/* 4. 换图与贴链接 */}
          <div className="flex items-center gap-1.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 bg-black hover:bg-neutral-800 text-white text-xs font-black px-2.5 py-1.5 rounded-lg border border-black shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              <Upload className="w-3 h-3" />
              <span>换图</span>
            </button>

            <div className="flex items-center gap-1 bg-[#f0f2f5] border border-black rounded-lg px-2 py-1">
              <Link2 className="w-3 h-3 text-gray-500" />
              <input
                type="text"
                placeholder="贴入图片链接..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
                className="w-28 sm:w-36 bg-transparent border-none text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleUrlLoad}
                className="text-[10px] font-black text-black bg-white border border-black px-1.5 py-0.5 rounded shadow-xs hover:bg-black hover:text-white transition-colors"
              >
                加载
              </button>
            </div>

            <button
              type="button"
              title="恢复当前组件默认设置"
              onClick={handleResetCurrent}
              className="border border-black bg-white text-black p-1.5 rounded-lg shadow-[1px_1px_0px_#000] hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center transition-all"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 核心一体化工作台：【调节控制台】与【实时预览视窗】顶端并排完全对齐 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* 左侧：切片调节控制台 (Canvas + Steppers + Color/Scale) */}
          <div className="flex flex-col gap-3">
            <SlicingCanvas
              currentComp={currentComp}
              activeRole={activeRole}
              activeComp={activeComponent}
              activeMode={activeMode}
              exportType={exportType}
              textColor={roleConfig.textColor}
              onUpdateSlice={handleUpdateSlice}
              onUpdatePad={handleUpdatePad}
              onResetComponent={handleResetCurrent}
              isComponentDirty={isCurrentCompDirty}
            />

            <ColorPanel
              config={config}
              activeRole={activeRole}
              activeComp={activeComponent}
              currentScale={currentComp.patternScale}
              onUpdateColor={handleUpdateColor}
              onUpdateScale={handleUpdateScale}
            />
          </div>

          {/* 右侧：实时预览视窗 (一边移动一边实时呈现，完全并排) */}
          <div className="flex flex-col gap-3">
            <PreviewSection
              config={config}
              activeRole={activeRole}
              activeComponent={activeComponent}
              exportType={exportType}
              onSelectExportType={setExportType}
              onSelectComponent={(comp, role) => {
                setActiveComponent(comp);
                setActiveRole(role);
              }}
            />
          </div>
        </div>

        {/* 下方扩展区：转账弹窗策略 (默认折叠收起) 与 代码导出 */}
        <div className="space-y-3 pt-1">
          <ModalStrategyControl
            config={config}
            onUpdateStrategy={handleUpdateModalStrategy}
          />

          <CodeExport
            config={config}
            exportType={exportType}
            onSelectExportType={setExportType}
          />
        </div>
      </main>

      {/* 页脚 */}
      <footer className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t-2 border-black/20 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest gap-2">
        <div className="flex items-center gap-2">
          <span className="font-black text-black">Sully Visual Engine</span>
          <span>•</span>
          <span>Nine-Grid Live Workbench v13.0</span>
          <span className="text-emerald-700 font-bold">● 浏览器永久保存已激活</span>
        </div>
        <div>
          <span>一边调一边看 · 即时零延迟联动 · 随时保存切换预设</span>
        </div>
      </footer>

      {/* 预设管理与保存弹窗 */}
      <PresetManagerModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        mode={modalMode}
        currentConfig={config}
        currentExportType={exportType}
        activePresetId={activePresetId}
        presets={presets}
        onSelectPreset={handleSelectPreset}
        onSaveNewPreset={handleSaveNewPreset}
        onUpdatePresetMeta={handleUpdatePresetMeta}
        onDeletePreset={handleDeletePreset}
      />

      {/* 浮动操作提示 Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-black text-white text-xs font-black px-4 py-2.5 rounded-xl border-2 border-white shadow-[4px_4px_0px_rgba(0,0,0,0.5)] flex items-center gap-2 animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
