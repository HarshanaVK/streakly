'use client';

import React, { useState } from 'react';
import { useStreakly } from '@/lib/storage';
import { formatActivityTime } from '@/lib/time';
import {
  ShieldCheck,
  UserCheck,
  RotateCcw,
  Download,
  Upload,
  RefreshCw,
  X,
  History,
  FileJson,
  Check,
} from 'lucide-react';

interface MasterAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MasterAdminPanel({ isOpen, onClose }: MasterAdminPanelProps) {
  const {
    actorProfileId,
    viewingProfileId,
    switchViewingProfile,
    activityLog,
    resetProfileStreak,
    exportProfileJson,
    importProfileJson,
    refreshNow,
    isSyncing,
  } = useStreakly();

  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen || actorProfileId !== 'visal') return null;

  const handleExport = () => {
    const jsonStr = exportProfileJson();
    navigator.clipboard.writeText(jsonStr);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const ok = importProfileJson(importText.trim());
    if (ok) {
      setShowImportBox(false);
      setImportText('');
    } else {
      alert('Invalid JSON format.');
    }
  };

  const handleDoReset = () => {
    resetProfileStreak();
    setConfirmReset(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-card rounded-4xl p-6 sm:p-8 shadow-2xl border border-blue-500/30 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Master Admin Console</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 uppercase">
                  Visal
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Full administration over all profiles, live audit feed & data portability
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile View Switcher */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Switch Target Workspace View
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => switchViewingProfile('visal')}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                viewingProfileId === 'visal'
                  ? 'bg-blue-600/30 border-blue-500 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⚡</span>
                <div className="text-left">
                  <span className="block font-bold text-sm text-white">Visal (Master)</span>
                  <span className="text-[11px] text-blue-300">Active Profile</span>
                </div>
              </div>
              {viewingProfileId === 'visal' && <Check className="w-4 h-4 text-blue-400" />}
            </button>

            <button
              onClick={() => switchViewingProfile('pooja')}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                viewingProfileId === 'pooja'
                  ? 'bg-rose-600/30 border-rose-500 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🌸</span>
                <div className="text-left">
                  <span className="block font-bold text-sm text-white">Pooja (Member)</span>
                  <span className="text-[11px] text-rose-300">Oversee Space</span>
                </div>
              </div>
              {viewingProfileId === 'pooja' && <Check className="w-4 h-4 text-rose-400" />}
            </button>
          </div>
        </div>

        {/* Master Actions Bar */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleExport}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>{copiedExport ? 'Copied to Clipboard!' : 'Export JSON'}</span>
          </button>

          <button
            onClick={() => setShowImportBox(!showImportBox)}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4 text-violet-400" />
            <span>Import Backup</span>
          </button>

          <button
            onClick={() => setConfirmReset(true)}
            className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-300 flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset History</span>
          </button>
        </div>

        {/* Import JSON Box */}
        {showImportBox && (
          <form onSubmit={handleImportSubmit} className="mb-6 p-4 rounded-3xl bg-white/5 border border-white/15 space-y-3">
            <label className="block text-xs font-bold text-white">
              Paste Profile JSON Backup
            </label>
            <textarea
              rows={4}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"profileId": "visal", ...}'
              className="w-full p-3 rounded-xl bg-slate-900 border border-white/20 text-white font-mono text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImportBox(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md"
              >
                Restore
              </button>
            </div>
          </form>
        )}

        {/* Reset Confirmation Dialog */}
        {confirmReset && (
          <div className="mb-6 p-4 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-center space-y-3">
            <p className="text-sm font-bold text-white">
              Are you sure you want to reset {viewingProfileId === 'pooja' ? "Pooja's" : "your"} streak history?
            </p>
            <p className="text-xs text-rose-200">
              This will clear all daily goal completion logs for this profile.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleDoReset}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg"
              >
                Yes, Reset Logs
              </button>
            </div>
          </div>
        )}

        {/* Live Activity Audit Feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <History className="w-4 h-4 text-accent-primary" />
              <span>Real-Time Audit Stream</span>
            </h3>
            <span className="text-[11px] text-white/40">
              {activityLog.length} events logged
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {activityLog.length === 0 ? (
              <p className="text-xs text-white/40 py-4 text-center">
                No recent activity recorded.
              </p>
            ) : (
              activityLog.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 mr-2">
                    <span className="text-base select-none">
                      {act.actor === 'visal' ? '⚡' : '🌸'}
                    </span>
                    <span className="text-white font-medium truncate">
                      {act.text}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/50 font-mono whitespace-nowrap">
                    {formatActivityTime(act.at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
