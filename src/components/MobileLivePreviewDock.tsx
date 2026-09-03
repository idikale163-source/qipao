import React, { useState } from 'react';
import { ActiveComponent, ActiveRole, AppConfig, ExportType } from '../types';
import { calcSafeBw, calcTransferBw } from '../utils/cssGenerator';
import {
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Layers,
  Smartphone,
  Eye,
  X,
  Play,
  Pause,
} from 'lucide-react';

export type MobileViewMode = 'split' | 'float' | 'scroll';

interface MobileLivePreviewDockProps {
  config: AppConfig;
  activeRole: ActiveRole;
  activeComponent: ActiveComponent;
  exportType: ExportType;
  mobileViewMode: MobileViewMode;
  onSelectMobileViewMode: (mode: MobileViewMode) => void;
  onSelectExportType: (type: ExportType) => void;
  onSelectComponent: (comp: ActiveComponent, role: ActiveRole) => void;
}

export const MobileLivePreviewDock: React.FC<MobileLivePreviewDockProps> = ({
  config,
  activeRole,
  activeComponent,
  exportType,
  mobileViewMode,
  onSelectMobileViewMode,
  onSelectExportType,
  onSelectComponent,
}) => {
  const { ai, user } = config;
  const isDirectBorderModel = exportType === 'sully' || exportType === 'float';

  // Sub-view in dock: 'focus' (single active item) vs 'chat' (full dialogue)
  const [dockTab, setDockTab] = useState<'focus' | 'chat'>('focus');
  // Dock height in split mode: 'compact' (150px) | 'normal' (230px) | 'tall' (330px) | 'collapsed' (44px)
  const [dockHeight, setDockHeight] = useState<'compact' | 'normal' | 'tall' | 'collapsed'>('normal');
  // Quick test text
  const [testText, setTestText] = useState('好哦，我收到啦！');
  // Float window minimized
  const [floatMinimized, setFloatMinimized] = useState(false);
  // Audio state
  const [isPlayingAi, setIsPlayingAi] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);

  const bwAi = calcSafeBw(ai.slice);
  const bwUser = calcSafeBw(user.slice);

  const currentRoleData = activeRole === 'ai' ? ai : user;
  const currentCompData =
    activeComponent === 'bubble'
      ? { url: currentRoleData.url, slice: currentRoleData.slice, pad: currentRoleData.pad, patternScale: currentRoleData.patternScale }
      : currentRoleData[activeComponent] || {
          url: currentRoleData.url,
          slice: currentRoleData.slice,
          pad: activeComponent === 'voice' ? [0, 8, 1, 8] : [6, 12, 6, 12],
          patternScale: currentRoleData.patternScale,
        };

  const currentBw =
    activeComponent === 'transfer'
      ? calcTransferBw(currentCompData.slice)
      : calcSafeBw(currentCompData.slice);

  // Height class mapping
  const heightStyle =
    dockHeight === 'collapsed'
      ? 'h-[44px]'
      : dockHeight === 'compact'
      ? 'h-[160px]'
      : dockHeight === 'tall'
      ? 'h-[330px]'
      : 'h-[235px]';

  // Render bubble helper
  const renderBubbleItem = (
    role: 'ai' | 'user',
    text: string,
    isFocusItem = false
  ) => {
    const roleData = role === 'ai' ? ai : user;
    const bw = role === 'ai' ? bwAi : bwUser;

    if (isDirectBorderModel) {
      return (
        <div
          onClick={() => onSelectComponent('bubble', role)}
          className={`box-border w-fit max-w-[85%] text-xs leading-[1.3] break-words whitespace-pre-wrap cursor-pointer transition-all ${
            activeRole === role && activeComponent === 'bubble'
              ? 'ring-2 ring-black ring-offset-1 scale-[1.01]'
              : 'opacity-95'
          }`}
          style={{
            borderStyle: 'solid',
            borderColor: 'transparent',
            borderWidth: `${bw[0]}px ${bw[1]}px ${bw[2]}px ${bw[3]}px`,
            borderImageSource: `url('${roleData.url}')`,
            borderImageSlice: `${roleData.slice[0]} ${roleData.slice[1]} ${roleData.slice[2]} ${roleData.slice[3]} fill`,
            borderImageRepeat: 'stretch',
            borderImageWidth: roleData.patternScale,
            padding: `${roleData.pad[0]}px ${roleData.pad[1]}px ${roleData.pad[2]}px ${roleData.pad[3]}px`,
            color: roleData.textColor,
            wordBreak: 'break-word',
          }}
        >
          {exportType === 'float' ? (
            <div className="chat-markdown">
              <p className="m-0 leading-snug">{text}</p>
            </div>
          ) : (
            <span>{text}</span>
          )}
        </div>
      );
    }

    // LINK isolated model
    return (
      <div
        onClick={() => onSelectComponent('bubble', role)}
        className={`relative z-1 box-border w-fit max-w-[85%] bg-transparent border-none text-xs leading-[1.3] break-words whitespace-pre-wrap cursor-pointer transition-all ${
          activeRole === role && activeComponent === 'bubble'
            ? 'ring-2 ring-black ring-offset-1 scale-[1.01]'
            : 'opacity-95'
        }`}
        style={{
          padding: `${roleData.pad[0]}px ${roleData.pad[1]}px ${roleData.pad[2]}px ${roleData.pad[3]}px`,
          color: roleData.textColor,
        }}
      >
        <div
          className="absolute inset-0 -z-1 pointer-events-none"
          style={{
            borderStyle: 'solid',
            borderColor: 'transparent',
            borderImageRepeat: 'stretch',
            borderImageSource: `url('${roleData.url}')`,
            borderImageSlice: `${roleData.slice[0]} ${roleData.slice[1]} ${roleData.slice[2]} ${roleData.slice[3]} fill`,
            borderWidth: `${bw[0]}px ${bw[1]}px ${bw[2]}px ${bw[3]}px`,
            borderImageWidth: roleData.patternScale,
          }}
        />
        <span>{text}</span>
      </div>
    );
  };

  // IF SCROLL MODE: just show an unobtrusive mini toggle bar on mobile
  if (mobileViewMode === 'scroll') {
    return (
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b-2 border-black p-2 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black" />
          <span className="text-[11px] font-black text-black">
            当前：普通长页模式
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectMobileViewMode('split')}
            className="text-[10px] font-black bg-black text-white px-2 py-1 rounded border border-black shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1"
          >
            <Smartphone className="w-3 h-3 text-emerald-400" />
            <span>开启边调边看 (吸顶分屏)</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectMobileViewMode('float')}
            className="text-[10px] font-black bg-neutral-100 text-black px-2 py-1 rounded border border-black hover:bg-neutral-200"
          >
            悬浮小窗
          </button>
        </div>
      </div>
    );
  }

  // IF FLOAT MODE: render hovering picture-in-picture widget
  if (mobileViewMode === 'float') {
    return (
      <>
        {/* Floating Mini PIP in bottom right */}
        <div className="md:hidden fixed bottom-4 right-3 z-50 flex flex-col items-end">
          {floatMinimized ? (
            <button
              type="button"
              onClick={() => setFloatMinimized(false)}
              className="bg-black text-white border-2 border-black rounded-full px-3 py-2 shadow-[2px_2px_0px_#000] text-xs font-black flex items-center gap-1.5 animate-bounce"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>展开即时预览</span>
            </button>
          ) : (
            <div className="bg-white border-2 border-black rounded-xl p-2.5 shadow-[3px_3px_0px_#000] w-[270px] max-w-[90vw] flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black" />
                  <span className="text-[11px] font-black text-black">
                    {activeRole === 'ai' ? 'AI' : '我方'} {activeComponent === 'bubble' ? '气泡' : activeComponent === 'voice' ? '语音' : '转账'}
                  </span>
                  <span className="text-[9px] bg-black text-white px-1 py-0.2 rounded font-bold">
                    {exportType.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSelectMobileViewMode('split')}
                    className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200"
                    title="切换到吸顶分屏模式"
                  >
                    切分屏
                  </button>
                  <button
                    type="button"
                    onClick={() => setFloatMinimized(true)}
                    className="p-1 text-gray-500 hover:text-black"
                  >
                    <Minimize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Mini rendering */}
              <div className="bg-[#f0f2f5] p-2.5 rounded-lg border border-black/20 flex items-center justify-center min-h-[60px] overflow-hidden">
                {activeComponent === 'bubble' && renderBubbleItem(activeRole, testText, true)}
                {activeComponent === 'voice' && (
                  <div
                    className="flex items-center gap-2 cursor-pointer w-40 h-7 text-[11px] font-bold select-none"
                    style={{
                      borderStyle: 'solid',
                      borderColor: 'transparent',
                      borderWidth: `${currentBw[0]}px ${currentBw[1]}px ${currentBw[2]}px ${currentBw[3]}px`,
                      borderImageSource: `url('${currentCompData.url}')`,
                      borderImageSlice: `${currentCompData.slice[0]} ${currentCompData.slice[1]} ${currentCompData.slice[2]} ${currentCompData.slice[3]} fill`,
                      borderImageRepeat: 'stretch',
                      borderImageWidth: currentCompData.patternScale,
                      padding: `${currentCompData.pad[0]}px ${currentCompData.pad[1]}px ${currentCompData.pad[2]}px ${currentCompData.pad[3]}px`,
                      color: currentRoleData.textColor,
                    }}
                  >
                    <div className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center">
                      <Play className="w-2.5 h-2.5" />
                    </div>
                    <div className="flex items-center gap-0.5 flex-1">
                      {[6, 12, 8, 14, 10, 16, 10].map((h, i) => (
                        <span key={i} className="w-0.5 rounded-full" style={{ height: `${h}px`, backgroundColor: currentRoleData.textColor }} />
                      ))}
                    </div>
                    <span>4"</span>
                  </div>
                )}
                {activeComponent === 'transfer' && (
                  <div
                    className="w-48 text-[11px] select-none p-1"
                    style={{
                      borderStyle: 'solid',
                      borderColor: 'transparent',
                      borderWidth: `${currentBw[0]}px ${currentBw[1]}px ${currentBw[2]}px ${currentBw[3]}px`,
                      borderImageSource: `url('${currentCompData.url}')`,
                      borderImageSlice: `${currentCompData.slice[0]} ${currentCompData.slice[1]} ${currentCompData.slice[2]} ${currentCompData.slice[3]} fill`,
                      borderImageRepeat: 'stretch',
                      borderImageWidth: currentCompData.patternScale,
                      padding: `${currentCompData.pad[0]}px ${currentCompData.pad[1]}px ${currentCompData.pad[2]}px ${currentCompData.pad[3]}px`,
                      color: currentRoleData.textColor,
                    }}
                  >
                    <div className="flex items-center gap-1.5 pb-1 border-b border-black/10">
                      <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center font-bold text-[10px]" style={{ color: currentRoleData.textColor }}>¥</div>
                      <span className="font-bold text-[10px]" style={{ color: currentRoleData.textColor }}>微信转账 ¥520</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // DEFAULT: SPLIT DOCK MODE (吸顶分屏模式)
  return (
    <div
      id="mobile-live-preview-dock"
      className="md:hidden sticky top-0 z-40 bg-white border-b-2 border-black shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-all flex flex-col"
    >
      {/* 顶部控制与模式栏 */}
      <div className="px-2.5 py-1.5 flex items-center justify-between border-b border-gray-200 bg-neutral-50 gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-black shrink-0" />
          <span className="text-[11px] font-black text-black flex items-center gap-1">
            <span>边调边看</span>
            <span className="text-[9px] bg-black text-white px-1 py-0.5 rounded font-bold">
              {activeRole === 'ai' ? '对方AI' : '我方'}·{activeComponent === 'bubble' ? '气泡' : activeComponent === 'voice' ? '语音' : '转账'}
            </span>
          </span>
        </div>

        {/* 视窗视图切换：单体聚焦 vs 真实聊天流 */}
        <div className="flex items-center gap-1">
          <div className="flex bg-[#e5e7eb] p-0.5 border border-black rounded-md">
            <button
              type="button"
              onClick={() => setDockTab('focus')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-all ${
                dockTab === 'focus' ? 'bg-black text-white' : 'text-gray-700'
              }`}
            >
              聚焦
            </button>
            <button
              type="button"
              onClick={() => setDockTab('chat')}
              className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-all ${
                dockTab === 'chat' ? 'bg-black text-white' : 'text-gray-700'
              }`}
            >
              对话
            </button>
          </div>

          {/* 平台模型 */}
          <div className="flex bg-[#e5e7eb] p-0.5 border border-black rounded-md">
            {(['sully', 'float', 'link'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onSelectExportType(p)}
                className={`px-1 py-0.5 rounded text-[9px] font-black transition-all ${
                  exportType === p ? 'bg-black text-white' : 'text-gray-700'
                }`}
              >
                {p === 'sully' ? 'Sully' : p === 'float' ? 'Float' : 'LINK'}
              </button>
            ))}
          </div>

          {/* 高度调节 */}
          <button
            type="button"
            onClick={() => {
              if (dockHeight === 'collapsed') setDockHeight('normal');
              else if (dockHeight === 'normal') setDockHeight('tall');
              else if (dockHeight === 'tall') setDockHeight('compact');
              else setDockHeight('collapsed');
            }}
            className="p-1 border border-black bg-white rounded text-[10px] font-black hover:bg-gray-100 flex items-center gap-0.5"
            title="调节预览视窗高度"
          >
            {dockHeight === 'collapsed' ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
            <span className="text-[9px]">
              {dockHeight === 'collapsed' ? '展开' : dockHeight === 'compact' ? '小' : dockHeight === 'tall' ? '大' : '中'}
            </span>
          </button>

          {/* 模式切回 */}
          <button
            type="button"
            onClick={() => onSelectMobileViewMode('scroll')}
            className="text-[9px] font-bold text-gray-500 hover:text-black px-1"
            title="关闭吸顶分屏，回到普通页面滚动"
          >
            收起
          </button>
        </div>
      </div>

      {/* 展开内容区 */}
      {dockHeight !== 'collapsed' && (
        <div className={`${heightStyle} bg-[#f0f2f5] p-2 overflow-y-auto relative border-inner select-none transition-all`}>
          {dockTab === 'focus' ? (
            /* 1. 单体高频调试沙盒 */
            <div className="h-full flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-gray-600">快速字数测试:</span>
                  {(['好', '收到！', '好的，切片完全对齐', '这是超长段落测试文字，用于验证移动端多行换行与边缘间距是否对称'] as const).map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setTestText(sample)}
                      className="text-[9px] font-bold bg-white border border-black/40 px-1.5 py-0.5 rounded hover:bg-black hover:text-white transition-colors"
                    >
                      {sample.length <= 3 ? sample : `${sample.slice(0, 3)}..`}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] font-bold text-gray-500">
                  边框厚度: {currentBw.join('/')}px
                </span>
              </div>

              {/* 实时渲染居中展示 */}
              <div className="flex-1 flex items-center justify-center p-2">
                {activeComponent === 'bubble' && renderBubbleItem(activeRole, testText, true)}

                {activeComponent === 'voice' && (
                  <div
                    onClick={() => {
                      if (activeRole === 'ai') setIsPlayingAi(!isPlayingAi);
                      else setIsPlayingUser(!isPlayingUser);
                    }}
                    className="flex items-center gap-2 cursor-pointer w-48 h-8 text-xs font-bold select-none"
                    style={{
                      borderStyle: 'solid',
                      borderColor: 'transparent',
                      borderWidth: `${currentBw[0]}px ${currentBw[1]}px ${currentBw[2]}px ${currentBw[3]}px`,
                      borderImageSource: `url('${currentCompData.url}')`,
                      borderImageSlice: `${currentCompData.slice[0]} ${currentCompData.slice[1]} ${currentCompData.slice[2]} ${currentCompData.slice[3]} fill`,
                      borderImageRepeat: 'stretch',
                      borderImageWidth: currentCompData.patternScale,
                      padding: `${currentCompData.pad[0]}px ${currentCompData.pad[1]}px ${currentCompData.pad[2]}px ${currentCompData.pad[3]}px`,
                      color: currentRoleData.textColor,
                    }}
                  >
                    <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center">
                      {(activeRole === 'ai' ? isPlayingAi : isPlayingUser) ? (
                        <Pause className="w-3 h-3" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 flex-1">
                      {[8, 14, 10, 16, 12, 18, 14, 10].map((h, i) => (
                        <span key={i} className="w-0.5 rounded-full" style={{ height: `${h}px`, backgroundColor: currentRoleData.textColor }} />
                      ))}
                    </div>
                    <span>4"</span>
                  </div>
                )}

                {activeComponent === 'transfer' && (
                  <div
                    className="w-56 text-xs select-none"
                    style={{
                      borderStyle: 'solid',
                      borderColor: 'transparent',
                      borderWidth: `${currentBw[0]}px ${currentBw[1]}px ${currentBw[2]}px ${currentBw[3]}px`,
                      borderImageSource: `url('${currentCompData.url}')`,
                      borderImageSlice: `${currentCompData.slice[0]} ${currentCompData.slice[1]} ${currentCompData.slice[2]} ${currentCompData.slice[3]} fill`,
                      borderImageRepeat: 'stretch',
                      borderImageWidth: currentCompData.patternScale,
                      padding: `${currentCompData.pad[0]}px ${currentCompData.pad[1]}px ${currentCompData.pad[2]}px ${currentCompData.pad[3]}px`,
                      color: currentRoleData.textColor,
                    }}
                  >
                    <div className="flex items-center gap-2 pb-1 border-b border-black/10">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center font-bold text-xs" style={{ color: currentRoleData.textColor }}>¥</div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[10px]" style={{ color: currentRoleData.textColor }}>微信转账 ({activeRole === 'ai' ? '对方' : '我方'})</span>
                        <span className="text-xs font-black" style={{ color: currentRoleData.textColor }}>¥ 520.00</span>
                      </div>
                    </div>
                    <div className="pt-0.5 text-[8px] opacity-75 font-semibold" style={{ color: currentRoleData.textColor }}>
                      转账卡切片实时正常
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* 2. 真实聊天对话流 */
            <div className="flex flex-col gap-2">
              <div className="flex flex-col items-start max-w-[90%]">
                <span className="text-[9px] font-bold text-gray-500 mb-0.5">AI 对方</span>
                {renderBubbleItem('ai', '好哦，我已经收到了，切片样式很漂亮！')}
              </div>
              <div className="flex flex-col items-end self-end max-w-[90%]">
                <span className="text-[9px] font-bold text-gray-500 mb-0.5">我方短回复</span>
                {renderBubbleItem('user', '好')}
              </div>
              <div className="flex flex-col items-end self-end max-w-[90%]">
                <span className="text-[9px] font-bold text-gray-500 mb-0.5">我方正常消息</span>
                {renderBubbleItem('user', '今晚请你喝奶茶~')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
