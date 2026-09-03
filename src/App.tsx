import React, { useState, useRef } from 'react';
import {
  ActiveComponent,
  ActiveMode,
  ActiveRole,
  AppConfig,
  ComponentConfig,
  ExportType,
  ModalAssetStrategy,
  QuadrantValues,
} from './types';
import { SlicingCanvas } from './components/SlicingCanvas';
import { ColorPanel } from './components/ColorPanel';
import { ModalStrategyControl } from './components/ModalStrategyControl';
import { PreviewSection } from './components/PreviewSection';
import { CodeExport } from './components/CodeExport';
import { Upload, Link2, RefreshCw } from 'lucide-react';

const mkComp = (url: string, slice: QuadrantValues, pad: QuadrantValues, patternScale = 1.4): ComponentConfig => ({
  url,
  slice: [...slice] as QuadrantValues,
  pad: [...pad] as QuadrantValues,
  patternScale,
  dirty: false,
});

const PRESET_SULLY: AppConfig = {
  ai: {
    url: 'https://nos.netease.com/ysf/46882d435e011f0c2c8191370f155579.png',
    slice: [52, 63, 47, 73],
    pad: [0, 4, 2, 4],
    patternScale: 1.5,
    textColor: '#ffffff',
    voice: mkComp('https://nos.netease.com/ysf/46882d435e011f0c2c8191370f155579.png', [52, 63, 47, 73], [0, 8, 1, 8], 1.4),
    transfer: mkComp('https://nos.netease.com/ysf/568a947a6b5a5c8b58a789cb3f543942.png', [51, 58, 43, 52], [6, 12, 6, 12], 1.3),
  },
  user: {
    url: 'https://nos.netease.com/ysf/568a947a6b5a5c8b58a789cb3f543942.png',
    slice: [51, 58, 43, 52],
    pad: [0, 4, 2, 4],
    patternScale: 1.5,
    textColor: '#000000',
    voice: mkComp('https://nos.netease.com/ysf/568a947a6b5a5c8b58a789cb3f543942.png', [51, 58, 43, 52], [0, 8, 1, 8], 1.4),
    transfer: mkComp('https://nos.netease.com/ysf/46882d435e011f0c2c8191370f155579.png', [52, 63, 47, 73], [6, 14, 6, 14], 1.3),
  },
  modalStrategy: 'ai',
};

const PRESET_CLASSIC: AppConfig = {
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
};

export default function App() {
  const [config, setConfig] = useState<AppConfig>(PRESET_SULLY);
  const [activeRole, setActiveRole] = useState<ActiveRole>('ai');
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>('bubble');
  const [activeMode, setActiveMode] = useState<ActiveMode>('s');
  const [exportType, setExportType] = useState<ExportType>('sully');
  const [urlInput, setUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const preset = PRESET_SULLY[activeRole];
        return {
          ...prev,
          [activeRole]: {
            ...roleCfg,
            url: preset.url,
            slice: [...preset.slice] as QuadrantValues,
            pad: [...preset.pad] as QuadrantValues,
            patternScale: preset.patternScale,
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
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
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
                  v12.0
                </span>
              </div>
              <p className="text-[10px] text-green-700 font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                <span>一边拖拽移动，一边零延迟看预览 · 全组件实时联动</span>
              </p>
            </div>
          </div>

          {/* 预设快捷切换 */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setConfig(PRESET_SULLY)}
              className="text-xs font-bold px-3 py-1 rounded-lg border-2 border-black bg-white text-black hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[2px_2px_0px_#000] transition-all"
            >
              Sully 白框预设
            </button>
            <button
              type="button"
              onClick={() => setConfig(PRESET_CLASSIC)}
              className="text-xs font-bold px-3 py-1 rounded-lg border-2 border-black bg-white text-black hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[2px_2px_0px_#000] transition-all"
            >
              经典气泡预设
            </button>
          </div>
        </div>
      </header>

      {/* 主体工作区 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-3 space-y-3">
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
          <span>Nine-Grid Live Workbench v12.0</span>
        </div>
        <div>
          <span>一边调一边看 · 即时零延迟联动</span>
        </div>
      </footer>
    </div>
  );
}
