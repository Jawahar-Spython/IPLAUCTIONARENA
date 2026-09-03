import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Gavel, DollarSign, RefreshCw, Download, ArrowUpRight, Search, AlertOctagon, Shield, Layers } from 'lucide-react';
import { CATEGORY_ROUNDS } from '../data/teams';

export const AuctioneerDashboard = ({ onNavigateToStage }) => {
  const {
    bankAccountTotal,
    teams,
    players,
    recallPlayerToStage,
    resetAuction,
    transactions,
    currentRoundIndex,
    currentRoundName,
    changeCategoryRound,
    roundQueue,
  } = useAuction();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const pendingPlayers = players.filter((p) => p.status !== 'Sold');

  const filteredPlayers = pendingPlayers.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.originalTeam.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleSendToStage = (playerId) => {
    recallPlayerToStage(playerId);
    onNavigateToStage();
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ teams, players, bankAccountTotal, transactions }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `IPL_AUCTION_ARENA_EXPORT_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8">
      
      {/* Central Bank Account Ledger Banner */}
      <div className="stadium-card-gold rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Gavel className="w-8 h-8 -rotate-12" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">AUCTIONEER CENTRAL BANK LEDGER</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white font-mono mt-0.5">
                ₹{bankAccountTotal.toFixed(2)} <span className="text-xl text-amber-400 font-sans">Crore Collected</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Active Category: <strong>{currentRoundName}</strong> ({roundQueue.length} Queue)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 transition-all shadow"
            >
              <Download className="w-4 h-4 text-amber-400" /> Export Data
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Reset Auction
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertOctagon className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Reset Entire Auction?</h3>
            </div>
            <p className="text-xs text-slate-300">
              This action will reset all 10 teams' purses back to ₹120 Crore, clear all purchased squad rosters, reset the central bank ledger, and mark all players unsold.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAuction();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-extrabold hover:bg-rose-500"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10 Team Financial Matrix Overview Table */}
      <div className="stadium-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" /> All 10 Teams Financial Matrix Overview
          </h3>
          <span className="text-xs font-mono text-slate-400">10 College Teams</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold">
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Remaining Purse</th>
                <th className="py-3 px-4">Spent</th>
                <th className="py-3 px-4">Squad Count</th>
                <th className="py-3 px-4">Marquee Used</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {teams.map((t) => {
                const spent = t.initialPurse - t.remainingPurse;
                return (
                  <tr key={t.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2">
                      <img src={t.logo} alt={t.shortName} className="w-5 h-5 object-contain" />
                      {t.name} ({t.shortName})
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400">₹{t.remainingPurse.toFixed(2)} Cr</td>
                    <td className="py-3 px-4 text-slate-300">₹{spent.toFixed(2)} Cr</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.roster.length === 15 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                        {t.roster.length} / 15
                      </span>
                    </td>
                    <td className="py-3 px-4 text-amber-300">{t.marqueePicksCount} / 2</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => onNavigateToStage()}
                        className="text-xs text-amber-400 hover:underline flex items-center gap-1 ml-auto"
                      >
                        Auction <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pick Next Player for Auction Stage */}
      <div className="stadium-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-amber-400" /> Send Player to Auction Stage
            </h3>
            <p className="text-xs text-slate-400">Pick any available player or recall an unsold player to the stage</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search player name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Roles</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-rounder">All-rounder</option>
              <option value="Wicketkeeper-Batsman">Wicketkeeper-Batsman</option>
            </select>
          </div>
        </div>

        {/* Player Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
          {filteredPlayers.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3 flex items-center justify-between gap-2 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={p.photoUrl}
                  alt={p.name}
                  className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=0F172A&color=F59E0B`;
                  }}
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                  <span className="text-[10px] text-amber-400 block">{p.role}</span>
                  <span className="text-[10px] text-slate-400 font-mono">₹{p.basePrice} Cr</span>
                </div>
              </div>

              <button
                onClick={() => handleSendToStage(p.id)}
                className="px-3 py-1.5 bg-amber-500 text-black hover:bg-amber-400 font-extrabold text-[11px] rounded-lg shadow uppercase shrink-0 transition-colors"
              >
                Stage
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
