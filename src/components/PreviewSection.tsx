import React, { useState } from 'react';
import { ActiveComponent, ActiveRole, AppConfig, ExportType } from '../types';
import { calcSafeBw, calcTransferBw } from '../utils/cssGenerator';
import { Play, Pause, X, ArrowRightLeft, MessageSquare, Maximize2, Layers } from 'lucide-react';

interface PreviewSectionProps {
  config: AppConfig;
  activeRole: ActiveRole;
  activeComponent?: ActiveComponent;
  exportType?: ExportType;
  onSelectExportType?: (type: ExportType) => void;
  onSelectComponent?: (comp: ActiveComponent, role: ActiveRole) => void;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  config,
  activeRole,
  activeComponent,
  exportType = 'sully',
  onSelectExportType,
  onSelectComponent,
}) => {
  const { ai, user } = config;
  const currentPlatform: ExportType = (exportType as ExportType) || 'sully';
  const isDirectBorderModel = currentPlatform === 'sully' || currentPlatform === 'float';

  const [isPlayingAi, setIsPlayingAi] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [modalRole, setModalRole] = useState<'ai' | 'user' | null>(null);
  const [previewTab, setPreviewTab] = useState<'chat' | 'stretch'>('chat');
  const [stretchWidth, setStretchWidth] = useState<number>(240);
  const [testCustomText, setTestCustomText] = useState<string>('这是一段测试文本，拉伸查看九宫格切片与内边距效果！');

  const bwAi = calcSafeBw(ai.slice);
  const bwUser = calcSafeBw(user.slice);

  const aiVoice = ai.voice || { url: ai.url, slice: ai.slice, pad: [6, 12, 6, 12], patternScale: 1.4 };
  const userVoice = user.voice || { url: user.url, slice: user.slice, pad: [6, 12, 6, 12], patternScale: 1.4 };
  const bwAiVoice = calcSafeBw(aiVoice.slice);
  const bwUserVoice = calcSafeBw(userVoice.slice);

  const aiTransfer = ai.transfer || { url: ai.url, slice: ai.slice, pad: [6, 14, 6, 14], patternScale: 1.4 };
  const userTransfer = user.transfer || { url: user.url, slice: user.slice, pad: [6, 14, 6, 14], patternScale: 1.4 };
  const bwAiTransfer = calcSafeBw(aiTransfer.slice);
  const bwUserTransfer = calcSafeBw(userTransfer.slice);

  // Active Role data
  const currentRoleData = activeRole === 'ai' ? ai : user;
  const currentCompData =
    activeComponent === 'voice'
      ? activeRole === 'ai' ? aiVoice : userVoice
      : activeComponent === 'transfer'
      ? activeRole === 'ai' ? aiTransfer : userTransfer
      : currentRoleData;
  const currentBw = calcSafeBw(currentCompData.slice);

  // AI Voice Bar Style (Independent 9-patch, no outset)
  const aiVoiceStyle: React.CSSProperties = {
    position: 'relative',
    boxSizing: 'border-box',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: `${bwAiVoice[0]}px ${bwAiVoice[1]}px ${bwAiVoice[2]}px ${bwAiVoice[3]}px`,
    borderImageSource: `url('${aiVoice.url}')`,
    borderImageSlice: `${aiVoice.slice[0]} ${aiVoice.slice[1]} ${aiVoice.slice[2]} ${aiVoice.slice[3]} fill`,
    borderImageRepeat: 'stretch',
    borderImageWidth: aiVoice.patternScale,
    padding: `${aiVoice.pad[0]}px ${aiVoice.pad[1]}px ${aiVoice.pad[2]}px ${aiVoice.pad[3]}px`,
    color: ai.textColor,
  };

  // User Voice Bar Style (Independent 9-patch, no outset)
  const userVoiceStyle: React.CSSProperties = {
    position: 'relative',
    boxSizing: 'border-box',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: `${bwUserVoice[0]}px ${bwUserVoice[1]}px ${bwUserVoice[2]}px ${bwUserVoice[3]}px`,
    borderImageSource: `url('${userVoice.url}')`,
    borderImageSlice: `${userVoice.slice[0]} ${userVoice.slice[1]} ${userVoice.slice[2]} ${userVoice.slice[3]} fill`,
    borderImageRepeat: 'stretch',
    borderImageWidth: userVoice.patternScale,
    padding: `${userVoice.pad[0]}px ${userVoice.pad[1]}px ${userVoice.pad[2]}px ${userVoice.pad[3]}px`,
    color: user.textColor,
  };

  const aiTransferTextColor = aiTransfer.url.includes('568a94')
    ? '#000000'
    : aiTransfer.url.includes('46882d')
    ? '#ffffff'
    : (ai.textColor || '#000000');
  const userTransferTextColor = userTransfer.url.includes('46882d')
    ? '#ffffff'
    : userTransfer.url.includes('568a94')
    ? '#000000'
    : (user.textColor || '#ffffff');

  // AI Transfer Card Style (Independent 9-patch, no outset)
  const aiTransferStyle: React.CSSProperties = {
    position: 'relative',
    boxSizing: 'border-box',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: `${bwAiTransfer[0]}px ${bwAiTransfer[1]}px ${bwAiTransfer[2]}px ${bwAiTransfer[3]}px`,
    borderImageSource: `url('${aiTransfer.url}')`,
    borderImageSlice: `${aiTransfer.slice[0]} ${aiTransfer.slice[1]} ${aiTransfer.slice[2]} ${aiTransfer.slice[3]} fill`,
    borderImageRepeat: 'stretch',
    borderImageWidth: aiTransfer.patternScale,
    padding: `${aiTransfer.pad[0]}px ${aiTransfer.pad[1]}px ${aiTransfer.pad[2]}px ${aiTransfer.pad[3]}px`,
    color: aiTransferTextColor,
  };

  // User Transfer Card Style (Independent 9-patch, no outset)
  const userTransferStyle: React.CSSProperties = {
    position: 'relative',
    boxSizing: 'border-box',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: `${bwUserTransfer[0]}px ${bwUserTransfer[1]}px ${bwUserTransfer[2]}px ${bwUserTransfer[3]}px`,
    borderImageSource: `url('${userTransfer.url}')`,
    borderImageSlice: `${userTransfer.slice[0]} ${userTransfer.slice[1]} ${userTransfer.slice[2]} ${userTransfer.slice[3]} fill`,
    borderImageRepeat: 'stretch',
    borderImageWidth: userTransfer.patternScale,
    padding: `${userTransfer.pad[0]}px ${userTransfer.pad[1]}px ${userTransfer.pad[2]}px ${userTransfer.pad[3]}px`,
    color: userTransferTextColor,
  };

  // AI Bubble direct style (Sully / Float: true single-element box model)
  const aiBubbleStyleDirect: React.CSSProperties = {
    position: 'relative',
    boxSizing: 'border-box',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: `${bwAi[0]}px ${bwAi[1]}px ${bwAi[2]}px ${bwAi[3]}px`,
    borderImageSource: `url('${ai.url}')`,
    borderImageSlice: `${ai.slice[0]} ${ai.slice[1]} ${ai.slice[2]} ${ai.slice[3]} fill`,
    borderImageRepeat: 'stretch',
    borderImageWidth: ai.patternScale,
    padding: `${ai.pad[0]}px ${ai.pad[1]}px ${ai.pad[2]}px ${ai.pad[3]}px`,
    color: ai.textColor,
    lineHeight: 1.25,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  };

  // User Bubble direct style (Sully / Float: true single-element box model)
  const userBubbleStyleDirect: React.CSSProperties = {
    position: 'relative',
    boxSizing: 'border-box',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderWidth: `${bwUser[0]}px ${bwUser[1]}px ${bwUser[2]}px ${bwUser[3]}px`,
    borderImageSource: `url('${user.url}')`,
    borderImageSlice: `${user.slice[0]} ${user.slice[1]} ${user.slice[2]} ${user.slice[3]} fill`,
    borderImageRepeat: 'stretch',
    borderImageWidth: user.patternScale,
    padding: `${user.pad[0]}px ${user.pad[1]}px ${user.pad[2]}px ${user.pad[3]}px`,
    color: user.textColor,
    lineHeight: 1.25,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
  };

  // LINK isolated pseudo-layer style
  const aiBubbleStyleLink: React.CSSProperties = {
    position: 'relative',
    padding: `${ai.pad[0]}px ${ai.pad[1]}px ${ai.pad[2]}px ${ai.pad[3]}px`,
    color: ai.textColor,
    lineHeight: 1.25,
  };

  const userBubbleStyleLink: React.CSSProperties = {
    position: 'relative',
    padding: `${user.pad[0]}px ${user.pad[1]}px ${user.pad[2]}px ${user.pad[3]}px`,
    color: user.textColor,
    lineHeight: 1.25,
  };

  return (
    <div id="preview-section-card" className="bg-white rounded-xl p-3 sm:p-4 border-2 border-black shadow-[3px_3px_0px_#000] flex flex-col h-full">
      {/* 预览视窗顶部栏 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black shrink-0" />
          <h2 className="text-xs font-black text-black mr-1">
            实时预览
          </h2>

          {/* 3 平台真机盒模型切换器 */}
          <div className="flex bg-[#e5e7eb] p-0.5 border border-black rounded-lg shadow-xs">
            <button
              type="button"
              onClick={() => onSelectExportType?.('sully')}
              className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                currentPlatform === 'sully'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
              title="切换为 Sully 单层真实盒模型（border-image 作用于气泡自身）"
            >
              Sully 原生
            </button>
            <button
              type="button"
              onClick={() => onSelectExportType?.('float')}
              className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                currentPlatform === 'float'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
              title="切换为 Float 原生聊天室盒模型（包含 .chat-markdown 嵌套结构）"
            >
              Float 原生
            </button>
            <button
              type="button"
              onClick={() => onSelectExportType?.('link')}
              className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                currentPlatform === 'link'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
              title="切换为 LINK ::before 双层隔离盒模型"
            >
              LINK 线上
            </button>
          </div>
        </div>

        {/* 视窗视图切换: 聊天流 / 自由拉伸测试 / 转账弹窗 */}
        <div className="flex items-center gap-1.5">
          <div className="flex bg-[#f0f2f5] p-0.5 border border-black rounded-lg">
            <button
              type="button"
              onClick={() => setPreviewTab('chat')}
              className={`px-2 py-1 rounded text-[10px] font-black flex items-center gap-1 transition-all ${
                previewTab === 'chat'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>聊天流</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('stretch')}
              className={`px-2 py-1 rounded text-[10px] font-black flex items-center gap-1 transition-all ${
                previewTab === 'stretch'
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>拉力测试</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setModalRole(activeRole || 'ai')}
            className="text-[10px] font-black text-black bg-[#f0f2f5] hover:bg-black hover:text-white border border-black shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none px-2 py-1 rounded-lg flex items-center gap-1 transition-all"
            title="查看转账弹窗"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>转账弹窗</span>
          </button>
        </div>
      </div>

      {/* 平台盒模型即时解析条 (解释为什么渲染有差异) */}
      <div className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-black/15 mb-2.5 flex items-center justify-between gap-2 transition-all bg-neutral-50 shadow-xs">
        {currentPlatform === 'sully' && (
          <>
            <span className="text-blue-950 leading-snug">
              📌 <b>Sully 单层真实盒模型</b>：九宫格直接挂在气泡容器上，真实文字外距 = <b>边框厚度({bwAi[0]}px) + 内边距({ai.pad[0]}px)</b>。
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black border border-blue-300 shrink-0">Sully 实景</span>
          </>
        )}
        {currentPlatform === 'float' && (
          <>
            <span className="text-purple-950 leading-snug">
              📌 <b>Float 原生盒模型</b>：单层容器直接挂载，内部嵌套 <code>.chat-markdown</code>，精准还原 Float 聊天室行高与边界。
            </span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-black border border-purple-300 shrink-0">Float 实景</span>
          </>
        )}
        {currentPlatform === 'link' && (
          <>
            <span className="text-emerald-950 leading-snug">
              📌 <b>LINK 线上隔离模型</b>：九宫格置于 <code>::before</code> 绝对定位伪元素层，文字间距完全仅由 <b>内边距({ai.pad[0]}px)</b> 控制。
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black border border-emerald-300 shrink-0">LINK 线上</span>
          </>
        )}
      </div>

      {/* 视图模式 1: 真实聊天视窗 */}
      {previewTab === 'chat' && (
        <div
          id="chat-simulator-viewport"
          className="bg-[#f0f2f5] rounded-xl p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto relative border-2 border-black shadow-inner select-none flex-1"
          style={{ minHeight: '380px', maxHeight: '520px' }}
        >
          {/* 1. AI 接收方：普通文本气泡 */}
          <div className="flex flex-col items-start max-w-[85%]">
            <span className="text-[10px] font-black text-gray-600 mb-1 ml-1">AI 对方</span>
            {isDirectBorderModel ? (
              <div
                id="bubble-ai-preview"
                onClick={() => onSelectComponent?.('bubble', 'ai')}
                className={`sully-bubble-ai chat-bubble-role-assistant w-fit min-w-[36px] max-w-full text-[13px] leading-[1.3] break-words whitespace-pre-wrap cursor-pointer transition-all ${
                  activeRole === 'ai' && activeComponent === 'bubble'
                    ? 'ring-2 ring-black ring-offset-2 scale-[1.01]'
                    : 'hover:opacity-90'
                }`}
                style={aiBubbleStyleDirect}
              >
                {currentPlatform === 'float' ? (
                  <div className="chat-markdown">
                    <p className="m-0 leading-snug">好哦，我已经收到了，切片样式很漂亮！</p>
                  </div>
                ) : (
                  <span>好哦，我已经收到了，切片样式很漂亮！</span>
                )}
              </div>
            ) : (
              <div
                id="bubble-ai-preview"
                onClick={() => onSelectComponent?.('bubble', 'ai')}
                className={`relative z-1 box-border w-fit min-w-[36px] max-w-full bg-transparent border-none text-[13px] leading-[1.3] break-words whitespace-pre-wrap cursor-pointer transition-all ${
                  activeRole === 'ai' && activeComponent === 'bubble'
                    ? 'ring-2 ring-black ring-offset-2 scale-[1.01]'
                    : 'hover:opacity-90'
                }`}
                style={aiBubbleStyleLink}
              >
                <div
                  className="absolute inset-0 -z-1 pointer-events-none"
                  style={{
                    borderStyle: 'solid',
                    borderColor: 'transparent',
                    borderImageRepeat: 'stretch',
                    borderImageSource: `url('${ai.url}')`,
                    borderImageSlice: `${ai.slice[0]} ${ai.slice[1]} ${ai.slice[2]} ${ai.slice[3]} fill`,
                    borderWidth: `${bwAi[0]}px ${bwAi[1]}px ${bwAi[2]}px ${bwAi[3]}px`,
                    borderImageWidth: ai.patternScale,
                  }}
                />
                <span>好哦，我已经收到了，切片样式很漂亮！</span>
              </div>
            )}
          </div>

          {/* 2. AI 接收方：独立语音条 */}
          <div className="flex flex-col items-start">
            <div
              id="voice-ai-preview"
              style={aiVoiceStyle}
              onClick={() => onSelectComponent?.('voice', 'ai')}
              className={`sully-voice-bar voice-msg-bubble flex items-center gap-2 cursor-pointer w-36 h-8 text-xs font-bold select-none transition-all ${
                activeRole === 'ai' && activeComponent === 'voice'
                  ? 'ring-2 ring-black ring-offset-2 scale-[1.01]'
                  : 'hover:opacity-90'
              }`}
            >
              <div
                className="voice-msg-icon w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlayingAi(!isPlayingAi);
                }}
              >
                {isPlayingAi ? (
                  <Pause className="w-3 h-3" style={{ color: ai.textColor, fill: ai.textColor }} />
                ) : (
                  <Play className="w-3 h-3" style={{ color: ai.textColor, fill: ai.textColor }} />
                )}
              </div>
              <div className="voice-msg-bar voice-msg-bars flex items-center gap-0.5 flex-1" data-playing={isPlayingAi ? 'true' : undefined}>
                {[8, 14, 10, 16, 12, 18, 14, 10].map((h, idx) => (
                  <span
                    key={idx}
                    className={`w-0.5 rounded-full transition-all duration-200 ${
                      isPlayingAi ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: `${isPlayingAi ? (h * 1.2) % 18 + 4 : h}px`,
                      backgroundColor: ai.textColor,
                    }}
                  />
                ))}
              </div>
              <span className="voice-msg-dur" style={{ color: ai.textColor }}>4"</span>
            </div>
          </div>

          {/* 3. AI 接收方：转账卡片 */}
          <div className="flex flex-col items-start">
            <div
              id="bubble-ai-transfer-card"
              style={aiTransferStyle}
              onClick={() => {
                onSelectComponent?.('transfer', 'ai');
                setModalRole('ai');
              }}
              className={`sully-transfer-card chat-transfer-card w-60 sm:w-64 cursor-pointer text-xs transition-all ${
                activeRole === 'ai' && activeComponent === 'transfer'
                  ? 'ring-2 ring-black ring-offset-2 scale-[1.01]'
                  : 'hover:opacity-90'
              }`}
            >
              <div className="chat-transfer-body flex items-center gap-2.5 pb-2 border-b border-black/10">
                <div
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0"
                  style={{ border: `1.5px solid ${aiTransferTextColor}`, color: aiTransferTextColor }}
                >
                  ¥
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs" style={{ color: aiTransferTextColor }}>微信转账 (对方)</span>
                  <span className="text-sm font-black tracking-tight" style={{ color: aiTransferTextColor }}>
                    ¥ 520.00
                  </span>
                </div>
              </div>
              <div className="pt-1 text-[10px] opacity-75 font-semibold" style={{ color: aiTransferTextColor }}>
                等待确认收钱 · 点击查看AI转账弹窗
              </div>
            </div>
          </div>

          {/* 4. 用户发送方：极短文本测试 (验证边框宽度是否把短词撑得过大) */}
          <div className="flex flex-col items-end self-end max-w-[85%]">
            <span className="text-[10px] font-black text-gray-600 mb-1 mr-1">我 (用户短回复测试)</span>
            {isDirectBorderModel ? (
              <div
                id="bubble-user-short-preview"
                onClick={() => onSelectComponent?.('bubble', 'user')}
                className={`sully-bubble-user chat-bubble-role-user w-fit min-w-[32px] max-w-full text-[13px] leading-[1.3] break-words whitespace-pre-wrap cursor-pointer transition-all text-left ${
                  activeRole === 'user' && activeComponent === 'bubble'
                    ? 'ring-2 ring-black ring-offset-2 scale-[1.01]'
                    : 'hover:opacity-90'
                }`}
                style={userBubbleStyleDirect}
                title="短文本真实尺寸测试"
              >
                {currentPlatform === 'float' ? (
                  <div className="chat-markdown">
                    <p className="m-0 leading-snug">好</p>
                  </div>
                ) : (
                  <span>好</span>
                )}
              </div>
            ) : (
              <div
                id="bubble-user-short-preview"
                onClick={() => onSelectComponent?.('bubble', 'user')}
                className={`relative z-1 box-border w-fit min-w-[32px] max-w-full bg-transparent border-none text-[13px] leading-[1.3] break-words whitespace-pre-wrap cursor-pointer transition-all text-left ${
                  activeRole === 'user' && activeComponent === 'bubble'
                    ? 'ring-2 ring-black ring-offset-2 scale-[1.01]'
                    : 'hover:opacity-90'
                }`}
                style={userBubbleStyleLink}
              >
                <div
                  className="absolute inset-0 -z-1 pointer-events-none"
                  style={{
                    borderStyle: 'solid',
                    borderColor: 'transparent',
                    borderImageRepeat: 'stretch',
                    borderImageSource: `url('${user.url}')`,
                    borderImageSlice: `${user.slice[0]} ${user.slice[1]} ${user.slice[2]} ${user.slice[3]} fill`,
                    borderWidth: `${bwUser[0]}px ${bwUser[1]}px ${bwUser[2]}px ${bwUser[3]}px`,
                    borderImageWidth: user.patternScale,
                  }}
                />
                <span>好</span>
              </div>
            )}
          </div>

          {/* 5. 用户发送方：标准普通文本气泡 */}
          <div className="flex flex-col items-end self-end max-w-[85%]">
            <div
              id="bubble-user-preview"
              onClick={() => onSelectComponent?.('bubble', 'user')}
              className={`sully-bubble-user chat-bubble-role-user w-fit min-w-[36px] max-w-full text-[13px] leading-[1.3] break-words whitespace-pre-wrap cursor-pointer transition-all text-left ${
                activeRole === 'user' && activeComponent === 'bubble'
                  ? 'ring-2 ring-black ring-offset-2 scale-[1.01]'
                  : 'hover:opacity-90'
              }`}
              style={isDirectBorderModel ? userBubbleStyleDirect : userBubbleStyleLink}
            >
              {!isDirectBorderModel && (
                <div
                  className="absolute inset-0 -z-1 pointer-events-none"
                  style={{
                    borderStyle: 'solid',
                    borderColor: 'transparent',
                    borderImageRepeat: 'stretch',
                    borderImageSource: `url('${user.url}')`,
                    borderImageSlice: `${user.slice[0]} ${user.slice[1]} ${user.slice[2]} ${user.slice[3]} fill`,
                    borderWidth: `${bwUser[0]}px ${bwUser[1]}px ${bwUser[2]}px ${bwUser[3]}px`,
                    borderImageWidth: user.patternScale,
                  }}
                />
              )}
              {currentPlatform === 'float' ? (
                <div className="chat-markdown">
                  <p className="m-0 leading-snug">你收一下转账，今晚请你喝奶茶~</p>
                </div>
              ) : (
                <span>你收一下转账，今晚请你喝奶茶~</span>
              )}
            </div>
          </div>

          {/* 6. 用户发送方：独立语音条 */}
          <div className="flex flex-col items-end self-end">
            <div
              id="voice-user-preview"
              style={userVoiceStyle}
              onClick={() => onSelectComponent?.('voice', 'user')}
              className={`sully-voice-bar voice-msg-bubble flex items-center justify-end gap-2 cursor-pointer w-36 h-8 text-xs font-bold select-none transition-all ${
                activeRole === 'user' && activeComponent === 'voice'
                  ? 'ring-2 ring-black ring-offset-2 scale-[1.01]'
                  : 'hover:opacity-90'
              }`}
            >
              <span className="voice-msg-dur" style={{ color: user.textColor }}>3"</span>
              <div className="voice-msg-bar voice-msg-bars flex items-center gap-0.5" data-playing={isPlayingUser ? 'true' : undefined}>
                {[10, 14, 18, 12, 16, 10, 14, 8].map((h, idx) => (
                  <span
                    key={idx}
                    className={`w-0.5 rounded-full transition-all duration-200 ${
                      isPlayingUser ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: `${isPlayingUser ? (h * 1.2) % 18 + 4 : h}px`,
                      backgroundColor: user.textColor,
                    }}
                  />
                ))}
              </div>
              <div
                className="voice-msg-icon w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlayingUser(!isPlayingUser);
                }}
              >
                {isPlayingUser ? (
                  <Pause className="w-3 h-3" style={{ color: user.textColor, fill: user.textColor }} />
                ) : (
                  <Play className="w-3 h-3" style={{ color: user.textColor, fill: user.textColor }} />
                )}
              </div>
            </div>
          </div>

          {/* 7. 用户发送方：转账卡片 */}
          <div className="flex flex-col items-end self-end">
            <div
              id="bubble-user-transfer-card"
              style={userTransferStyle}
              onClick={() => {
                onSelectComponent?.('transfer', 'user');
                setModalRole('user');
              }}
              className={`sully-transfer-card chat-transfer-card w-60 sm:w-64 cursor-pointer text-xs transition-all ${
                activeRole === 'user' && activeComponent === 'transfer'
                  ? 'ring-2 ring-black ring-offset-2 scale-[1.01]'
                  : 'hover:opacity-90'
              }`}
            >
              <div className="chat-transfer-body flex items-center gap-2.5 pb-2 border-b border-black/10">
                <div
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0"
                  style={{ border: `1.5px solid ${userTransferTextColor}`, color: userTransferTextColor }}
                >
                  ¥
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-xs" style={{ color: userTransferTextColor }}>微信转账 (我方)</span>
                  <span className="text-sm font-black tracking-tight" style={{ color: userTransferTextColor }}>
                    ¥ 100.00
                  </span>
                </div>
              </div>
              <div className="pt-1 text-[10px] opacity-75 font-semibold" style={{ color: userTransferTextColor }}>
                你发起了一笔转账 · 点击查看用户转账弹窗
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 视图模式 2: 自由拉伸拉力测试 (超强直观) */}
      {previewTab === 'stretch' && (
        <div className="bg-[#f0f2f5] rounded-xl p-3 sm:p-4 flex flex-col gap-3 overflow-y-auto border-2 border-black shadow-inner flex-1" style={{ minHeight: '380px' }}>
          {/* 拉伸宽度调节滑块 */}
          <div className="bg-white p-2.5 rounded-lg border border-black shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1 text-black font-black">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>动态拉力滑块 (测试不同宽度拉伸效果):</span>
              </span>
              <span className="font-mono bg-black text-white px-2 py-0.5 rounded text-[11px]">
                {stretchWidth} px
              </span>
            </div>
            <input
              type="range"
              min="80"
              max="360"
              value={stretchWidth}
              onChange={(e) => setStretchWidth(parseInt(e.target.value))}
              className="w-full accent-black h-2 bg-gray-200 rounded cursor-pointer"
            />
          </div>

          {/* 实时拉伸组件效果 */}
          <div className="flex flex-col items-center justify-center py-2 flex-1 gap-3">
            <span className="text-[10px] font-bold text-gray-500">
              当前编辑：{activeRole === 'ai' ? '🤖 对方(AI)' : '👤 己方(用户)'} · {activeComponent === 'bubble' ? '气泡' : activeComponent === 'voice' ? '语音条' : '转账卡'}
            </span>

            {activeComponent === 'bubble' && (
              isDirectBorderModel ? (
                <div
                  className="box-border text-[13px] leading-[1.3] break-words select-none transition-all"
                  style={{
                    width: `${stretchWidth}px`,
                    boxSizing: 'border-box',
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
                  {currentPlatform === 'float' ? (
                    <div className="chat-markdown">
                      <p className="m-0 leading-snug">{testCustomText}</p>
                    </div>
                  ) : (
                    testCustomText
                  )}
                </div>
              ) : (
                <div
                  className="relative z-1 box-border text-[13px] leading-[1.3] break-words select-none transition-all"
                  style={{
                    width: `${stretchWidth}px`,
                    padding: `${currentCompData.pad[0]}px ${currentCompData.pad[1]}px ${currentCompData.pad[2]}px ${currentCompData.pad[3]}px`,
                    color: currentRoleData.textColor,
                  }}
                >
                  <div
                    className="absolute inset-0 -z-1 pointer-events-none"
                    style={{
                      borderStyle: 'solid',
                      borderColor: 'transparent',
                      borderImageRepeat: 'stretch',
                      borderImageSource: `url('${currentCompData.url}')`,
                      borderImageSlice: `${currentCompData.slice[0]} ${currentCompData.slice[1]} ${currentCompData.slice[2]} ${currentCompData.slice[3]} fill`,
                      borderWidth: `${currentBw[0]}px ${currentBw[1]}px ${currentBw[2]}px ${currentBw[3]}px`,
                      borderImageWidth: currentCompData.patternScale,
                    }}
                  />
                  {testCustomText}
                </div>
              )
            )}

            {activeComponent === 'voice' && (
              <div
                className="flex items-center gap-2 cursor-pointer h-8 text-xs font-bold select-none transition-all"
                style={{
                  position: 'relative',
                  width: `${stretchWidth}px`,
                  boxSizing: 'border-box',
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
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}
                >
                  <Play className="w-3 h-3" style={{ color: currentRoleData.textColor, fill: currentRoleData.textColor }} />
                </div>
                <div className="flex items-center gap-0.5 flex-1 overflow-hidden">
                  {[8, 14, 10, 16, 12, 18, 14, 10, 15, 11, 17, 13, 9, 16, 12].map((h, idx) => (
                    <span
                      key={idx}
                      className="w-0.5 rounded-full shrink-0"
                      style={{ height: `${h}px`, backgroundColor: currentRoleData.textColor }}
                    />
                  ))}
                </div>
                <span className="shrink-0" style={{ color: currentRoleData.textColor }}>12"</span>
              </div>
            )}

            {activeComponent === 'transfer' && (() => {
              const stretchTransferTextColor = currentCompData.url.includes('568a94')
                ? '#000000'
                : currentCompData.url.includes('46882d')
                ? '#ffffff'
                : (currentRoleData.textColor || '#000000');
              const stretchBw = calcTransferBw(currentCompData.slice);

              return (
                <div
                  className="cursor-pointer text-xs select-none transition-all"
                  style={{
                    position: 'relative',
                    width: `${stretchWidth}px`,
                    boxSizing: 'border-box',
                    borderStyle: 'solid',
                    borderColor: 'transparent',
                    borderWidth: `${stretchBw[0]}px ${stretchBw[1]}px ${stretchBw[2]}px ${stretchBw[3]}px`,
                    borderImageSource: `url('${currentCompData.url}')`,
                    borderImageSlice: `${currentCompData.slice[0]} ${currentCompData.slice[1]} ${currentCompData.slice[2]} ${currentCompData.slice[3]} fill`,
                    borderImageRepeat: 'stretch',
                    borderImageWidth: currentCompData.patternScale,
                    padding: `${currentCompData.pad[0]}px ${currentCompData.pad[1]}px ${currentCompData.pad[2]}px ${currentCompData.pad[3]}px`,
                    color: stretchTransferTextColor,
                  }}
                >
                  <div className="flex items-center gap-2 pb-2 border-b border-black/10">
                    <div
                      className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-bold text-xs shrink-0"
                      style={{ border: `1.5px solid ${stretchTransferTextColor}`, color: stretchTransferTextColor }}
                    >
                      ¥
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs" style={{ color: stretchTransferTextColor }}>
                        微信转账 ({activeRole === 'ai' ? '对方' : '我方'})
                      </span>
                      <span className="text-sm font-black" style={{ color: stretchTransferTextColor }}>
                        ¥ 520.00
                      </span>
                    </div>
                  </div>
                  <div className="pt-1 text-[10px] opacity-75 font-semibold" style={{ color: stretchTransferTextColor }}>
                    自由拉伸测试中 · 四角保护不失真
                  </div>
                </div>
              );
            })()}

            {/* 快速文本预设 */}
            {activeComponent === 'bubble' && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-gray-500 font-bold">文案预设:</span>
                {[
                  { label: '短句', text: '收到！' },
                  { label: '中句', text: '好哦，我已经收到了，切片很棒！' },
                  { label: '多行长文', text: '这是一段很长的测试文案，用来检查九宫格上下左右内边距是否均匀舒适。' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setTestCustomText(item.text)}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-black hover:bg-black hover:text-white transition-all shadow-xs"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 真实转账弹窗模拟层 - 配合 ModalStrategy 实时呈现 */}
      {modalRole && (() => {
        const strategy = config.modalStrategy || 'ai';
        let effectiveRole: 'ai' | 'user' | 'none' = 'ai';

        if (strategy === 'none') {
          effectiveRole = 'none';
        } else if (strategy === 'user') {
          effectiveRole = 'user';
        } else if (strategy === 'smart') {
          effectiveRole = modalRole === 'ai' ? 'ai' : 'user';
        } else {
          effectiveRole = 'ai';
        }

        const roleData = effectiveRole === 'user' ? user : ai;
        const targetTransfer = roleData.transfer || {
          url: roleData.url,
          slice: roleData.slice,
          pad: roleData.pad,
          patternScale: 1.3,
        };
        const modalBw = calcTransferBw(targetTransfer.slice);

        return (
          <div
            id="transfer-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
            onClick={() => setModalRole(null)}
          >
            <div
              id="transfer-modal-window"
              onClick={(e) => e.stopPropagation()}
              className="max-w-[320px] w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-150"
            >
              <div
                style={
                  effectiveRole === 'none'
                    ? {
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        border: '2px solid #000000',
                        color: '#000000',
                        boxShadow: '4px 4px 0px #000000',
                      }
                    : {
                        position: 'relative',
                        borderStyle: 'solid',
                        borderColor: 'transparent',
                        borderWidth: `${modalBw[0]}px ${modalBw[1]}px ${modalBw[2]}px ${modalBw[3]}px`,
                        borderImageSource: `url('${targetTransfer.url}')`,
                        borderImageSlice: `${targetTransfer.slice[0]} ${targetTransfer.slice[1]} ${targetTransfer.slice[2]} ${targetTransfer.slice[3]} fill`,
                        borderImageRepeat: 'stretch',
                        borderImageWidth: targetTransfer.patternScale,
                        color: roleData.textColor,
                        boxShadow: '4px 4px 0px #000000',
                      }
                }
                className="w-full p-6 flex flex-col items-center relative"
              >
                <button
                  type="button"
                  onClick={() => setModalRole(null)}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl mb-3 shadow-xs"
                  style={{
                    backgroundColor: effectiveRole === 'none' ? '#000000' : 'rgba(0,0,0,0.06)',
                    color: effectiveRole === 'none' ? '#ffffff' : roleData.textColor,
                    border: `2px solid ${effectiveRole === 'none' ? '#000000' : roleData.textColor}`,
                  }}
                >
                  ¥
                </div>

                <h3 className="text-sm font-bold mb-1">
                  {modalRole === 'ai' ? '收到来自 AI 的转账' : '发给 AI 的转账'}
                </h3>
                <span className="text-3xl font-black mb-2">¥ 520.00</span>
                <span className="text-xs opacity-75 mb-6">转账说明：九宫格切片效果验收赞赏</span>

                <div className="flex items-center gap-2 w-full justify-center">
                  {modalRole === 'ai' ? (
                    <button
                      type="button"
                      onClick={() => setModalRole(null)}
                      className="px-4 py-2 rounded-lg text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                      style={{
                        backgroundColor:
                          effectiveRole === 'none'
                            ? '#000000'
                            : roleData.textColor === '#ffffff'
                            ? '#ffffff'
                            : '#000000',
                        color:
                          effectiveRole === 'none'
                            ? '#ffffff'
                            : roleData.textColor === '#ffffff'
                            ? '#000000'
                            : '#ffffff',
                      }}
                    >
                      立即确认收款
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setModalRole(null)}
                      className="px-4 py-2 rounded-lg text-xs font-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                      style={{
                        backgroundColor:
                          effectiveRole === 'none'
                            ? '#000000'
                            : roleData.textColor === '#ffffff'
                            ? '#ffffff'
                            : '#000000',
                        color:
                          effectiveRole === 'none'
                            ? '#ffffff'
                            : roleData.textColor === '#ffffff'
                            ? '#000000'
                            : '#ffffff',
                      }}
                    >
                      提醒对方收款
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setModalRole(null)}
                    className="px-4 py-2 rounded-lg text-xs font-black bg-white border-2 border-black text-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
