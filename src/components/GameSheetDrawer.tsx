import React, { useState } from 'react';
import {
  X,
  Shield,
  Heart,
  Zap,
  Package,
  Plus,
  Trash2,
  Dices,
  Sparkles,
  Check
} from 'lucide-react';
import { ChatSession, GameSheet, InventoryItem, StatItem } from '../types';

interface GameSheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession;
  onUpdateGameSheet: (newSheet: GameSheet) => void;
  onRollDice: (diceType: string, modifier: number, statChecked: string) => void;
}

export const GameSheetDrawer: React.FC<GameSheetDrawerProps> = ({
  isOpen,
  onClose,
  session,
  onUpdateGameSheet,
  onRollDice,
}) => {
  const sheet = session.gameSheet || {
    enabled: true,
    characterName: session.playerName,
    stats: [],
    inventory: [],
    statusEffects: [],
  };

  const [newStatKey, setNewStatKey] = useState('');
  const [newStatValue, setNewStatValue] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newStatusEffect, setNewStatusEffect] = useState('');

  if (!isOpen) return null;

  const handleAddStat = () => {
    if (!newStatKey.trim()) return;
    const newStats: StatItem[] = [
      ...(sheet.stats || []),
      {
        id: `stat-${Date.now()}`,
        key: newStatKey.trim(),
        value: isNaN(Number(newStatValue)) ? newStatValue : Number(newStatValue),
      },
    ];
    onUpdateGameSheet({ ...sheet, stats: newStats });
    setNewStatKey('');
    setNewStatValue('');
  };

  const handleRemoveStat = (id: string) => {
    onUpdateGameSheet({ ...sheet, stats: sheet.stats.filter(s => s.id !== id) });
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const newInv: InventoryItem[] = [
      ...(sheet.inventory || []),
      {
        id: `item-${Date.now()}`,
        name: newItemName.trim(),
        description: newItemDesc.trim(),
        quantity: 1,
      },
    ];
    onUpdateGameSheet({ ...sheet, inventory: newInv });
    setNewItemName('');
    setNewItemDesc('');
  };

  const handleRemoveItem = (id: string) => {
    onUpdateGameSheet({ ...sheet, inventory: sheet.inventory.filter(i => i.id !== id) });
  };

  const handleAddStatus = () => {
    if (!newStatusEffect.trim()) return;
    onUpdateGameSheet({
      ...sheet,
      statusEffects: [...(sheet.statusEffects || []), newStatusEffect.trim()],
    });
    setNewStatusEffect('');
  };

  const handleRemoveStatus = (effect: string) => {
    onUpdateGameSheet({
      ...sheet,
      statusEffects: (sheet.statusEffects || []).filter(e => e !== effect),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl text-slate-100 p-6 overflow-y-auto">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-400/30 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-300 mana-pulse">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-cinzel font-bold text-base bg-gradient-to-r from-sky-300 via-amber-200 to-indigo-200 bg-clip-text text-transparent">
                  GRIMOIRE & MANA SHEET
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-300 border border-sky-700/60">
                  魔力測定
                </span>
              </div>
              <p className="text-xs text-slate-400">Penyihir: {sheet.characterName || session.playerName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 flex-1">
          {/* Quick Dice Roll Action (FR-6.1) */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Dices className="w-4 h-4 text-amber-400" /> Lemparan Dadu Virtual (Server-side)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['d6', 'd20', 'd100'].map(dt => (
                <button
                  key={dt}
                  onClick={() => {
                    onRollDice(dt, 0, 'Uji Kemampuan');
                    onClose();
                  }}
                  className="px-3 py-2 rounded-lg bg-amber-900/60 hover:bg-amber-800 text-amber-100 text-xs font-bold border border-amber-700 transition"
                >
                  Roll {dt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Stats List */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center justify-between">
              <span>Statistik Karakter</span>
            </h4>

            <div className="space-y-2 mb-3">
              {(sheet.stats || []).map(stat => (
                <div key={stat.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300">{stat.key}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400">
                      {stat.value}{stat.max ? `/${stat.max}` : ''}
                    </span>
                    <button
                      onClick={() => handleRemoveStat(stat.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Stat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama Stat (mis. HP)"
                value={newStatKey}
                onChange={e => setNewStatKey(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
              <input
                type="text"
                placeholder="Nilai (100)"
                value={newStatValue}
                onChange={e => setNewStatValue(e.target.value)}
                className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
              <button
                onClick={handleAddStat}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                +
              </button>
            </div>
          </div>

          {/* Inventory Items */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" />
              Inventori & Item ({sheet.inventory?.length || 0})
            </h4>

            <div className="space-y-2 mb-3">
              {(sheet.inventory || []).map(item => (
                <div key={item.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block">{item.name} (x{item.quantity})</span>
                    {item.description && <span className="text-[11px] text-slate-400 block">{item.description}</span>}
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nama Item Baru (mis. Ramuan Penyembuh)"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Keterangan singkat item..."
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                />
                <button
                  onClick={handleAddItem}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>

          {/* Status Effects */}
          <div>
            <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3">
              Status Efek
            </h4>

            <div className="flex flex-wrap gap-2 mb-3">
              {(sheet.statusEffects || []).map(eff => (
                <span
                  key={eff}
                  className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-300 text-xs flex items-center gap-1.5"
                >
                  {eff}
                  <button
                    onClick={() => handleRemoveStatus(eff)}
                    className="text-amber-500 hover:text-rose-400 transition"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Efek Baru (mis. Terluka / Racun)"
                value={newStatusEffect}
                onChange={e => setNewStatusEffect(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
              />
              <button
                onClick={handleAddStatus}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
