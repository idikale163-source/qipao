import React, { useState } from 'react';
import { AppConfig, ModalAssetStrategy } from '../types';
import { Check, ShieldAlert, Sparkles, User, Bot, Ban, ChevronDown, ChevronUp } from 'lucide-react';

interface ModalStrategyControlProps {
  config: AppConfig;
  onUpdateStrategy: (strategy: ModalAssetStrategy) => void;
}

export const ModalStrategyControl: React.FC<ModalStrategyControlProps> = ({
  config,
  onUpdateStrategy,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentStrategy: ModalAssetStrategy = config.modalStrategy || 'ai';

  const strategies: {
    id: ModalAssetStrategy;
    title: string;
    badge: string;
    badgeColor: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'ai',
      title: '统一绑定 AI (对方) 素材',
      badge: '⭐ 推荐 · 社区标准',
      badgeColor: 'bg-black text-white',
      desc: '最稳定方案。Sully 全局弹窗原生不带角色类名，统一绑定 AI 气泡素材，确保收款详情弹窗渲染完美、绝对无覆盖冲突。',
      icon: <Bot className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'user',
      title: '统一绑定 用户 (我方) 素材',
      badge: '我方视觉',
      badgeColor: 'bg-emerald-600 text-white',
      desc: '若你更希望转账详情弹窗呈现自己的气泡风格，一键将全局弹窗绑定为你的素材与九宫格切片。',
      icon: <User className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'smart',
      title: '智能双向嗅探 (尝试区分两方)',
      badge: '实验性伪类分流',
      badgeColor: 'bg-purple-600 text-white',
      desc: '利用现代 CSS :has() 探测弹窗内是否有“确认收款”主按钮。在支持的环境中让 AI 弹窗吃 AI 素材，我的转账吃用户素材。',
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
    },
    {
      id: 'none',
      title: '不美化弹窗 (保留系统原生)',
      badge: '原生卡片',
      badgeColor: 'bg-gray-500 text-white',
      desc: '仅对聊天流中的转账小卡片注入九宫格，详情弹窗保持 Sully 默认白底圆角样式，彻底避免边框拉伸。',
      icon: <Ban className="w-4 h-4 text-gray-500" />,
    },
  ];

  const currentStrategyObj = strategies.find((s) => s.id === currentStrategy) || strategies[0];

  return (
    <div className="bg-white border-2 border-black rounded-xl p-3 mb-4 shadow-[3px_3px_0px_#000] transition-all">
      {/* 头部摘要栏：支持点击展开/折叠 */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between gap-2 cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider text-black">
              转账弹窗素材策略
            </span>
          </div>
          <span className="text-[10px] bg-neutral-100 text-black border border-black font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <span>当前生效:</span>
            <span className="font-black text-amber-700">{currentStrategyObj.title.split(' ')[0]}</span>
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${currentStrategyObj.badgeColor}`}>
            {currentStrategyObj.badge}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-xs font-black text-black bg-[#f0f2f5] hover:bg-black hover:text-white border border-black px-2.5 py-1 rounded-md shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center gap-1 transition-all shrink-0"
        >
          <span>{isExpanded ? '收起配置' : '展开配置'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 展开区域：原理解析与详细卡片 */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t-2 border-black/10 animate-fadeIn">
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 mb-3 text-[11px] text-gray-700 leading-relaxed">
            <p>
              <strong>为什么需要策略？</strong> Sully / LINK 的转账详情弹窗是<strong>脱离聊天列表的全局独立组件</strong>（Portal 挂载到 body），<strong>官方页面 DOM 未给弹窗容器打上 role-ai 或 role-user 标记</strong>。因此纯 CSS 无法自动像气泡那样按左右位置区分，在此可自由切换归属方案：
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {strategies.map((item) => {
              const isSelected = currentStrategy === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onUpdateStrategy(item.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between select-none ${
                    isSelected
                      ? 'border-black bg-[#fafaf9] shadow-[3px_3px_0px_#000] ring-1 ring-black'
                      : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5 font-black text-xs text-black">
                        {item.icon}
                        <span>{item.title}</span>
                      </div>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-normal">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-gray-500">
                      {isSelected ? '✓ 当前已选中生效' : '点击切换为该策略'}
                    </span>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 bg-white text-transparent'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
