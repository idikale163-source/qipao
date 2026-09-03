import React from 'react';
import { ActiveComp, ActiveRole, AppConfig } from '../types';
import { Palette, ZoomIn } from 'lucide-react';

interface ColorPanelProps {
  config: AppConfig;
  activeRole: ActiveRole;
  activeComp: ActiveComp;
  currentScale: number;
  onUpdateColor: (role: ActiveRole, color: string) => void;
  onUpdateScale: (scale: number) => void;
}

const QUICK_COLORS = [
  { label: '纯白', color: '#ffffff' },
  { label: '纯黑', color: '#000000' },
  { label: '深紫墨', color: '#4c3f58' },
  { label: '薰衣草', color: '#7b698f' },
  { label: '琥珀棕', color: '#854d0e' },
  { label: '墨绿', color: '#14532d' },
  { label: '胭脂红', color: '#991b1b' },
  { label: '夜海蓝', color: '#1e3a8a' },
];

export const ColorPanel: React.FC<ColorPanelProps> = ({
  config,
  activeRole,
  activeComp,
  currentScale,
  onUpdateColor,
  onUpdateScale,
}) => {
  const currentConfig = config[activeRole];
  const roleName = activeRole === 'ai' ? '对方 (AI)' : '己方 (用户)';
  const compLabel = activeComp === 'bubble' ? '气泡' : activeComp === 'voice' ? '语音条' : '转账卡';

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#') && val.length > 0) val = '#' + val;
    onUpdateColor(activeRole, val);
  };

  return (
    <div id="color-and-scale-panel" className="bg-white rounded-xl p-4 border-2 border-black shadow-[3px_3px_0px_#000] mb-4 space-y-4">
      {/* 调色板 - Clean Minimalism */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-black text-black flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-black" />
            <span>{roleName} 全套组件文字颜色联动</span>
          </span>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">气泡 / 语音 / 转账卡全端同步</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 原生颜色拾取器 + HEX 输入 */}
          <div className="flex items-center gap-2 bg-[#f0f2f5] border-2 border-black px-2.5 py-1.5 rounded-lg shadow-[2px_2px_0px_#000]">
            <div className="relative w-6 h-6 rounded-md overflow-hidden border border-black shadow-xs">
              <input
                type="color"
                value={currentConfig.textColor.startsWith('#') ? currentConfig.textColor : '#000000'}
                onChange={(e) => onUpdateColor(activeRole, e.target.value)}
                className="absolute -top-2 -left-2 w-11 h-11 cursor-pointer"
              />
            </div>
            <input
              type="text"
              maxLength={7}
              value={currentConfig.textColor}
              onChange={handleHexChange}
              className="w-20 font-mono text-xs font-black uppercase text-black bg-transparent border-none focus:outline-none"
            />
          </div>

          {/* 快捷色彩点选 */}
          <div className="flex flex-wrap items-center gap-1.5">
            {QUICK_COLORS.map((item) => (
              <button
                key={item.color}
                type="button"
                onClick={() => onUpdateColor(activeRole, item.color)}
                className={`w-7 h-7 rounded-lg border-2 border-black flex items-center justify-center text-[10px] font-black transition-all shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                  currentConfig.textColor.toLowerCase() === item.color.toLowerCase()
                    ? 'ring-2 ring-purple-600 ring-offset-2 scale-105'
                    : ''
                }`}
                style={{ backgroundColor: item.color }}
                title={`${item.label} (${item.color})`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 缩放倍率滑动条 (border-image-width) */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-black flex items-center gap-1.5">
            <ZoomIn className="w-4 h-4 text-black" />
            <span>【{roleName} · {compLabel}】图案放大倍率 (border-image-width)</span>
          </span>
          <span className="text-xs font-black font-mono px-2 py-0.5 bg-black text-white rounded">
            {currentScale.toFixed(2)}x
          </span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.05"
            value={currentScale}
            onChange={(e) => onUpdateScale(parseFloat(e.target.value))}
            className="flex-1 accent-black h-2 bg-gray-200 rounded-lg cursor-pointer"
          />
          <div className="flex gap-1.5">
            {[1.0, 1.2, 1.4, 1.55, 2.0].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onUpdateScale(s)}
                className={`px-2 py-1 text-[10px] font-black rounded border border-black transition-all ${
                  Math.abs(currentScale - s) < 0.04
                    ? 'bg-black text-white shadow-[1px_1px_0px_#000]'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
