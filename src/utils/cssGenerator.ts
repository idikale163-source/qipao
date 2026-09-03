import { AppConfig, ExportType, QuadrantValues } from '../types';

export function calcSafeBw(slice: QuadrantValues): QuadrantValues {
  if (slice[0] === 52 && slice[1] === 63 && slice[2] === 47 && slice[3] === 73) {
    return [6, 9, 5, 10];
  }
  if (slice[0] === 51 && slice[1] === 58 && slice[2] === 43 && slice[3] === 52) {
    return [6, 7, 5, 7];
  }
  return [
    Math.max(4, Math.round(slice[0] * 0.15)),
    Math.max(4, Math.round(slice[1] * 0.15)),
    Math.max(4, Math.round(slice[2] * 0.15)),
    Math.max(4, Math.round(slice[3] * 0.15)),
  ];
}

export function calcTransferBw(slice: QuadrantValues): QuadrantValues {
  // 严格贴合 Sully 转账卡片实测物理边框配比:
  // 例如 51 58 43 52 -> [10, 12, 8, 12]
  // 例如 52 63 47 73 -> [10, 14, 8, 14]
  if (slice[0] === 51 && slice[1] === 58 && slice[2] === 43 && slice[3] === 52) {
    return [10, 12, 8, 12];
  }
  if (slice[0] === 52 && slice[1] === 63 && slice[2] === 47 && slice[3] === 73) {
    return [10, 14, 8, 14];
  }
  return [
    Math.max(8, Math.round(slice[0] * 0.2)),
    Math.max(8, Math.round(slice[1] * 0.21)),
    Math.max(6, Math.round(slice[2] * 0.18)),
    Math.max(8, Math.round(slice[3] * 0.21)),
  ];
}

export function getModalCss(config: AppConfig, _platform: 'sully' | 'link' = 'sully'): string {
  const { ai, user } = config;
  const strategy = config.modalStrategy || 'ai';

  if (strategy === 'none') {
    return `/* -------------------------------------------------------
   5. 转账弹窗框体：用户选择保留系统原生白底圆角样式
   ------------------------------------------------------- */
div[class*="fixed"][class*="inset-0"] {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
}`;
  }

  if (strategy === 'user') {
    const userSrc = user.transfer?.url || user.url;
    const userSlice = user.transfer?.slice || user.slice;
    const userScale = user.transfer?.patternScale || 1.2;
    const bw = calcTransferBw(userSlice);
    const textColor = userSrc.includes('46882d') ? '#ffffff' : (user.textColor || '#ffffff');

    return `/* -------------------------------------------------------
   5. 转账详情弹窗主体 (绑定【用户我方素材】)
   ------------------------------------------------------- */
div[class*="fixed"][class*="inset-0"] {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] {
  border-radius: 0 !important;
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  overflow: hidden !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-width: ${bw[0]}px ${bw[1]}px ${bw[2]}px ${bw[3]}px !important;
  border-image-source: url('${userSrc}') !important;
  border-image-slice: ${userSlice[0]} ${userSlice[1]} ${userSlice[2]} ${userSlice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${userScale} !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] > div:first-child {
  background: transparent !important;
  background-image: none !important;
  border-bottom: 1.5px dashed ${textColor} !important;
  color: ${textColor} !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] * {
  color: ${textColor} !important;
  -webkit-text-fill-color: ${textColor} !important;
  text-shadow: none !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button.bg-gradient-to-r,
div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button[class*="from-amber-400"] {
  background: ${textColor === '#ffffff' ? '#ffffff' : '#000000'} !important;
  color: ${textColor === '#ffffff' ? '#000000' : '#ffffff'} !important;
  -webkit-text-fill-color: ${textColor === '#ffffff' ? '#000000' : '#ffffff'} !important;
  border: 1.5px solid ${textColor} !important;
  border-radius: 8px !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button.bg-slate-100,
div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button:not([class*="from-amber-400"]):not([class*="bg-gradient-to-r"]) {
  background: #ffffff !important;
  color: #000000 !important;
  -webkit-text-fill-color: #000000 !important;
  border: 1.5px solid #000000 !important;
  border-radius: 8px !important;
}`;
  }

  if (strategy === 'smart') {
    const aiSrc = ai.transfer?.url || ai.url;
    const aiSlice = ai.transfer?.slice || ai.slice;
    const aiScale = ai.transfer?.patternScale || 1.2;
    const bwAi = calcTransferBw(aiSlice);
    const aiTextColor = aiSrc.includes('568a94') ? '#000000' : (ai.textColor || '#000000');

    const userSrc = user.transfer?.url || user.url;
    const userSlice = user.transfer?.slice || user.slice;
    const userScale = user.transfer?.patternScale || 1.2;
    const bwUser = calcTransferBw(userSlice);
    const userTextColor = userSrc.includes('46882d') ? '#ffffff' : (user.textColor || '#ffffff');

    return `/* -------------------------------------------------------
   5. 转账弹窗框体：双向智能嗅探 (AI待收款吃AI卡素材，我方发起吃用户卡素材)
   ------------------------------------------------------- */
div[class*="fixed"][class*="inset-0"] {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
}

/* 场景 A: AI 待收款弹窗 (含有确认收款按钮或未收标识) -> 匹配 AI 转账卡素材 */
div[class*="fixed"][class*="inset-0"]:has(button.bg-gradient-to-r) div[class*="max-w-[320px]"],
div[class*="fixed"][class*="inset-0"]:has(button[class*="from-amber-400"]) div[class*="max-w-[320px]"] {
  border-radius: 0 !important;
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  overflow: hidden !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-width: ${bwAi[0]}px ${bwAi[1]}px ${bwAi[2]}px ${bwAi[3]}px !important;
  border-image-source: url('${aiSrc}') !important;
  border-image-slice: ${aiSlice[0]} ${aiSlice[1]} ${aiSlice[2]} ${aiSlice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${aiScale} !important;
}

div[class*="fixed"][class*="inset-0"]:has(button.bg-gradient-to-r) div[class*="max-w-[320px]"] > div:first-child,
div[class*="fixed"][class*="inset-0"]:has(button[class*="from-amber-400"]) div[class*="max-w-[320px]"] > div:first-child {
  background: transparent !important;
  background-image: none !important;
  border-bottom: 1.5px dashed ${aiTextColor} !important;
  color: ${aiTextColor} !important;
}

div[class*="fixed"][class*="inset-0"]:has(button.bg-gradient-to-r) div[class*="max-w-[320px]"] *,
div[class*="fixed"][class*="inset-0"]:has(button[class*="from-amber-400"]) div[class*="max-w-[320px]"] * {
  color: ${aiTextColor} !important;
  -webkit-text-fill-color: ${aiTextColor} !important;
  text-shadow: none !important;
}

/* 场景 B: 用户我方发起转账或查看详情 -> 匹配 用户转账卡素材 */
div[class*="fixed"][class*="inset-0"]:not(:has(button.bg-gradient-to-r)):not(:has(button[class*="from-amber-400"])) div[class*="max-w-[320px]"] {
  border-radius: 0 !important;
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  overflow: hidden !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-width: ${bwUser[0]}px ${bwUser[1]}px ${bwUser[2]}px ${bwUser[3]}px !important;
  border-image-source: url('${userSrc}') !important;
  border-image-slice: ${userSlice[0]} ${userSlice[1]} ${userSlice[2]} ${userSlice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${userScale} !important;
}

div[class*="fixed"][class*="inset-0"]:not(:has(button.bg-gradient-to-r)):not(:has(button[class*="from-amber-400"])) div[class*="max-w-[320px]"] > div:first-child {
  background: transparent !important;
  background-image: none !important;
  border-bottom: 1.5px dashed ${userTextColor} !important;
  color: ${userTextColor} !important;
}

div[class*="fixed"][class*="inset-0"]:not(:has(button.bg-gradient-to-r)):not(:has(button[class*="from-amber-400"])) div[class*="max-w-[320px]"] * {
  color: ${userTextColor} !important;
  -webkit-text-fill-color: ${userTextColor} !important;
  text-shadow: none !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button.bg-gradient-to-r,
div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button[class*="from-amber-400"] {
  background: #000000 !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  border: 1.5px solid #000000 !important;
  border-radius: 8px !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button.bg-slate-100,
div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button:not([class*="from-amber-400"]):not([class*="bg-gradient-to-r"]) {
  background: #ffffff !important;
  color: #000000 !important;
  -webkit-text-fill-color: #000000 !important;
  border: 1.5px solid #000000 !important;
  border-radius: 8px !important;
}`;
  }

  // 默认：统一绑定 AI 对方素材 (经典实测 568a94 / 46882d 方案)
  const aiSrc = ai.transfer?.url || ai.url;
  const aiSlice = ai.transfer?.slice || ai.slice;
  const aiScale = ai.transfer?.patternScale || 1.2;
  const bw = calcTransferBw(aiSlice);
  const textColor = aiSrc.includes('568a94') ? '#000000' : (ai.textColor || '#000000');

  return `/* -------------------------------------------------------
   5. 转账详情弹窗主体 (统一绑定【AI 对方素材】)
   ------------------------------------------------------- */
div[class*="fixed"][class*="inset-0"] {
  background: rgba(0, 0, 0, 0.45) !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] {
  border-radius: 0 !important;
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  overflow: hidden !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-image-source: url('${aiSrc}') !important;
  border-image-slice: ${aiSlice[0]} ${aiSlice[1]} ${aiSlice[2]} ${aiSlice[3]} fill !important;
  border-width: ${bw[0]}px ${bw[1]}px ${bw[2]}px ${bw[3]}px !important;
  border-image-repeat: stretch !important;
  border-image-width: ${aiScale} !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] > div:first-child {
  background: transparent !important;
  background-image: none !important;
  border-bottom: 1.5px dashed ${textColor} !important;
  color: ${textColor} !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] * {
  color: ${textColor} !important;
  -webkit-text-fill-color: ${textColor} !important;
  text-shadow: none !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button.bg-gradient-to-r,
div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button[class*="from-amber-400"] {
  background: #000000 !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  border: 1.5px solid #000000 !important;
  border-radius: 8px !important;
}

div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button.bg-slate-100,
div[class*="fixed"][class*="inset-0"] div[class*="max-w-[320px]"] button:not([class*="from-amber-400"]):not([class*="bg-gradient-to-r"]) {
  background: #ffffff !important;
  color: #000000 !important;
  -webkit-text-fill-color: #000000 !important;
  border: 1.5px solid #000000 !important;
  border-radius: 8px !important;
}`;
}

export function generateSullyCSS(config: AppConfig): string {
  const { ai, user } = config;
  const bwAi = calcSafeBw(ai.slice);
  const bwUser = calcSafeBw(user.slice);

  const aiVoice = ai.voice || { url: ai.url, slice: ai.slice, pad: [0, 8, 1, 8], patternScale: 1.4 };
  const userVoice = user.voice || { url: user.url, slice: user.slice, pad: [0, 8, 1, 8], patternScale: 1.4 };
  const bwAiVoice = calcSafeBw(aiVoice.slice);
  const bwUserVoice = calcSafeBw(userVoice.slice);

  const aiTransfer = ai.transfer || { url: ai.url, slice: ai.slice, pad: [6, 12, 6, 12], patternScale: 1.3 };
  const userTransfer = user.transfer || { url: user.url, slice: user.slice, pad: [6, 14, 6, 14], patternScale: 1.3 };
  const bwAiTransfer = calcTransferBw(aiTransfer.slice);
  const bwUserTransfer = calcTransferBw(userTransfer.slice);

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

  const receiptSrc = userTransfer.url || 'https://nos.netease.com/ysf/568a947a6b5a5c8b58a789cb3f543942.png';
  const receiptSlice = userTransfer.slice || [51, 58, 43, 52];

  return `/* =======================================================
   Sully 全局视觉定制方案加入白框
   ======================================================= */

/* -------------------------------------------------------
   1. AI 角色气泡 
   ------------------------------------------------------- */
.sully-bubble-ai {
  position: relative !important;
  background: transparent !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  box-sizing: border-box !important;

  /* 物理边框维持紧凑矮版 */
  border-width: ${bwAi[0]}px ${bwAi[1]}px ${bwAi[2]}px ${bwAi[3]}px !important;
  border-image-source: url('${ai.url}') !important;
  border-image-slice: ${ai.slice[0]} ${ai.slice[1]} ${ai.slice[2]} ${ai.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  /* 仅放大素材图案本身，不改变气泡容器体积 */
  border-image-width: ${ai.patternScale} !important;

  padding: ${ai.pad[0]}px ${ai.pad[1]}px ${ai.pad[2]}px ${ai.pad[3]}px !important;
  color: ${ai.textColor} !important;
  -webkit-text-fill-color: ${ai.textColor} !important;
  margin-top: 5px !important;
  line-height: 1.25 !important;
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
  min-height: 24px !important;
  height: auto !important;
}

.sully-bubble-ai * {
  background-color: transparent !important;
  color: ${ai.textColor} !important;
  -webkit-text-fill-color: ${ai.textColor} !important;
  line-height: 1.25 !important;
}

/* -------------------------------------------------------
   2. 用户发送方气泡
   ------------------------------------------------------- */
.sully-bubble-user {
  position: relative !important;
  background: transparent !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  box-sizing: border-box !important;

  border-width: ${bwUser[0]}px ${bwUser[1]}px ${bwUser[2]}px ${bwUser[3]}px !important;
  border-image-source: url('${user.url}') !important;
  border-image-slice: ${user.slice[0]} ${user.slice[1]} ${user.slice[2]} ${user.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${user.patternScale} !important;

  padding: ${user.pad[0]}px ${user.pad[1]}px ${user.pad[2]}px ${user.pad[3]}px !important;
  color: ${user.textColor} !important;
  -webkit-text-fill-color: ${user.textColor} !important;
  margin-top: 5px !important;
  line-height: 1.25 !important;
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
  min-height: 24px !important;
  height: auto !important;
}

.sully-bubble-user * {
  background-color: transparent !important;
  color: ${user.textColor} !important;
  -webkit-text-fill-color: ${user.textColor} !important;
  line-height: 1.25 !important;
}

/* -------------------------------------------------------
   3. 语音条独立组件 (维持 34px 矮版)
   ------------------------------------------------------- */
.sully-voice-bar,
div[class*="max-w-[260px]"]:has(button),
div[class*="max-w-[200px]"]:has(button),
.sully-bubble-ai div[class*="max-w-[260px]"],
.sully-bubble-user div[class*="max-w-[260px]"] {
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  box-sizing: border-box !important;
  display: flex !important;
  align-items: center !important;
}

/* AI 语音条素材 */
.sully-bubble-ai .sully-voice-bar,
.sully-bubble-ai div[class*="max-w-[260px]"] > button,
.sully-bubble-ai div[class*="max-w-[260px]"] > div,
.sully-bubble-ai div[class*="max-w-[200px]"] > button,
.sully-bubble-ai div[class*="max-w-[200px]"] > div,
div[class*="justify-start"] div[class*="max-w-[260px]"] > button,
div[class*="items-start"] div[class*="max-w-[260px]"] > button,
div:not([class*="justify-end"]):not([class*="items-end"]):not([class*="flex-row-reverse"]):not([class*="self-end"]):not([class*="ml-auto"]) > div[class*="max-w-[260px]"] > button {
  background: transparent !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  border-width: ${bwAiVoice[0]}px ${bwAiVoice[1]}px ${bwAiVoice[2]}px ${bwAiVoice[3]}px !important;
  border-image-source: url('${aiVoice.url}') !important;
  border-image-slice: ${aiVoice.slice[0]} ${aiVoice.slice[1]} ${aiVoice.slice[2]} ${aiVoice.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${aiVoice.patternScale} !important;
  padding: ${aiVoice.pad[0]}px ${aiVoice.pad[1]}px ${aiVoice.pad[2]}px ${aiVoice.pad[3]}px !important;
}

/* 用户语音条素材 */
.sully-bubble-user .sully-voice-bar,
.sully-bubble-user div[class*="max-w-[260px]"] > button,
.sully-bubble-user div[class*="max-w-[260px]"] > div,
.sully-bubble-user div[class*="max-w-[200px]"] > button,
.sully-bubble-user div[class*="max-w-[200px]"] > div,
div[class*="justify-end"] div[class*="max-w-[260px]"] > button,
div[class*="flex-row-reverse"] div[class*="max-w-[260px]"] > button,
div[class*="self-end"] div[class*="max-w-[260px]"] > button,
div[class*="ml-auto"] div[class*="max-w-[260px]"] > button {
  background: transparent !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  border-width: ${bwUserVoice[0]}px ${bwUserVoice[1]}px ${bwUserVoice[2]}px ${bwUserVoice[3]}px !important;
  border-image-source: url('${userVoice.url}') !important;
  border-image-slice: ${userVoice.slice[0]} ${userVoice.slice[1]} ${userVoice.slice[2]} ${userVoice.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${userVoice.patternScale} !important;
  padding: ${userVoice.pad[0]}px ${userVoice.pad[1]}px ${userVoice.pad[2]}px ${userVoice.pad[3]}px !important;
}

/* 语音文字颜色 */
.sully-bubble-ai div[class*="max-w-[260px]"] span,
.sully-bubble-ai div[class*="max-w-[200px]"] span,
.sully-bubble-ai .sully-voice-bar span {
  color: ${ai.textColor} !important;
  -webkit-text-fill-color: ${ai.textColor} !important;
}
.sully-bubble-user div[class*="max-w-[260px]"] span,
.sully-bubble-user div[class*="max-w-[200px]"] span,
.sully-bubble-user .sully-voice-bar span {
  color: ${user.textColor} !important;
  -webkit-text-fill-color: ${user.textColor} !important;
}

/* 语音波形与播放图标 */
.sully-bubble-ai div[class*="max-w-[260px]"] svg,
.sully-bubble-ai div[class*="max-w-[200px]"] svg,
.sully-bubble-ai div[class*="max-w-[260px]"] [class*="bg-"],
.sully-bubble-ai div[class*="max-w-[200px]"] [class*="bg-"] {
  color: ${ai.textColor} !important;
  background-color: ${ai.textColor} !important;
}
.sully-bubble-user div[class*="max-w-[260px]"] svg,
.sully-bubble-user div[class*="max-w-[200px]"] svg,
.sully-bubble-user div[class*="max-w-[260px]"] [class*="bg-"],
.sully-bubble-user div[class*="max-w-[200px]"] [class*="bg-"] {
  color: ${user.textColor} !important;
  background-color: ${user.textColor} !important;
}

/* 外层气泡包含语音时清空自身边框，避免双层框冲突 */
.sully-bubble-ai:has(div[class*="max-w-[260px]"]),
.sully-bubble-ai:has(div[class*="max-w-[200px]"]),
.sully-bubble-user:has(div[class*="max-w-[260px]"]),
.sully-bubble-user:has(div[class*="max-w-[200px]"]) {
  background: transparent !important;
  border-color: transparent !important;
  border-image: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* -------------------------------------------------------
   4. 转账卡片组件 (严格限定转账卡自身，绝不波及其他卡片)
   ------------------------------------------------------- */
div[class*="w-64"][class*="rounded-2xl"][class*="p-4"],
.sully-transfer-card,
.msg-transfer-card {
  position: relative !important;
  overflow: visible !important;
  background: transparent !important;
  background-color: transparent !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  border-image-repeat: stretch !important;
  border-image-width: ${aiTransfer.patternScale} !important;
  padding: ${aiTransfer.pad[0]}px ${aiTransfer.pad[1]}px ${aiTransfer.pad[2]}px ${aiTransfer.pad[3]}px !important;
  box-sizing: border-box !important;
}

div[class*="w-64"][class*="rounded-2xl"] *,
.sully-transfer-card *,
.msg-transfer-card * {
  text-shadow: none !important;
  color: ${aiTransferTextColor} !important;
  -webkit-text-fill-color: ${aiTransferTextColor} !important;
}

/* 4.1 AI 对方转账卡 (默认 / 居左) */
div[class*="w-64"][class*="rounded-2xl"][class*="p-4"],
.sully-bubble-ai div[class*="w-64"][class*="rounded-2xl"],
div[class*="flex"]:not([class*="justify-end"]) > div[class*="w-64"][class*="rounded-2xl"],
.sully-chat-messages > div:not([class*="justify-end"]) div[class*="w-64"][class*="rounded-2xl"],
#bubble-ai-transfer-card {
  border-width: ${bwAiTransfer[0]}px ${bwAiTransfer[1]}px ${bwAiTransfer[2]}px ${bwAiTransfer[3]}px !important;
  border-image-source: url('${aiTransfer.url}') !important;
  border-image-slice: ${aiTransfer.slice[0]} ${aiTransfer.slice[1]} ${aiTransfer.slice[2]} ${aiTransfer.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${aiTransfer.patternScale} !important;
  padding: ${aiTransfer.pad[0]}px ${aiTransfer.pad[1]}px ${aiTransfer.pad[2]}px ${aiTransfer.pad[3]}px !important;
}

/* 4.2 用户发送方转账卡 (紧随其后声明，精准覆盖用户端右侧卡片) */
.sully-bubble-user div[class*="w-64"][class*="rounded-2xl"],
div[class*="justify-end"] div[class*="w-64"][class*="rounded-2xl"],
div[class*="flex-row-reverse"] div[class*="w-64"][class*="rounded-2xl"],
div[class*="self-end"] div[class*="w-64"][class*="rounded-2xl"],
div[class*="ml-auto"] div[class*="w-64"][class*="rounded-2xl"],
div[class*="w-64"][class*="rounded-2xl"][class*="ml-auto"],
div[class*="w-64"][class*="rounded-2xl"][class*="self-end"],
.sully-chat-messages > div[class*="justify-end"] div[class*="w-64"][class*="rounded-2xl"],
#bubble-user-transfer-card {
  border-width: ${bwUserTransfer[0]}px ${bwUserTransfer[1]}px ${bwUserTransfer[2]}px ${bwUserTransfer[3]}px !important;
  border-image-source: url('${userTransfer.url}') !important;
  border-image-slice: ${userTransfer.slice[0]} ${userTransfer.slice[1]} ${userTransfer.slice[2]} ${userTransfer.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${userTransfer.patternScale} !important;
  padding: ${userTransfer.pad[0]}px ${userTransfer.pad[1]}px ${userTransfer.pad[2]}px ${userTransfer.pad[3]}px !important;
}

.sully-bubble-user div[class*="w-64"][class*="rounded-2xl"] *,
div[class*="justify-end"] div[class*="w-64"][class*="rounded-2xl"] *,
div[class*="flex-row-reverse"] div[class*="w-64"][class*="rounded-2xl"] *,
div[class*="self-end"] div[class*="w-64"][class*="rounded-2xl"] *,
div[class*="ml-auto"] div[class*="w-64"][class*="rounded-2xl"] *,
div[class*="w-64"][class*="rounded-2xl"][class*="ml-auto"] *,
div[class*="w-64"][class*="rounded-2xl"][class*="self-end"] *,
.sully-chat-messages > div[class*="justify-end"] div[class*="w-64"][class*="rounded-2xl"] *,
#bubble-user-transfer-card * {
  text-shadow: none !important;
  color: ${userTransferTextColor} !important;
  -webkit-text-fill-color: ${userTransferTextColor} !important;
}

div[class*="w-64"][class*="rounded-2xl"] > div,
.sully-transfer-top,
.sully-transfer-bottom {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
}

div[class*="w-64"][class*="rounded-2xl"] [class*="rounded-full"],
.sully-transfer-card [class*="rounded-full"] {
  border: 1.5px solid #222222 !important;
  background: #ffffff !important;
  background-color: #ffffff !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

/* 外层气泡包含转账卡时隐藏自身边框，防止双层边框冲突 */
.sully-bubble-ai:has(div[class*="w-64"][class*="rounded-2xl"]),
.sully-bubble-user:has(div[class*="w-64"][class*="rounded-2xl"]) {
  background: transparent !important;
  border: none !important;
  border-image: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

${getModalCss(config, 'sully')}

/* -------------------------------------------------------
   6. 收款 / 退回回执小卡片
   ------------------------------------------------------- */
div[class*="rounded-2xl"][class*="shadow-sm"][class*="border"][class*="w-fit"][class*="from-emerald-50"],
div[class*="rounded-2xl"][class*="shadow-sm"][class*="border"][class*="w-fit"][class*="from-slate-50"] {
  position: relative !important;
  overflow: visible !important;
  background: transparent !important;
  background-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-image-source: url('${receiptSrc}') !important;
  border-image-slice: ${receiptSlice[0]} ${receiptSlice[1]} ${receiptSlice[2]} ${receiptSlice[3]} fill !important;
  border-width: 20px 15px 5px 15px !important;
  border-image-repeat: stretch !important;
  border-image-width: 1.2 !important;
  padding: 3px 10px 5px 10px !important;
  box-sizing: border-box !important;
}

div[class*="rounded-2xl"][class*="shadow-sm"][class*="border"][class*="w-fit"] * {
  color: #000000 !important;
  -webkit-text-fill-color: #000000 !important;
  text-shadow: none !important;
}

/* -------------------------------------------------------
   7. 清理多余图层与伪元素
   ------------------------------------------------------- */
.sully-bubble-ai::after,
.sully-bubble-ai::before,
.sully-bubble-user::after,
.sully-bubble-user::before,
.sully-voice-bar::after,
.sully-voice-bar::before {
  display: none !important;
}`;
}

export function generateLinkCSS(config: AppConfig): string {
  const { ai, user } = config;
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

  return `/* =======================================================
   LINK 聊天室全局视觉定制方案 (画框拉伸 + 组件独立配置版)
   ======================================================= */

/* 1. LINK 气泡通用容器 */
.chat-room .bubble {
  position: relative !important;
  box-sizing: border-box !important;
  width: fit-content !important;
  min-width: 36px !important;
  min-height: 24px !important;
  max-width: calc(100vw - 60px) !important;
  height: auto !important;
  flex: 0 1 auto !important;
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  overflow: visible !important;
  z-index: 1 !important;
  margin-top: 5px !important;
  line-height: 1.25 !important;
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
}

.chat-room .bubble * {
  background-color: transparent !important;
  line-height: 1.25 !important;
}

/* 2. LINK 核心：::before 独立画框图层 */
.chat-room .bubble::before {
  content: "" !important;
  display: block !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: -1 !important;
  pointer-events: none !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-image-repeat: stretch !important;
}

/* 3. LINK AI 对方气泡 */
.chat-room .message-row:not(.user) .bubble {
  margin-left: 8px !important;
  margin-right: auto !important;
  padding: ${ai.pad[0]}px ${ai.pad[1]}px ${ai.pad[2]}px ${ai.pad[3]}px !important;
  color: ${ai.textColor} !important;
  -webkit-text-fill-color: ${ai.textColor} !important;
}
.chat-room .message-row:not(.user) .bubble * {
  color: ${ai.textColor} !important;
  -webkit-text-fill-color: ${ai.textColor} !important;
}
.chat-room .message-row:not(.user) .bubble::before {
  border-image-source: url('${ai.url}') !important;
  border-image-slice: ${ai.slice[0]} ${ai.slice[1]} ${ai.slice[2]} ${ai.slice[3]} fill !important;
  border-width: ${bwAi[0]}px ${bwAi[1]}px ${bwAi[2]}px ${bwAi[3]}px !important;
  border-image-width: ${ai.patternScale} !important;
}

/* 4. LINK 用户我方气泡 */
.chat-room .message-row.user .bubble {
  margin-left: auto !important;
  margin-right: 8px !important;
  padding: ${user.pad[0]}px ${user.pad[1]}px ${user.pad[2]}px ${user.pad[3]}px !important;
  color: ${user.textColor} !important;
  -webkit-text-fill-color: ${user.textColor} !important;
}
.chat-room .message-row.user .bubble * {
  color: ${user.textColor} !important;
  -webkit-text-fill-color: ${user.textColor} !important;
}
.chat-room .message-row.user .bubble::before {
  border-image-source: url('${user.url}') !important;
  border-image-slice: ${user.slice[0]} ${user.slice[1]} ${user.slice[2]} ${user.slice[3]} fill !important;
  border-width: ${bwUser[0]}px ${bwUser[1]}px ${bwUser[2]}px ${bwUser[3]}px !important;
  border-image-width: ${user.patternScale} !important;
}

/* 5. LINK 独立语音条 */
.chat-room .message-row:not(.user) .voice-bubble {
  border-style: solid !important;
  border-color: transparent !important;
  border-image-repeat: stretch !important;
  border-image-source: url('${aiVoice.url}') !important;
  border-image-slice: ${aiVoice.slice[0]} ${aiVoice.slice[1]} ${aiVoice.slice[2]} ${aiVoice.slice[3]} fill !important;
  border-image-width: ${aiVoice.patternScale} !important;
  border-width: ${bwAiVoice[0]}px ${bwAiVoice[1]}px ${bwAiVoice[2]}px ${bwAiVoice[3]}px !important;
  padding: ${aiVoice.pad[0]}px ${aiVoice.pad[1]}px ${aiVoice.pad[2]}px ${aiVoice.pad[3]}px !important;
  color: ${ai.textColor} !important;
}

.chat-room .message-row.user .voice-bubble {
  border-style: solid !important;
  border-color: transparent !important;
  border-image-repeat: stretch !important;
  border-image-source: url('${userVoice.url}') !important;
  border-image-slice: ${userVoice.slice[0]} ${userVoice.slice[1]} ${userVoice.slice[2]} ${userVoice.slice[3]} fill !important;
  border-image-width: ${userVoice.patternScale} !important;
  border-width: ${bwUserVoice[0]}px ${bwUserVoice[1]}px ${bwUserVoice[2]}px ${bwUserVoice[3]}px !important;
  padding: ${userVoice.pad[0]}px ${userVoice.pad[1]}px ${userVoice.pad[2]}px ${userVoice.pad[3]}px !important;
  color: ${user.textColor} !important;
}

/* 6. LINK 转账卡 */
.chat-room .message-row:not(.user) .transfer-card {
  border-style: solid !important;
  border-color: transparent !important;
  border-image-repeat: stretch !important;
  border-image-source: url('${aiTransfer.url}') !important;
  border-image-slice: ${aiTransfer.slice[0]} ${aiTransfer.slice[1]} ${aiTransfer.slice[2]} ${aiTransfer.slice[3]} fill !important;
  border-image-width: ${aiTransfer.patternScale} !important;
  border-width: ${bwAiTransfer[0]}px ${bwAiTransfer[1]}px ${bwAiTransfer[2]}px ${bwAiTransfer[3]}px !important;
  padding: ${aiTransfer.pad[0]}px ${aiTransfer.pad[1]}px ${aiTransfer.pad[2]}px ${aiTransfer.pad[3]}px !important;
  color: ${ai.textColor} !important;
}

.chat-room .message-row.user .transfer-card {
  border-style: solid !important;
  border-color: transparent !important;
  border-image-repeat: stretch !important;
  border-image-source: url('${userTransfer.url}') !important;
  border-image-slice: ${userTransfer.slice[0]} ${userTransfer.slice[1]} ${userTransfer.slice[2]} ${userTransfer.slice[3]} fill !important;
  border-image-width: ${userTransfer.patternScale} !important;
  border-width: ${bwUserTransfer[0]}px ${bwUserTransfer[1]}px ${bwUserTransfer[2]}px ${bwUserTransfer[3]}px !important;
  padding: ${userTransfer.pad[0]}px ${userTransfer.pad[1]}px ${userTransfer.pad[2]}px ${userTransfer.pad[3]}px !important;
  color: ${user.textColor} !important;
}

${getModalCss(config, 'link')}`;
}

export function generateFloatCSS(config: AppConfig): string {
  const { ai, user } = config;
  const bwAi = calcSafeBw(ai.slice);
  const bwUser = calcSafeBw(user.slice);

  const aiVoice = ai.voice || { url: ai.url, slice: ai.slice, pad: [0, 8, 1, 8], patternScale: 1.4 };
  const userVoice = user.voice || { url: user.url, slice: user.slice, pad: [0, 8, 1, 8], patternScale: 1.4 };
  const bwAiVoice = calcSafeBw(aiVoice.slice);
  const bwUserVoice = calcSafeBw(userVoice.slice);

  const aiTransfer = ai.transfer || { url: ai.url, slice: ai.slice, pad: [6, 12, 6, 12], patternScale: 1.3 };
  const userTransfer = user.transfer || { url: user.url, slice: user.slice, pad: [6, 14, 6, 14], patternScale: 1.3 };
  const bwAiTransfer = calcTransferBw(aiTransfer.slice);
  const bwUserTransfer = calcTransferBw(userTransfer.slice);

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

  return `/* =======================================================
   FLOAT 聊天室全局视觉定制方案 (精准类名适配版)
   ======================================================= */

/* -------------------------------------------------------
   1. 基础气泡容器 (.chat-bubble-role-*)
   ------------------------------------------------------- */
/* 对方气泡 (AI 助手) */
.chat-bubble-role-assistant {
  position: relative !important;
  background: transparent !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  box-sizing: border-box !important;

  border-width: ${bwAi[0]}px ${bwAi[1]}px ${bwAi[2]}px ${bwAi[3]}px !important;
  border-image-source: url('${ai.url}') !important;
  border-image-slice: ${ai.slice[0]} ${ai.slice[1]} ${ai.slice[2]} ${ai.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${ai.patternScale} !important;

  padding: ${ai.pad[0]}px ${ai.pad[1]}px ${ai.pad[2]}px ${ai.pad[3]}px !important;
  color: ${ai.textColor} !important;
  -webkit-text-fill-color: ${ai.textColor} !important;
  margin-top: 5px !important;
  line-height: 1.25 !important;
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
  min-height: 24px !important;
  height: auto !important;
}

.chat-bubble-role-assistant *,
.chat-bubble-role-assistant .chat-markdown,
.chat-bubble-role-assistant .chat-markdown * {
  background-color: transparent !important;
  color: ${ai.textColor} !important;
  -webkit-text-fill-color: ${ai.textColor} !important;
  line-height: 1.25 !important;
}

/* 我的气泡 (用户发送方) */
.chat-bubble-role-user {
  position: relative !important;
  background: transparent !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  box-sizing: border-box !important;

  border-width: ${bwUser[0]}px ${bwUser[1]}px ${bwUser[2]}px ${bwUser[3]}px !important;
  border-image-source: url('${user.url}') !important;
  border-image-slice: ${user.slice[0]} ${user.slice[1]} ${user.slice[2]} ${user.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${user.patternScale} !important;

  padding: ${user.pad[0]}px ${user.pad[1]}px ${user.pad[2]}px ${user.pad[3]}px !important;
  color: ${user.textColor} !important;
  -webkit-text-fill-color: ${user.textColor} !important;
  margin-top: 5px !important;
  line-height: 1.25 !important;
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
  min-height: 24px !important;
  height: auto !important;
}

.chat-bubble-role-user *,
.chat-bubble-role-user .chat-markdown,
.chat-bubble-role-user .chat-markdown * {
  background-color: transparent !important;
  color: ${user.textColor} !important;
  -webkit-text-fill-color: ${user.textColor} !important;
  line-height: 1.25 !important;
}

/* 媒体气泡 (图片/视频) */
.chat-bubble-media {
  background: transparent !important;
  border: none !important;
  border-image: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
}

/* -------------------------------------------------------
   2. 语音条 (.voice-msg-bubble)
   ------------------------------------------------------- */
.voice-msg-bubble {
  height: 34px !important;
  min-height: 34px !important;
  max-height: 34px !important;
  box-sizing: border-box !important;
  display: flex !important;
  align-items: center !important;
}

/* 对方语音条 */
.chat-bubble-role-assistant .voice-msg-bubble,
.chat-bubble-role-assistant.voice-msg-bubble {
  background: transparent !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  border-width: ${bwAiVoice[0]}px ${bwAiVoice[1]}px ${bwAiVoice[2]}px ${bwAiVoice[3]}px !important;
  border-image-source: url('${aiVoice.url}') !important;
  border-image-slice: ${aiVoice.slice[0]} ${aiVoice.slice[1]} ${aiVoice.slice[2]} ${aiVoice.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${aiVoice.patternScale} !important;
  padding: ${aiVoice.pad[0]}px ${aiVoice.pad[1]}px ${aiVoice.pad[2]}px ${aiVoice.pad[3]}px !important;
}

/* 我方语音条 */
.chat-bubble-role-user .voice-msg-bubble,
.chat-bubble-role-user.voice-msg-bubble {
  background: transparent !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  border-width: ${bwUserVoice[0]}px ${bwUserVoice[1]}px ${bwUserVoice[2]}px ${bwUserVoice[3]}px !important;
  border-image-source: url('${userVoice.url}') !important;
  border-image-slice: ${userVoice.slice[0]} ${userVoice.slice[1]} ${userVoice.slice[2]} ${userVoice.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${userVoice.patternScale} !important;
  padding: ${userVoice.pad[0]}px ${userVoice.pad[1]}px ${userVoice.pad[2]}px ${userVoice.pad[3]}px !important;
}

/* 语音文字与时长 (.voice-msg-dur) */
.chat-bubble-role-assistant .voice-msg-dur,
.chat-bubble-role-assistant .voice-msg-bubble span,
.chat-bubble-role-assistant .voice-msg-bubble p {
  color: ${ai.textColor} !important;
  -webkit-text-fill-color: ${ai.textColor} !important;
}
.chat-bubble-role-user .voice-msg-dur,
.chat-bubble-role-user .voice-msg-bubble span,
.chat-bubble-role-user .voice-msg-bubble p {
  color: ${user.textColor} !important;
  -webkit-text-fill-color: ${user.textColor} !important;
}

/* 语音波形与播放图标 (.voice-msg-icon, .voice-msg-bar, .voice-msg-bars) */
.chat-bubble-role-assistant .voice-msg-icon,
.chat-bubble-role-assistant .voice-msg-bar,
.chat-bubble-role-assistant .voice-msg-bars,
.chat-bubble-role-assistant .voice-msg-bars[data-playing] {
  color: ${ai.textColor} !important;
  background-color: ${ai.textColor} !important;
  fill: ${ai.textColor} !important;
}
.chat-bubble-role-user .voice-msg-icon,
.chat-bubble-role-user .voice-msg-bar,
.chat-bubble-role-user .voice-msg-bars,
.chat-bubble-role-user .voice-msg-bars[data-playing] {
  color: ${user.textColor} !important;
  background-color: ${user.textColor} !important;
  fill: ${user.textColor} !important;
}

/* 包含语音条时清空外层气泡默认边框 */
.chat-bubble-role-assistant:has(.voice-msg-bubble),
.chat-bubble-role-user:has(.voice-msg-bubble) {
  background: transparent !important;
  border: none !important;
  border-image: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* -------------------------------------------------------
   3. 转账卡片 / 红包卡片 / 系统标准卡片
   ------------------------------------------------------- */
/* 对方接收端：转账/红包/礼物卡片 (浅底素材 -> 纯黑字) */
.chat-transfer-card,
.chat-red-packet-card,
.chat-gift-card,
.chat-music-share-card,
.scan-pay-card,
.chat-app-card,
.chat-html-inline,
.chat-bubble-role-assistant .chat-transfer-card,
.chat-bubble-role-assistant .chat-red-packet-card {
  position: relative !important;
  background: transparent !important;
  border-style: solid !important;
  border-color: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  box-sizing: border-box !important;
  color: ${aiTransferTextColor} !important;

  border-width: ${bwAiTransfer[0]}px ${bwAiTransfer[1]}px ${bwAiTransfer[2]}px ${bwAiTransfer[3]}px !important;
  border-image-source: url('${aiTransfer.url}') !important;
  border-image-slice: ${aiTransfer.slice[0]} ${aiTransfer.slice[1]} ${aiTransfer.slice[2]} ${aiTransfer.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${aiTransfer.patternScale} !important;
  padding: ${aiTransfer.pad[0]}px ${aiTransfer.pad[1]}px ${aiTransfer.pad[2]}px ${aiTransfer.pad[3]}px !important;
}

.chat-transfer-card *,
.chat-red-packet-card *,
.chat-gift-card *,
.chat-music-share-card *,
.scan-pay-card *,
.chat-app-card *,
.chat-html-inline *,
.chat-bubble-role-assistant .chat-transfer-card *,
.chat-bubble-role-assistant .chat-red-packet-card * {
  text-shadow: none !important;
  color: ${aiTransferTextColor} !important;
}

/* 我方发送端：转账/红包卡片 (黑底素材 -> 纯白字) */
.chat-bubble-role-user .chat-transfer-card,
.chat-bubble-role-user .chat-red-packet-card {
  border-width: ${bwUserTransfer[0]}px ${bwUserTransfer[1]}px ${bwUserTransfer[2]}px ${bwUserTransfer[3]}px !important;
  border-image-source: url('${userTransfer.url}') !important;
  border-image-slice: ${userTransfer.slice[0]} ${userTransfer.slice[1]} ${userTransfer.slice[2]} ${userTransfer.slice[3]} fill !important;
  border-image-repeat: stretch !important;
  border-image-width: ${userTransfer.patternScale} !important;
  padding: ${userTransfer.pad[0]}px ${userTransfer.pad[1]}px ${userTransfer.pad[2]}px ${userTransfer.pad[3]}px !important;
}

.chat-bubble-role-user .chat-transfer-card *,
.chat-bubble-role-user .chat-red-packet-card * {
  text-shadow: none !important;
  color: ${userTransferTextColor} !important;
}

/* 预留红包和转账的背景渐变 (取消注释可一键上色):
.chat-red-packet-body,
.chat-transfer-body {
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.12) 100%) !important;
}
*/

/* 包含卡片时清空外层气泡边框 */
.chat-bubble-role-assistant:has(.chat-transfer-card),
.chat-bubble-role-assistant:has(.chat-red-packet-card),
.chat-bubble-role-assistant:has(.chat-gift-card),
.chat-bubble-role-user:has(.chat-transfer-card),
.chat-bubble-role-user:has(.chat-red-packet-card),
.chat-bubble-role-user:has(.chat-gift-card) {
  background: transparent !important;
  border: none !important;
  border-image: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* -------------------------------------------------------
   4. 位置卡片 (.chat-location-card)
   ------------------------------------------------------- */
.chat-location-card {
  border-radius: 12px !important;
  overflow: hidden !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  background: #ffffff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
}

.chat-location-map {
  width: 100% !important;
  height: 110px !important;
  object-fit: cover !important;
}

.chat-location-label {
  padding: 8px 10px !important;
  font-size: 12px !important;
  line-height: 1.3 !important;
  color: #1a1a1a !important;
}

/* -------------------------------------------------------
   5. 弹窗 / 长按菜单 / 引用与编辑框
   ------------------------------------------------------- */
.ctx-menu {
  background: #232326 !important;
  color: #ffffff !important;
  border-radius: 10px !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  padding: 4px !important;
  z-index: 120 !important;
}

.ctx-menu-btn {
  color: #f1f1f1 !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  font-size: 13px !important;
  transition: background 0.15s ease !important;
}

.ctx-menu-btn:hover {
  background: rgba(255, 255, 255, 0.12) !important;
}

.ctx-menu-btn-danger {
  color: #ff5252 !important;
}

.chat-quote-bar {
  border-left: 3px solid rgba(120, 120, 120, 0.5) !important;
  padding-left: 8px !important;
  margin: 4px 0 !important;
  font-size: 12px !important;
  opacity: 0.8 !important;
}

.chat-inline-edit-textarea {
  background: rgba(255, 255, 255, 0.85) !important;
  border: 1.5px solid #000000 !important;
  border-radius: 8px !important;
  padding: 6px 8px !important;
  font-size: 13px !important;
  color: #000000 !important;
}

${getModalCss(config, 'sully')}`;
}

export function generateCSS(config: AppConfig, type: ExportType): string {
  if (type === 'float') {
    return generateFloatCSS(config);
  }
  return type === 'sully' ? generateSullyCSS(config) : generateLinkCSS(config);
}
