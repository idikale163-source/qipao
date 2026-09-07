import React, { useState } from 'react';
import { SavedPreset, AppConfig, ExportType } from '../types';
import { Save, Plus, Trash2, Edit2, Check, X, Bookmark } from 'lucide-react';

interface PresetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'list' | 'save_new';
  currentConfig: AppConfig;
  currentExportType: ExportType;
  activePresetId: string | null;
  presets: SavedPreset[];
  onSelectPreset: (preset: SavedPreset) => void;
  onSaveNewPreset: (name: string, note: string) => void;
  onUpdatePresetMeta: (id: string, name: string, note: string) => void;
  onDeletePreset: (id: string) => void;
}

export const PresetManagerModal: React.FC<PresetManagerModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
  currentConfig,
  currentExportType,
  activePresetId,
  presets,
  onSelectPreset,
  onSaveNewPreset,
  onUpdatePresetMeta,
  onDeletePreset,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'save_new'>(initialMode);
  const [newName, setNewName] = useState('');
  const [newNote, setNewNote] = useState('');

  // Inline delete confirm state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Editing row
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingNote, setEditingNote] = useState('');

  // Reset inputs when opening in save_new mode
  React.useEffect(() => {
    if (isOpen) {
      setViewMode(initialMode);
      if (initialMode === 'save_new') {
        setNewName(`自定预设 #${presets.length + 1}`);
        setNewNote('');
      }
      setEditingId(null);
      setDeletingId(null);
    }
  }, [isOpen, initialMode, presets.length]);

  if (!isOpen) return null;

  const handleStartEdit = (preset: SavedPreset) => {
    setEditingId(preset.id);
    setEditingName(preset.name);
    setEditingNote(preset.note || '');
    setDeletingId(null);
  };

  const handleSaveEdit = (id: string) => {
    if (!editingName.trim()) return;
    onUpdatePresetMeta(id, editingName.trim(), editingNote.trim());
    setEditingId(null);
  };

  const handleConfirmSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onSaveNewPreset(newName.trim(), newNote.trim());
    onClose();
  };

  const platformBadgeColor = (type: ExportType) => {
    switch (type) {
      case 'sully':
        return 'bg-blue-100 text-blue-800 border-blue-400';
      case 'float':
        return 'bg-emerald-100 text-emerald-800 border-emerald-400';
      case 'link':
        return 'bg-purple-100 text-purple-800 border-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000] w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* 顶部标题栏 */}
        <div className="bg-[#f0f2f5] px-4 py-3 border-b-2 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black text-white rounded-lg flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900">
                {viewMode === 'save_new' ? '保存为新预设' : '预设管理与切换'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                浏览器永久保存 · 支持修改名称备注与一键删除
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg border-2 border-black bg-white hover:bg-gray-100 text-gray-700 hover:text-black transition-all shadow-[2px_2px_0px_#000]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 视图切换 Tabs */}
        <div className="px-4 py-2 border-b border-gray-200 bg-white flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                setDeletingId(null);
              }}
              className={`text-xs font-black px-3 py-1 rounded-lg border-2 border-black transition-all shadow-[1.5px_1.5px_0px_#000] ${
                viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              预设列表 ({presets.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setNewName(`自定预设 #${presets.length + 1}`);
                setNewNote('');
                setViewMode('save_new');
                setDeletingId(null);
              }}
              className={`text-xs font-black px-3 py-1 rounded-lg border-2 border-black transition-all shadow-[1.5px_1.5px_0px_#000] flex items-center gap-1 ${
                viewMode === 'save_new' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>保存当前配置为预设</span>
            </button>
          </div>
        </div>

        {/* 内容主体 */}
        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === 'save_new' ? (
            <form onSubmit={handleConfirmSaveNew} className="space-y-4 max-w-md mx-auto py-2">
              <div className="bg-[#f0f2f5] border-2 border-black rounded-xl p-3 text-xs space-y-1">
                <div className="font-black text-gray-900 flex items-center justify-between">
                  <span>当前目标平台：</span>
                  <span className={`px-2 py-0.5 rounded border text-[11px] font-black uppercase ${platformBadgeColor(currentExportType)}`}>
                    {currentExportType}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  保存后，每次载入该预设都会自动同步切换为当前平台（{currentExportType.toUpperCase()}）及切片数值。
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-800 mb-1">
                  预设名称 *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例如：粉色猫耳、自制深色气泡..."
                  className="w-full bg-[#f0f2f5] border-2 border-black rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-800 mb-1">
                  备注说明 (选填，可后续随时修改)
                </label>
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="例如：适合小文字、原图带阴影等..."
                  className="w-full bg-[#f0f2f5] border-2 border-black rounded-lg px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-black bg-white hover:bg-gray-100"
                >
                  返回列表
                </button>
                <button
                  type="submit"
                  className="text-xs font-black px-4 py-1.5 rounded-lg border-2 border-black bg-black text-white hover:bg-neutral-800 shadow-[2px_2px_0px_#000] flex items-center gap-1.5 active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>确认永久保存</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2.5">
              {presets.map((preset) => {
                const isActive = preset.id === activePresetId;
                const isEditing = editingId === preset.id;
                const isConfirmingDelete = deletingId === preset.id;

                return (
                  <div
                    key={preset.id}
                    className={`bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_#000] transition-all flex flex-col gap-2 ${
                      isActive ? 'ring-2 ring-black bg-blue-50/20' : 'hover:bg-gray-50/60'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2 bg-[#f0f2f5] p-2.5 rounded-lg border border-black">
                        <div>
                          <label className="block text-[10px] font-black text-gray-600 mb-0.5">预设名称</label>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full bg-white border border-black rounded px-2 py-1 text-xs font-black text-gray-900 focus:outline-none"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-600 mb-0.5">备注说明</label>
                          <input
                            type="text"
                            value={editingNote}
                            onChange={(e) => setEditingNote(e.target.value)}
                            placeholder="填写备注..."
                            className="w-full bg-white border border-black rounded px-2 py-1 text-xs font-medium text-gray-900 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="text-[11px] font-bold px-2 py-1 rounded bg-white border border-black text-gray-700"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(preset.id)}
                            className="text-[11px] font-black px-3 py-1 rounded bg-black text-white flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>保存备注</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded border ${platformBadgeColor(preset.exportType || 'sully')}`}>
                              {preset.exportType || 'sully'}
                            </span>
                            <h4 className="text-xs font-black text-gray-900 truncate">
                              {preset.name}
                            </h4>
                            {isActive && (
                              <span className="text-[10px] font-black bg-black text-white px-1.5 py-0.2 rounded">
                                使用中
                              </span>
                            )}
                            {preset.isBuiltin && (
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1 rounded">
                                内置
                              </span>
                            )}
                          </div>
                          {preset.note && (
                            <p className="text-[11px] text-gray-600 truncate mt-0.5">
                              {preset.note}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1 bg-red-50 border border-red-400 px-2 py-1 rounded-lg animate-in fade-in duration-100">
                              <span className="text-[10px] text-red-700 font-black">确认删?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeletePreset(preset.id);
                                  setDeletingId(null);
                                }}
                                className="text-[10px] font-black px-2 py-0.5 rounded bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
                              >
                                确定
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* 载入按钮 */}
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectPreset(preset);
                                  onClose();
                                }}
                                className={`text-xs font-black px-2.5 py-1 rounded-lg border-2 border-black transition-all shadow-[1.5px_1.5px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] ${
                                  isActive ? 'bg-black text-white' : 'bg-white hover:bg-gray-100 text-black'
                                }`}
                              >
                                {isActive ? '已载入' : '载入'}
                              </button>

                              {/* 修改备注按钮 */}
                              <button
                                type="button"
                                onClick={() => handleStartEdit(preset)}
                                className="p-1 rounded-lg border border-black bg-white hover:bg-gray-100 text-gray-700 hover:text-black transition-colors"
                                title="修改名称与备注"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* 删除按钮 */}
                              {!preset.isBuiltin && (
                                <button
                                  type="button"
                                  onClick={() => setDeletingId(preset.id)}
                                  className="p-1 rounded-lg border border-red-400 bg-white hover:bg-red-50 text-red-600 transition-colors"
                                  title="删除此预设"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="bg-[#f0f2f5] px-4 py-2.5 border-t-2 border-black flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-gray-500 font-medium">
            所有保存与修改会自动存入浏览器 localStorage。
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-black px-3 py-1 rounded-lg border-2 border-black bg-white hover:bg-gray-100"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
