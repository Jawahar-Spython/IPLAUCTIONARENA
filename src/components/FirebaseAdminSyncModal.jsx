import React, { useState } from 'react';
import { X, Database, Check, RefreshCw, Key, Radio, Send } from 'lucide-react';
import { getFirebaseConfig } from '../services/firebase';
import { useAuction } from '../context/AuctionContext';
import { syncAuctionStateToFirebase } from '../services/firebase';

export function FirebaseAdminSyncModal({ isOpen, onClose }) {
  const { players, teams, stagePlayer, currentBid } = useAuction();
  const currentConfig = getFirebaseConfig();
  
  const [dbUrlInput, setDbUrlInput] = useState(currentConfig.databaseURL || '');
  const [apiKeyInput, setApiKeyInput] = useState(currentConfig.apiKey || '');
  const [projectIdInput, setProjectIdInput] = useState(currentConfig.projectId || '');
  const [syncStatus, setSyncStatus] = useState(null);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    const newConfig = {
      ...currentConfig,
      databaseURL: dbUrlInput.trim(),
      apiKey: apiKeyInput.trim(),
      projectId: projectIdInput.trim()
    };

    localStorage.setItem('ipl_firebase_config', JSON.stringify(newConfig));
    window.location.reload();
  };

  const handleResetConfig = () => {
    localStorage.removeItem('ipl_firebase_config');
    window.location.reload();
  };

  const handleForceSyncNow = async () => {
    setSyncStatus('loading');
    const success = await syncAuctionStateToFirebase({
      players,
      teams,
      stagePlayerId: stagePlayer?.id || null,
      currentBid
    });

    if (success) {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus(null), 3000);
    } else {
      setSyncStatus('error');
    }
  };

  const isConfigured = Boolean(currentConfig.databaseURL);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Firebase Realtime Broadcast Sync</h3>
              <p className="text-xs text-slate-400">Admin Control Panel Database Connection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="font-bold text-slate-200">
                {isConfigured ? 'FIREBASE RTDB CONNECTED' : 'FIREBASE NOT CONFIGURED YET'}
              </span>
            </div>

            <button
              onClick={handleForceSyncNow}
              disabled={!isConfigured || syncStatus === 'loading'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors disabled:opacity-40"
            >
              {syncStatus === 'loading' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Sync Now</span>
            </button>
          </div>

          {syncStatus === 'success' && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px] flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Broadcast pushed live to Firebase Realtime Database!</span>
            </div>
          )}

          {syncStatus === 'error' && (
            <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 font-semibold text-[11px]">
              ✕ Failed to broadcast to Firebase. Check Database URL and security rules.
            </div>
          )}

          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Firebase Database URL</label>
              <input
                type="text"
                placeholder="https://your-project-default-rtdb.firebaseio.com"
                value={dbUrlInput}
                onChange={(e) => setDbUrlInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">API Key (Optional)</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Project ID</label>
              <input
                type="text"
                placeholder="my-ipl-project-id"
                value={projectIdInput}
                onChange={(e) => setProjectIdInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleResetConfig}
                className="text-slate-400 hover:text-rose-400 text-xs font-semibold underline"
              >
                Reset
              </button>

              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
              >
                Save Credentials
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
