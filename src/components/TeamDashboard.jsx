import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { REQUIRED_SQUAD_COMPOSITION, TOTAL_SQUAD_SIZE, getTeamLogo } from '../data/teams';
import { Shield, CheckCircle, User, DollarSign, Star } from 'lucide-react';

export const TeamDashboard = ({ selectedTeamId, setSelectedTeamId }) => {
  const { teams, players, getTeamRoleCounts } = useAuction();
  const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const roleCounts = getTeamRoleCounts(currentTeam.id);

  // Map purchased roster player objects
  const rosterPlayers = currentTeam.roster
    .map((pId) => players.find((p) => p.id === pId))
    .filter(Boolean);

  const marquee1Player = currentTeam.marqueeSlot1 ? players.find((p) => p.id === currentTeam.marqueeSlot1.playerId) : null;
  const marquee2Player = currentTeam.marqueeSlot2 ? players.find((p) => p.id === currentTeam.marqueeSlot2.playerId) : null;

  // Generate 15 squad slots (filled or empty placeholders)
  const squadSlots = Array.from({ length: TOTAL_SQUAD_SIZE }).map((_, index) => {
    if (rosterPlayers[index]) {
      return { type: 'filled', player: rosterPlayers[index] };
    }
    // Determine suggested role for empty slot
    let suggestedRole = "Batsman";
    if (roleCounts["Batsman"] < REQUIRED_SQUAD_COMPOSITION["Batsman"]) suggestedRole = "Batsman";
    else if (roleCounts["Bowler"] < REQUIRED_SQUAD_COMPOSITION["Bowler"]) suggestedRole = "Bowler";
    else if (roleCounts["All-rounder"] < REQUIRED_SQUAD_COMPOSITION["All-rounder"]) suggestedRole = "All-rounder";
    else if (roleCounts["Wicketkeeper-Batsman"] < REQUIRED_SQUAD_COMPOSITION["Wicketkeeper-Batsman"]) suggestedRole = "Wicketkeeper-Batsman";

    return { type: 'empty', slotIndex: index + 1, suggestedRole };
  });

  return (
    <div className="space-y-6">
      {/* Franchise Selector Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {teams.map((t) => {
          const isActive = t.id === currentTeam.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <img src={t.logo} alt={t.shortName} className="w-5 h-5 object-contain" />
              <span>{t.name} ({t.shortName})</span>
            </button>
          );
        })}
      </div>

      {/* Main Team Banner Card with Local Logo */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden bg-gradient-to-r ${currentTeam.gradient} ${currentTeam.border}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950/80 p-2.5 border border-white/20 shadow-xl shrink-0 flex items-center justify-center">
              <img src={currentTeam.logo} alt={currentTeam.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl sm:text-4xl font-black text-white font-display tracking-wide">
                  {currentTeam.name}
                </h2>
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-900/80 text-amber-400 border border-slate-700">
                  {currentTeam.jerseyColor}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Official College Franchise Dashboard • {rosterPlayers.length} / 15 Players Secured
              </p>
            </div>
          </div>

          {/* Remaining Purse Display Card */}
          <div className="bg-slate-950/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 shrink-0">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">REMAINING PURSE</span>
              <div className="text-3xl font-black text-amber-400 font-mono">
                ₹{currentTeam.remainingPurse.toFixed(2)} <span className="text-lg">Cr</span>
              </div>
              <span className="text-[10px] text-slate-500">Initial Purse: ₹120.00 Cr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Grid: Optional Marquee Slots & Squad Composition Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Marquee Rule Tracker (Slot 1 & Slot 2) */}
        <div className="md:col-span-5 stadium-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Marquee Slots (Optional)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">{currentTeam.marqueePicksCount}/2 Used</span>
          </div>

          <div className="space-y-3">
            {/* Slot 1 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">MARQUEE SLOT 1 (CAP: ₹18 CR)</span>
                {marquee1Player ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-white">{marquee1Player.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono">(₹{currentTeam.marqueeSlot1.price} Cr)</span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 italic mt-0.5 block">Unused (Optional)</span>
                )}
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${marquee1Player ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}>
                {marquee1Player ? 'USED' : 'UNUSED'}
              </span>
            </div>

            {/* Slot 2 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">MARQUEE SLOT 2 (CAP: ₹13 CR)</span>
                {marquee2Player ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-white">{marquee2Player.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono">(₹{currentTeam.marqueeSlot2.price} Cr)</span>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 italic mt-0.5 block">Unused (Optional)</span>
                )}
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${marquee2Player ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'}`}>
                {marquee2Player ? 'USED' : 'UNUSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Squad Composition Checklist */}
        <div className="md:col-span-7 stadium-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Squad Balance Checklist (15 Players)
            </h3>
            <span className="text-[10px] text-slate-400">Min Required Split</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(REQUIRED_SQUAD_COMPOSITION).map(([role, requiredMin]) => {
              const count = roleCounts[role] || 0;
              const isMet = count >= requiredMin;

              return (
                <div
                  key={role}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isMet
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 block truncate">{role}</span>
                  <div className="text-2xl font-black font-mono my-1">
                    {count} <span className="text-xs font-normal text-slate-500">/ {requiredMin}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${isMet ? 'bg-emerald-500 text-black' : 'bg-amber-500/20 text-amber-400'}`}>
                    {isMet ? 'MET ✓' : `NEEDS ${requiredMin - count}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 15-Slot Squad Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" /> 15-Member Squad Roster Grid
          </h3>
          <span className="text-xs font-mono text-slate-400">
            Filled: {rosterPlayers.length} / 15
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {squadSlots.map((slot, idx) => {
            if (slot.type === 'filled') {
              const p = slot.player;
              return (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-amber-500/30 rounded-2xl p-3.5 space-y-2.5 relative group hover:border-amber-400 transition-all shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 truncate">
                        {p.role}
                      </span>
                      <div className="flex items-center gap-1 shrink-0" title={`Previous Franchise: ${p.originalTeam}`}>
                        <img src={getTeamLogo(p.originalTeam)} alt={p.originalTeam} className="w-3.5 h-3.5 object-contain" />
                        <span className="text-[9px] font-bold text-slate-400 font-mono">{p.originalTeam}</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate pt-0.5" title={p.name}>{p.name}</h4>
                    
                    <div className="text-[10px] text-slate-400 space-y-0.5 font-mono">
                      <div>Bat: <span className="text-slate-200 font-semibold">{p.battingStyle}</span></div>
                      <div className="truncate" title={p.bowlingStyle}>Bowl: <span className="text-slate-200 font-semibold">{p.bowlingStyle}</span></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Sold:</span>
                    <span className="font-bold text-amber-400">₹{p.soldPrice?.toFixed(2)} Cr</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="border-2 border-dashed border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 bg-slate-950/40 hover:border-slate-700 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">SLOT #{slot.slotIndex}</span>
                  <span className="text-xs font-semibold text-slate-400">Needed: {slot.suggestedRole}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
