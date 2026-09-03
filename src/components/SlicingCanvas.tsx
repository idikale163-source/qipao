import React, { useRef, useState, useEffect } from 'react';
import { ActiveComp, ActiveMode, ActiveRole, ComponentConfig, ExportType, QuadrantValues } from '../types';
import { Minus, Plus, Info, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { calcSafeBw } from '../utils/cssGenerator';

interface SlicingCanvasProps {
  currentComp: ComponentConfig;
  activeRole: ActiveRole;
  activeComp: ActiveComp;
  activeMode: ActiveMode;
  exportType?: ExportType;
  textColor?: string;
  onUpdateSlice: (index: number, value: number) => void;
  onUpdatePad: (index: number, value: number) => void;
  onResetComponent?: () => void;
  isComponentDirty?: boolean;
}

export const SlicingCanvas: React.FC<SlicingCanvasProps> = ({
  currentComp,
  activeRole,
  activeComp,
  activeMode,
  exportType = 'sully',
  textColor = '#000000',
  onUpdateSlice,
  onUpdatePad,
  onResetComponent,
  isComponentDirty,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [imgDim, setImgDim] = useState<{ rw: number; rh: number; natW: number; natH: number }>({
    rw: 220,
    rh: 180,
    natW: 160,
    natH: 120,
  });

  const activeDragRef = useRef<{
    type: 'slice' | 'pad';
    idx: number;
    axis: 'x' | 'y';
    inv: boolean;
  } | null>(null);

  const updateDimensions = () => {
    if (imgRef.current) {
      setImgDim({
        rw: imgRef.current.clientWidth || 220,
        rh: imgRef.current.clientHeight || 180,
        natW: imgRef.current.naturalWidth || 160,
        natH: imgRef.current.naturalHeight || 120,
      });
    }
  };

  useEffect(() => {
    updateDimensions();
  }, [currentComp.url]);

  const handlePointerDown = (
    e: React.PointerEvent,
    type: 'slice' | 'pad',
    idx: number,
    axis: 'x' | 'y',
    inv: boolean
  ) => {
    activeDragRef.current = { type, idx, axis, inv };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragRef.current || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const { rw, rh, natW, natH } = imgDim;
    if (rw <= 0 || rh <= 0 || natW <= 0 || natH <= 0) return;

    const { type, idx, axis, inv } = activeDragRef.current;

    if (axis === 'y') {
      const y = Math.max(0, Math.min(rh, e.clientY - rect.top));
      if (type === 'slice') {
        const raw = Math.round((!inv ? y : rh - y) / rh * natH);
        // Safe clamp: top + bottom < natH - 4
        const maxVal = idx === 0 
          ? Math.max(0, natH - currentComp.slice[2] - 4)
          : Math.max(0, natH - currentComp.slice[0] - 4);
        onUpdateSlice(idx, Math.min(maxVal, Math.max(0, raw)));
      } else {
        const raw = Math.round((!inv ? y : rh - y) / rh * natH * 0.4);
        onUpdatePad(idx, Math.max(0, raw));
      }
    } else {
      const x = Math.max(0, Math.min(rw, e.clientX - rect.left));
      if (type === 'slice') {
        const raw = Math.round((!inv ? x : rw - x) / rw * natW);
        // Safe clamp: left + right < natW - 4
        const maxVal = idx === 3
          ? Math.max(0, natW - currentComp.slice[1] - 4)
          : Math.max(0, natW - currentComp.slice[3] - 4);
        onUpdateSlice(idx, Math.min(maxVal, Math.max(0, raw)));
      } else {
        const raw = Math.round((!inv ? x : rw - x) / rw * natW * 0.4);
        onUpdatePad(idx, Math.max(0, raw));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragRef.current) {
      activeDragRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const handleStageTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeDragRef.current || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const { rw, rh, natW, natH } = imgDim;
    if (cx < 0 || cx > rw || cy < 0 || cy > rh) return;

    const isSlice = activeMode === 's';
    const dt = cy,
      db = rh - cy,
      dl = cx,
      dr = rw - cx;
    const min = Math.min(dt, db, dl, dr);

    let idx = 0;
    let val = 0;
    if (min === dt) {
      idx = 0;
      val = Math.max(0, Math.round((cy / rh * natH) * (isSlice ? 1 : 0.4)));
    } else if (min === db) {
      idx = 2;
      val = Math.max(0, Math.round(((rh - cy) / rh * natH) * (isSlice ? 1 : 0.4)));
    } else if (min === dl) {
      idx = 3;
      val = Math.max(0, Math.round((cx / rw * natW) * (isSlice ? 1 : 0.4)));
    } else {
      idx = 1;
      val = Math.max(0, Math.round(((rw - cx) / rw * natW) * (isSlice ? 1 : 0.4)));
    }

    if (isSlice) {
      onUpdateSlice(idx, val);
    } else {
      onUpdatePad(idx, val);
    }
  };

  const { rw, rh, natW, natH } = imgDim;
  const sT = natH > 0 ? (currentComp.slice[0] / natH) * rh : 0;
  const sR = natW > 0 ? (currentComp.slice[1] / natW) * rw : 0;
  const sB = natH > 0 ? (currentComp.slice[2] / natH) * rh : 0;
  const sL = natW > 0 ? (currentComp.slice[3] / natW) * rw : 0;

  // Scale padding cleanly to display on canvas
  const cT = natH > 0 ? Math.min(rh * 0.45, (currentComp.pad[0] / (natH * 0.4)) * rh) : 0;
  const cR = natW > 0 ? Math.min(rw * 0.45, (currentComp.pad[1] / (natW * 0.4)) * rw) : 0;
  const cB = natH > 0 ? Math.min(rh * 0.45, (currentComp.pad[2] / (natH * 0.4)) * rh) : 0;
  const cL = natW > 0 ? Math.min(rw * 0.45, (currentComp.pad[3] / (natW * 0.4)) * rw) : 0;

  const isSliceMode = activeMode === 's';

  const roleLabel = activeRole === 'ai' ? '对方 (AI)' : '己方 (用户)';
  const compLabel = activeComp === 'bubble' ? '💬 气泡' : activeComp === 'voice' ? '🎙️ 语音条' : '💰 转账卡';

  return (
    <div id="slicing-canvas-card" className="bg-white rounded-xl p-4 border-2 border-black shadow-[3px_3px_0px_#000] mb-4">
      {/* 顶部指示条 */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-black">正在编辑：</span>
          <span className="text-xs font-black px-2 py-0.5 bg-black text-white rounded">
            {roleLabel} · {compLabel}
          </span>
          {activeComp !== 'bubble' && isComponentDirty && onResetComponent && (
            <button
              type="button"
              onClick={onResetComponent}
              className="text-[11px] font-bold text-gray-500 hover:text-red-600 flex items-center gap-1 ml-2 transition-colors"
              title="重置为继承气泡切片参数"
            >
              <RefreshCw className="w-3 h-3" />
              <span>恢复继承气泡</span>
            </button>
          )}
        </div>
        <span className="text-[10px] text-gray-500 font-bold">
          原图尺寸: {natW} × {natH}
        </span>
      </div>

      {/* 规则小贴士 - Clean Minimalism */}
      <div id="rule-tip" className="bg-amber-100 border-2 border-black text-black text-xs font-bold px-3.5 py-2.5 rounded-lg mb-3 leading-relaxed shadow-[2px_2px_0px_#000]">
        💡 <b className="font-black">切片法则</b>：红线外侧四角为「固定不拉伸区」；中间红框为纯色拉伸区以容纳文字与图元。可直接点击或拖动画布上的标线调整！
      </div>

      {/* Stage Canvas */}
      <div
        id="canvas-stage"
        ref={stageRef}
        onClick={handleStageTap}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full h-64 bg-[#f0f2f5] rounded-xl flex items-center justify-center overflow-hidden touch-none border-2 border-black select-none cursor-crosshair shadow-inner"
        style={{
          backgroundImage:
            'repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%)',
          backgroundPosition: '50%',
          backgroundSize: '16px 16px',
        }}
      >
        <div id="img-wrapper" className="relative inline-block">
          <img
            id="main-slicing-img"
            ref={imgRef}
            src={currentComp.url}
            alt="Component slice material"
            onLoad={updateDimensions}
            className="block max-w-[240px] max-h-[210px] pointer-events-none select-none object-contain"
          />

          {/* 固定角 Zones (Slice Mode) */}
          {isSliceMode && (
            <>
              <div
                id="cz-tl"
                className="absolute bg-neutral-900/10 border border-dotted border-black/50 pointer-events-none z-2 flex items-center justify-center text-[9px] text-black font-bold"
                style={{ top: 0, left: 0, width: sL, height: sT }}
              >
                角
              </div>
              <div
                id="cz-tr"
                className="absolute bg-neutral-900/10 border border-dotted border-black/50 pointer-events-none z-2 flex items-center justify-center text-[9px] text-black font-bold"
                style={{ top: 0, left: rw - sR, width: sR, height: sT }}
              >
                角
              </div>
              <div
                id="cz-bl"
                className="absolute bg-neutral-900/10 border border-dotted border-black/50 pointer-events-none z-2 flex items-center justify-center text-[9px] text-black font-bold"
                style={{ top: rh - sB, left: 0, width: sL, height: sB }}
              >
                角
              </div>
              <div
                id="cz-br"
                className="absolute bg-neutral-900/10 border border-dotted border-black/50 pointer-events-none z-2 flex items-center justify-center text-[9px] text-black font-bold"
                style={{ top: rh - sB, left: rw - sR, width: sR, height: sB }}
              >
                角
              </div>
              {/* 中心拉伸区 */}
              <div
                id="zone-stretch"
                className="absolute bg-red-500/20 border-2 border-dashed border-red-600 pointer-events-none z-3 flex items-center justify-center text-[10px] text-red-700 font-black"
                style={{
                  top: sT,
                  left: sL,
                  width: Math.max(0, rw - sL - sR),
                  height: Math.max(0, rh - sT - sB),
                }}
              >
                纯色拉伸区
              </div>
            </>
          )}

          {/* 绿色内容区 (Content Padding Mode) */}
          {!isSliceMode && (
            <div
              id="zone-content"
              className="absolute bg-emerald-500/20 border-2 border-dashed border-emerald-600 pointer-events-none z-4 flex items-center justify-center text-[10px] text-emerald-800 font-black"
              style={{
                top: cT,
                left: cL,
                width: Math.max(0, rw - cL - cR),
                height: Math.max(0, rh - cT - cB),
              }}
            >
              文字留白区
            </div>
          )}

          {/* 🔴 拉伸线 Handles (Slice Mode) */}
          {isSliceMode && (
            <>
              {/* Top Slice Line */}
              <div
                id="line-s-top"
                className="absolute -left-3 -right-3 h-[2px] bg-red-600 z-10 touch-none cursor-row-resize"
                style={{ top: sT }}
                onPointerDown={(e) => handlePointerDown(e, 'slice', 0, 'y', false)}
              >
                <div className="absolute w-full h-10 -top-5 left-0 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white bg-red-600 border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000] pointer-events-none whitespace-nowrap">
                    拉伸上 {currentComp.slice[0]}px
                  </span>
                </div>
              </div>

              {/* Bottom Slice Line */}
              <div
                id="line-s-bottom"
                className="absolute -left-3 -right-3 h-[2px] bg-red-600 z-10 touch-none cursor-row-resize"
                style={{ top: Math.max(0, rh - sB) }}
                onPointerDown={(e) => handlePointerDown(e, 'slice', 2, 'y', true)}
              >
                <div className="absolute w-full h-10 -top-5 left-0 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white bg-red-600 border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000] pointer-events-none whitespace-nowrap">
                    拉伸下 {currentComp.slice[2]}px
                  </span>
                </div>
              </div>

              {/* Left Slice Line */}
              <div
                id="line-s-left"
                className="absolute -top-3 -bottom-3 w-[2px] bg-red-600 z-10 touch-none cursor-col-resize"
                style={{ left: sL }}
                onPointerDown={(e) => handlePointerDown(e, 'slice', 3, 'x', false)}
              >
                <div className="absolute h-full w-10 -left-5 top-0 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white bg-red-600 border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000] pointer-events-none whitespace-nowrap">
                    拉伸左 {currentComp.slice[3]}px
                  </span>
                </div>
              </div>

              {/* Right Slice Line */}
              <div
                id="line-s-right"
                className="absolute -top-3 -bottom-3 w-[2px] bg-red-600 z-10 touch-none cursor-col-resize"
                style={{ left: Math.max(0, rw - sR) }}
                onPointerDown={(e) => handlePointerDown(e, 'slice', 1, 'x', true)}
              >
                <div className="absolute h-full w-10 -left-5 top-0 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white bg-red-600 border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000] pointer-events-none whitespace-nowrap">
                    拉伸右 {currentComp.slice[1]}px
                  </span>
                </div>
              </div>
            </>
          )}

          {/* 🟢 内容留白线 Handles (Padding Mode) */}
          {!isSliceMode && (
            <>
              {/* Top Pad Line */}
              <div
                id="line-c-top"
                className="absolute -left-3 -right-3 h-[2px] bg-emerald-600 z-10 touch-none cursor-row-resize"
                style={{ top: cT }}
                onPointerDown={(e) => handlePointerDown(e, 'pad', 0, 'y', false)}
              >
                <div className="absolute w-full h-10 -top-5 left-0 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white bg-emerald-700 border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000] pointer-events-none whitespace-nowrap">
                    留白上 {currentComp.pad[0]}px
                  </span>
                </div>
              </div>

              {/* Bottom Pad Line */}
              <div
                id="line-c-bottom"
                className="absolute -left-3 -right-3 h-[2px] bg-emerald-600 z-10 touch-none cursor-row-resize"
                style={{ top: Math.max(0, rh - cB) }}
                onPointerDown={(e) => handlePointerDown(e, 'pad', 2, 'y', true)}
              >
                <div className="absolute w-full h-10 -top-5 left-0 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white bg-emerald-700 border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000] pointer-events-none whitespace-nowrap">
                    留白下 {currentComp.pad[2]}px
                  </span>
                </div>
              </div>

              {/* Left Pad Line */}
              <div
                id="line-c-left"
                className="absolute -top-3 -bottom-3 w-[2px] bg-emerald-600 z-10 touch-none cursor-col-resize"
                style={{ left: cL }}
                onPointerDown={(e) => handlePointerDown(e, 'pad', 3, 'x', false)}
              >
                <div className="absolute h-full w-10 -left-5 top-0 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white bg-emerald-700 border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000] pointer-events-none whitespace-nowrap">
                    留白左 {currentComp.pad[3]}px
                  </span>
                </div>
              </div>

              {/* Right Pad Line */}
              <div
                id="line-c-right"
                className="absolute -top-3 -bottom-3 w-[2px] bg-emerald-600 z-10 touch-none cursor-col-resize"
                style={{ left: Math.max(0, rw - cR) }}
                onPointerDown={(e) => handlePointerDown(e, 'pad', 1, 'x', true)}
              >
                <div className="absolute h-full w-10 -left-5 top-0 flex items-center justify-center">
                  <span className="text-[9px] font-black text-white bg-emerald-700 border border-black px-2 py-0.5 rounded shadow-[1px_1px_0px_#000] pointer-events-none whitespace-nowrap">
                    留白右 {currentComp.pad[1]}px
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stepper Controls - Clean Minimalism */}
      <div className="mt-4">
        <div className="text-xs font-black flex items-center gap-1.5 mb-2.5">
          {isSliceMode ? (
            <span className="text-black flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block border border-black" />
              边框切片微调 (Slice 像素)
            </span>
          ) : (
            <span className="text-black flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block border border-black" />
              内边距留白微调 (Padding 像素)
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
          {([
            { zh: '上', en: 'Top', idx: 0 },
            { zh: '右', en: 'Right', idx: 1 },
            { zh: '下', en: 'Bottom', idx: 2 },
            { zh: '左', en: 'Left', idx: 3 },
          ] as const).map(({ zh, en, idx }) => {
            const val = isSliceMode ? currentComp.slice[idx] : currentComp.pad[idx];
            const updateFn = isSliceMode ? onUpdateSlice : onUpdatePad;
            const label = `${zh} (${en})`;

            return (
              <div
                key={en}
                className="flex flex-col items-center justify-between bg-white border-2 border-black rounded-xl p-1.5 sm:p-2.5 shadow-[2px_2px_0px_#000] overflow-hidden min-w-0"
              >
                {/* 标题 */}
                <div className="text-[11px] font-black text-gray-800 flex items-center justify-center gap-0.5 whitespace-nowrap mb-1">
                  <span>{zh}</span>
                  <span className="text-[9px] text-gray-400 font-bold hidden sm:inline">({en})</span>
                </div>

                {/* 移动端 (垂直双层: 上数值/下并排按钮) vs 桌面端 (经典水平排布: [ - ] 数值 [ + ]) */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-0">
                  {/* 移动端专属居中输入框 */}
                  <div className="w-full flex sm:hidden items-center justify-center">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => updateFn(idx, Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-center text-xs font-black text-black bg-slate-100/90 border border-black/25 rounded py-0.5 focus:outline-none focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  {/* 按钮控制组 */}
                  <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between w-full gap-1 sm:gap-0">
                    <button
                      type="button"
                      onClick={() => updateFn(idx, Math.max(0, val - 1))}
                      className="w-full sm:w-7 h-6 sm:h-7 flex-shrink-0 flex items-center justify-center rounded-md sm:rounded-lg border-1.5 sm:border-2 border-black bg-white hover:bg-black hover:text-white text-black font-black shadow-[1px_1px_0px_#000] sm:shadow-[1.5px_1.5px_0px_#000] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none transition-all touch-manipulation"
                      aria-label={`减少 ${label}`}
                    >
                      <Minus className="w-3.5 h-3.5 flex-shrink-0" />
                    </button>

                    {/* 桌面端居中输入框 */}
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => updateFn(idx, Math.max(0, parseInt(e.target.value) || 0))}
                      className="hidden sm:block w-10 text-center text-xs font-black text-black bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <button
                      type="button"
                      onClick={() => updateFn(idx, val + 1)}
                      className="w-full sm:w-7 h-6 sm:h-7 flex-shrink-0 flex items-center justify-center rounded-md sm:rounded-lg border-1.5 sm:border-2 border-black bg-white hover:bg-black hover:text-white text-black font-black shadow-[1px_1px_0px_#000] sm:shadow-[1.5px_1.5px_0px_#000] active:translate-x-[0.5px] active:translate-y-[0.5px] active:shadow-none transition-all touch-manipulation"
                      aria-label={`增加 ${label}`}
                    >
                      <Plus className="w-3.5 h-3.5 flex-shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 实时单体切片镜像反馈 (一边调参一边眼皮底下的实时零延迟渲染) */}
      <div className="mt-3.5 pt-3 border-t-2 border-black/10">
        <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
          <span className="text-[11px] font-black text-black flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span>当前组件即时拉伸效果 (动态 1:1 镜像)</span>
          </span>
          <span className="text-[10px] text-gray-500 font-bold whitespace-nowrap">
            随上方拖拽 / 加减实时刷新
          </span>
        </div>

        <div className="bg-[#f0f2f5] p-3 rounded-xl border-2 border-black/30 flex items-center justify-center min-h-[70px] overflow-hidden">
          {activeComp === 'bubble' && (
            (exportType === 'sully' || exportType === 'float') ? (
              <div
                className="box-border w-fit max-w-full text-xs font-medium select-none"
                style={{
                  borderStyle: 'solid',
                  borderColor: 'transparent',
                  borderImageRepeat: 'stretch',
                  borderImageSource: `url('${currentComp.url}')`,
                  borderImageSlice: `${currentComp.slice[0]} ${currentComp.slice[1]} ${currentComp.slice[2]} ${currentComp.slice[3]} fill`,
                  borderWidth: `${calcSafeBw(currentComp.slice)[0]}px ${calcSafeBw(currentComp.slice)[1]}px ${calcSafeBw(currentComp.slice)[2]}px ${calcSafeBw(currentComp.slice)[3]}px`,
                  borderImageWidth: currentComp.patternScale,
                  padding: `${currentComp.pad[0]}px ${currentComp.pad[1]}px ${currentComp.pad[2]}px ${currentComp.pad[3]}px`,
                  color: textColor,
                }}
              >
                即时预览切片：角落不被拉伸，中间平滑扩展
              </div>
            ) : (
              <div
                className="relative z-1 box-border w-fit max-w-full text-xs font-medium select-none"
                style={{
                  padding: `${currentComp.pad[0]}px ${currentComp.pad[1]}px ${currentComp.pad[2]}px ${currentComp.pad[3]}px`,
                  color: textColor,
                }}
              >
                <div
                  className="absolute inset-0 -z-1 pointer-events-none"
                  style={{
                    borderStyle: 'solid',
                    borderColor: 'transparent',
                    borderImageRepeat: 'stretch',
                    borderImageSource: `url('${currentComp.url}')`,
                    borderImageSlice: `${currentComp.slice[0]} ${currentComp.slice[1]} ${currentComp.slice[2]} ${currentComp.slice[3]} fill`,
                    borderWidth: `${calcSafeBw(currentComp.slice)[0]}px ${calcSafeBw(currentComp.slice)[1]}px ${calcSafeBw(currentComp.slice)[2]}px ${calcSafeBw(currentComp.slice)[3]}px`,
                    borderImageWidth: currentComp.patternScale,
                  }}
                />
                即时预览切片：角落不被拉伸，中间平滑扩展
              </div>
            )
          )}

          {activeComp === 'voice' && (
            <div
              className="flex items-center gap-2 cursor-pointer w-44 h-8 text-xs font-bold select-none"
              style={{
                position: 'relative',
                boxSizing: 'border-box',
                borderStyle: 'solid',
                borderColor: 'transparent',
                borderWidth: `${calcSafeBw(currentComp.slice)[0]}px ${calcSafeBw(currentComp.slice)[1]}px ${calcSafeBw(currentComp.slice)[2]}px ${calcSafeBw(currentComp.slice)[3]}px`,
                borderImageSource: `url('${currentComp.url}')`,
                borderImageSlice: `${currentComp.slice[0]} ${currentComp.slice[1]} ${currentComp.slice[2]} ${currentComp.slice[3]} fill`,
                borderImageRepeat: 'stretch',
                borderImageWidth: currentComp.patternScale,
                padding: `${currentComp.pad[0]}px ${currentComp.pad[1]}px ${currentComp.pad[2]}px ${currentComp.pad[3]}px`,
                color: textColor,
              }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
              >
                <div className="w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-current ml-0.5" />
              </div>
              <div className="flex items-center gap-0.5 flex-1">
                {[8, 14, 10, 16, 12, 18, 14, 10].map((h, idx) => (
                  <span
                    key={idx}
                    className="w-0.5 rounded-full"
                    style={{ height: `${h}px`, backgroundColor: textColor }}
                  />
                ))}
              </div>
              <span>4"</span>
            </div>
          )}

          {activeComp === 'transfer' && (
            <div
              className="w-60 text-xs select-none"
              style={{
                position: 'relative',
                boxSizing: 'border-box',
                borderStyle: 'solid',
                borderColor: 'transparent',
                borderWidth: `${calcSafeBw(currentComp.slice)[0]}px ${calcSafeBw(currentComp.slice)[1]}px ${calcSafeBw(currentComp.slice)[2]}px ${calcSafeBw(currentComp.slice)[3]}px`,
                borderImageSource: `url('${currentComp.url}')`,
                borderImageSlice: `${currentComp.slice[0]} ${currentComp.slice[1]} ${currentComp.slice[2]} ${currentComp.slice[3]} fill`,
                borderImageRepeat: 'stretch',
                borderImageWidth: currentComp.patternScale,
                padding: `${currentComp.pad[0]}px ${currentComp.pad[1]}px ${currentComp.pad[2]}px ${currentComp.pad[3]}px`,
                color: textColor,
              }}
            >
              <div className="flex items-center gap-2 pb-1.5 border-b border-black/10">
                <div
                  className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ border: `1.5px solid ${textColor}`, color: textColor }}
                >
                  ¥
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[11px]" style={{ color: textColor }}>
                    微信转账 ({activeRole === 'ai' ? '对方' : '我方'})
                  </span>
                  <span className="text-sm font-black" style={{ color: textColor }}>
                    ¥ 520.00
                  </span>
                </div>
              </div>
              <div className="pt-1 text-[9px] opacity-75 font-semibold" style={{ color: textColor }}>
                卡片切片实时渲染正常
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
