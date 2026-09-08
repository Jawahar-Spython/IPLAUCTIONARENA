import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Gavel, Volume2, VolumeX, Shield, Tv, DollarSign, Users, BookOpen, Search, Edit3, Check, Database } from 'lucide-react';
import { FirebaseAdminSyncModal } from './FirebaseAdminSyncModal';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { bankAccountTotal, tagline, setTagline, soundEnabled, setSoundEnabled } = useAuction();
  const [isEditingTagline, setIsEditingTagline] = useState(false);
  const [taglineInput, setTaglineInput] = useState(tagline);

  const handleSaveTagline = () => {
    if (taglineInput.trim()) {
      setTagline(taglineInput.trim());
    }
    setIsEditingTagline(false);
  };

  const navItems = [
    { id: 'stage', label: 'Live Arena', icon: Tv },
    { id: 'teams', label: 'Team Squads', icon: Shield },
    { id: 'auctioneer', label: 'Auctioneer Hub', icon: Gavel },
    { id: 'players', label: 'Player Catalog', icon: Users },
    { id: 'ledger', label: 'Bank Ledger', icon: DollarSign },
    { id: 'rules', label: 'Rules & Engine', icon: BookOpen },
  ];

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/95 backdrop-blur-md border-b border-amber-500/20 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          
          {/* Brand Logo & Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center animate-pulse-glow">
              <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
                <Gavel className="w-6 h-6 text-amber-400 -rotate-12" />
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 font-display">
                  IPL AUCTION ARENA
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md">
                  ADMIN PANEL
                </span>
              </div>

              {/* Editable Tagline */}
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                {isEditingTagline ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={taglineInput}
                      onChange={(e) => setTaglineInput(e.target.value)}
                      className="bg-slate-800 border border-amber-500/40 rounded px-2 py-0.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <button
                      onClick={handleSaveTagline}
                      className="text-emerald-400 hover:text-emerald-300 p-1"
                      title="Save tagline"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingTagline(true)}>
                    <span className="italic font-medium text-slate-400 group-hover:text-amber-300 transition-colors">
                      "{tagline}"
                    </span>
                    <Edit3 className="w-3 h-3 text-slate-500 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Header Stats & Controls */}
          <div className="flex items-center gap-3">
            {/* Total Ledger Spent Badge */}
            <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-500/30 rounded-lg px-3 py-1.5">
              <div className="p-1 rounded bg-amber-500/10 text-amber-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Bank Ledger</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  ₹{bankAccountTotal.toFixed(2)} Cr
                </span>
              </div>
            </div>

            {/* Firebase Live Sync Button */}
            <button
              onClick={() => setIsFirebaseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold transition-all"
              title="Firebase Live Broadcast Settings"
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Firebase Sync</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-all ${
                soundEnabled
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title={soundEnabled ? 'Mute Arena Audio' : 'Enable Arena Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Navigation Bar Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/20 font-extrabold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <FirebaseAdminSyncModal 
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </header>
  );
};
