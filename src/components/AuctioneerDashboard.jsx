import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Gavel, DollarSign, RefreshCw, Download, ArrowUpRight, Search, AlertOctagon, Shield, Star, Undo2, CheckCircle2, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { CATEGORY_ROUNDS, getTeamLogo } from '../data/teams';

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
    roundQueue,
    markPlayerSoldDirect,
    undoLastSale,
    undoTransaction,
  } = useAuction();

  // Admin Quick Sale Form States
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerSearchText, setPlayerSearchText] = useState('');
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);
  const [buyingTeamId, setBuyingTeamId] = useState(teams[0]?.id || 'CSK');
  const [soldPriceInput, setSoldPriceInput] = useState('');
  const [marqueeSlotOption, setMarqueeSlotOption] = useState(null); // null, 1, or 2
  const [formFeedback, setFormFeedback] = useState(null); // { type: 'error' | 'success' | 'warning', message: string }
  const [isWarningOverridePending, setIsWarningOverridePending] = useState(false);

  // Filters for bottom stage sender list
  const [stageSearchQuery, setStageSearchQuery] = useState('');
  const [stageRoleFilter, setStageRoleFilter] = useState('All');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const selectedPlayerObj = players.find((p) => p.id === selectedPlayerId);
  const selectedBuyingTeam = teams.find((t) => t.id === buyingTeamId);

  // Search filter across ALL 193 players for the Quick Sale Form
  const matchingPlayers = players.filter((p) => {
    if (!playerSearchText.trim()) return true;
    const term = playerSearchText.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.originalTeam.toLowerCase().includes(term) ||
      p.role.toLowerCase().includes(term)
    );
  });

  const handleSelectPlayer = (p) => {
    setSelectedPlayerId(p.id);
    setPlayerSearchText(`${p.name} (${p.originalTeam} • ${p.role})`);
    setShowPlayerDropdown(false);
    setSoldPriceInput(p.basePrice.toString());
    setFormFeedback(null);
    setIsWarningOverridePending(false);
  };

  const handleQuickPriceIncrement = (inc) => {
    const current = parseFloat(soldPriceInput) || selectedPlayerObj?.basePrice || 0;
    const updated = (current + inc).toFixed(2);
    setSoldPriceInput(updated);
    setFormFeedback(null);
  };

  const handleConfirmDirectSale = (e) => {
    e.preventDefault();
    setFormFeedback(null);

    if (!selectedPlayerId) {
      setFormFeedback({ type: 'error', message: 'Please search and select a player to sell.' });
      return;
    }

    if (!buyingTeamId) {
      setFormFeedback({ type: 'error', message: 'Please select a buying team.' });
      return;
    }

    const priceVal = parseFloat(soldPriceInput);
    if (isNaN(priceVal) || priceVal <= 0) {
      setFormFeedback({ type: 'error', message: 'Please enter a valid final sold price.' });
      return;
    }

    const result = markPlayerSoldDirect(
      selectedPlayerId,
      buyingTeamId,
      priceVal,
      marqueeSlotOption,
      isWarningOverridePending
    );

    if (!result.success) {
      if (result.isWarning) {
        setFormFeedback({ type: 'warning', message: result.message });
        setIsWarningOverridePending(true);
      } else {
        setFormFeedback({ type: 'error', message: result.message });
        setIsWarningOverridePending(false);
      }
    } else {
      setFormFeedback({ type: 'success', message: result.message });
      setSelectedPlayerId('');
      setPlayerSearchText('');
      setSoldPriceInput('');
      setMarqueeSlotOption(null);
      setIsWarningOverridePending(false);
      setTimeout(() => setFormFeedback(null), 5000);
    }
  };

  const handleUndoLast = () => {
    const res = undoLastSale();
    if (res.success) {
      setFormFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFormFeedback(null), 4000);
    } else {
      setFormFeedback({ type: 'error', message: res.message });
    }
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

  // Filter for stage sender list below
  const pendingPlayers = players.filter((p) => p.status !== 'Sold');
  const filteredStagePlayers = pendingPlayers.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(stageSearchQuery.toLowerCase()) || p.originalTeam.toLowerCase().includes(stageSearchQuery.toLowerCase());
    const matchesRole = stageRoleFilter === 'All' || p.role === stageRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      
      {/* Top Header Ledger Bar */}
      <div className="stadium-card-gold rounded-3xl p-6 border shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Gavel className="w-7 h-7 -rotate-12" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                LIVE ADMIN CONSOLE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                ₹{bankAccountTotal.toFixed(2)} <span className="text-lg text-amber-400 font-sans">Cr Ledger Revenue</span>
              </h2>
              <p className="text-xs text-slate-400">
                Category: <strong>{currentRoundName}</strong> ({roundQueue.length} Queue) • Total Sales: <strong>{transactions.length}</strong>
              </p>
            </div>
          </div>

          {/* Action Bar: Undo Last Sale, Export, Reset */}
          <div className="flex items-center gap-2 flex-wrap">
            {transactions.length > 0 && (
              <button
                onClick={handleUndoLast}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold text-xs flex items-center gap-2 transition-all shadow"
                title="Undo the most recent sale and refund purse"
              >
                <Undo2 className="w-4 h-4 text-amber-400" /> Undo Last Sale
              </button>
            )}

            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-amber-400" /> Export JSON
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Reset
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

      {/* FRONT AND CENTER: SIMPLIFIED "MARK PLAYER SOLD" ADMIN FORM */}
      <div className="stadium-card-gold rounded-3xl p-6 sm:p-8 border-2 border-amber-500/50 shadow-2xl space-y-6 bg-gradient-to-b from-[#181308] via-[#101422] to-[#0A0E1A]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-wide">
                Mark Player Sold — Live Auction Admin Entry
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select any player from all 193 candidates, assign the buying team, enter final price, and click Confirm Sale.
            </p>
          </div>

          {transactions.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-right text-xs shrink-0">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">LAST SALE</span>
              <span className="font-bold text-white">{transactions[0].playerName}</span> → <span className="text-amber-400 font-mono">₹{transactions[0].soldPrice.toFixed(2)} Cr</span> ({transactions[0].teamShort})
            </div>
          )}
        </div>

        {/* Feedback Alert Message */}
        {formFeedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold animate-badge-pop ${
              formFeedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                : formFeedback.type === 'warning'
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-rose-500/10 border-rose-500/50 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {formFeedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <span>{formFeedback.message}</span>
            </div>

            {isWarningOverridePending && (
              <span className="text-[10px] uppercase font-black px-2 py-1 bg-amber-500 text-black rounded shrink-0">
                Click Confirm Again to Override
              </span>
            )}
          </div>
        )}

        {/* 4-Step Quick Form */}
        <form onSubmit={handleConfirmDirectSale} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            
            {/* Step 1: Searchable Player Select (Col 5) */}
            <div className="md:col-span-5 space-y-2 relative">
              <label className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[11px] font-black">1</span>
                Select Player (Search 193 Pool):
              </label>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type player name, franchise, or role..."
                  value={playerSearchText}
                  onFocus={() => setShowPlayerDropdown(true)}
                  onChange={(e) => {
                    setPlayerSearchText(e.target.value);
                    setShowPlayerDropdown(true);
                    setSelectedPlayerId('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl pl-9 pr-8 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                {selectedPlayerId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlayerId('');
                      setPlayerSearchText('');
                      setShowPlayerDropdown(true);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Autocomplete Search Dropdown list */}
              {showPlayerDropdown && matchingPlayers.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-40 divide-y divide-slate-800">
                  {matchingPlayers.slice(0, 20).map((p) => {
                    const isSold = p.status === 'Sold';
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPlayer(p)}
                        className={`p-3 hover:bg-slate-800 cursor-pointer flex items-center justify-between gap-2 transition-colors ${
                          isSold ? 'opacity-50 bg-slate-950/40' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={getTeamLogo(p.originalTeam)} alt={p.originalTeam} className="w-4 h-4 object-contain shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-white block truncate">{p.name}</span>
                            <span className="text-[10px] text-slate-400 block">{p.role} • Base: ₹{p.basePrice} Cr</span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                          isSold ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {isSold ? `Sold to ${p.soldTo}` : 'Available'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selected Player Specs Preview Pill */}
              {selectedPlayerObj && (
                <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-amber-300 text-sm block">{selectedPlayerObj.name}</span>
                    <span className="text-[10px] text-slate-300">{selectedPlayerObj.role} • {selectedPlayerObj.battingStyle} • {selectedPlayerObj.bowlingStyle}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Base Price</span>
                    <span className="font-mono font-bold text-amber-400 text-xs">₹{selectedPlayerObj.basePrice} Cr</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Select Buying Team (Col 4) */}
            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[11px] font-black">2</span>
                Buying College Team:
              </label>

              <select
                value={buyingTeamId}
                onChange={(e) => setBuyingTeamId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-3 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortName}) — Purse: ₹{t.remainingPurse.toFixed(2)}Cr ({t.roster.length}/15)
                  </option>
                ))}
              </select>

              {selectedBuyingTeam && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={selectedBuyingTeam.logo} alt={selectedBuyingTeam.shortName} className="w-4 h-4 object-contain" />
                    <span className="font-bold text-white">{selectedBuyingTeam.name}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-xs">₹{selectedBuyingTeam.remainingPurse.toFixed(2)} Cr</span>
                </div>
              )}
            </div>

            {/* Step 3: Sold Price Input & Presets (Col 3) */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center text-[11px] font-black">3</span>
                Final Sold Price (₹ Cr):
              </label>

              <input
                type="number"
                step="0.05"
                placeholder="e.g. 14.5"
                value={soldPriceInput}
                onChange={(e) => {
                  setSoldPriceInput(e.target.value);
                  setFormFeedback(null);
                }}
                className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-3 text-sm font-mono font-bold text-amber-300 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />

              {/* Quick Increments */}
              <div className="grid grid-cols-3 gap-1 pt-1">
                {[0.25, 0.5, 1.0, 2.0, 5.0, 10.0].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => handleQuickPriceIncrement(inc)}
                    className="py-1 px-1.5 bg-slate-800 hover:bg-amber-500/20 text-amber-400 border border-slate-700 rounded-lg font-mono text-[10px] font-bold text-center"
                  >
                    +₹{inc}Cr
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Optional Marquee Slot Choice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-slate-300">Marquee Slot Rule (Optional):</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMarqueeSlotOption(null)}
                className={`py-1.5 px-3 rounded-lg border transition-all ${
                  marqueeSlotOption === null
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                None (Open Bid)
              </button>
              <button
                type="button"
                onClick={() => setMarqueeSlotOption(1)}
                className={`py-1.5 px-3 rounded-lg border transition-all ${
                  marqueeSlotOption === 1
                    ? 'bg-amber-500 text-black border-amber-400 font-extrabold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Slot 1 (Max 18Cr)
              </button>
              <button
                type="button"
                onClick={() => setMarqueeSlotOption(2)}
                className={`py-1.5 px-3 rounded-lg border transition-all ${
                  marqueeSlotOption === 2
                    ? 'bg-amber-500 text-black border-amber-400 font-extrabold'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                Slot 2 (Max 13Cr)
              </button>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider shadow-2xl flex items-center justify-center gap-2 transition-all ${
                isWarningOverridePending
                  ? 'bg-amber-500 text-black hover:bg-amber-400 animate-pulse'
                  : 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black hover:scale-[1.01] shadow-amber-500/30'
              }`}
            >
              <Gavel className="w-6 h-6 -rotate-12" />
              <span>{isWarningOverridePending ? 'CONFIRM SALE (OVERRIDE WARNING)' : 'CONFIRM SALE (MARK SOLD)'}</span>
            </button>
          </div>
        </form>
      </div>

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
                        Auction Stage <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stage Player Sender Grid */}
      <div className="stadium-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-amber-400" /> Send Player to Live Stage
            </h3>
            <p className="text-xs text-slate-400">Pick any available player to present live on the stage screen</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search player name..."
                value={stageSearchQuery}
                onChange={(e) => setStageSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <select
              value={stageRoleFilter}
              onChange={(e) => setStageRoleFilter(e.target.value)}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
          {filteredStagePlayers.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3 flex items-center justify-between gap-2 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 p-1">
                  <img src={getTeamLogo(p.originalTeam)} alt={p.originalTeam} className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate" title={p.name}>{p.name}</h4>
                  <span className="text-[10px] text-amber-400 block font-medium">{p.role} • {p.originalTeam}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Base: ₹{p.basePrice} Cr</span>
                </div>
              </div>

              <button
                onClick={() => {
                  recallPlayerToStage(p.id);
                  onNavigateToStage();
                }}
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
