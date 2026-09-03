import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Search, Users } from 'lucide-react';
import { IPL_TEAMS } from '../data/teams';

export const PlayerCatalog = ({ onSendToStage }) => {
  const { players, teams } = useAuction();

  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [battingFilter, setBattingFilter] = useState('All');

  const filteredPlayers = players.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = teamFilter === 'All' || p.originalTeam === teamFilter;
    const matchesRole = roleFilter === 'All' || p.role === roleFilter;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Sold' && p.status === 'Sold') ||
      (statusFilter === 'Unsold' && p.status === 'Unsold') ||
      (statusFilter === 'Available' && p.status !== 'Sold');
    const matchesBatting = battingFilter === 'All' || p.battingStyle === battingFilter;

    return matchesSearch && matchesTeam && matchesRole && matchesStatus && matchesBatting;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls Bar */}
      <div className="stadium-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" /> Full Player Database ({players.length} Players)
            </h2>
            <p className="text-xs text-slate-400">Search and filter every player across all 10 IPL franchises</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search player name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Filter Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Franchise Team</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="All">All 10 Franchises</option>
              {IPL_TEAMS.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Player Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Roles</option>
              <option value="Batsman">Batsman</option>
              <option value="Bowler">Bowler</option>
              <option value="All-rounder">All-rounder</option>
              <option value="Wicketkeeper-Batsman">Wicketkeeper-Batsman</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Batting Style</label>
            <select
              value={battingFilter}
              onChange={(e) => setBattingFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Styles</option>
              <option value="RHB">Right Hand Bat (RHB)</option>
              <option value="LHB">Left Hand Bat (LHB)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Auction Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available (Unsold/Pool)</option>
              <option value="Sold">Sold Players</option>
              <option value="Unsold">Unsold Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPlayers.map((p) => {
          const isSold = p.status === 'Sold';
          const buyingTeam = isSold ? teams.find((t) => t.id === p.soldTo) : null;

          return (
            <div
              key={p.id}
              className={`stadium-card rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                isSold ? 'border-slate-800 opacity-90' : 'border-amber-500/20 hover:border-amber-400 shadow-lg'
              }`}
            >
              <div className="flex gap-3">
                <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                  <img
                    src={p.photoUrl}
                    alt={p.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=0F172A&color=F59E0B`;
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <img src={`/logos/${p.originalTeam.toLowerCase()}.svg`} alt={p.originalTeam} className="w-3.5 h-3.5 object-contain" />
                      <span className="text-[10px] font-black uppercase text-amber-400">{p.originalTeam}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{p.nationality}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white truncate">{p.name}</h3>
                  <span className="text-xs font-semibold text-slate-300 block">{p.role}</span>
                </div>
              </div>

              {/* Exact Specs */}
              <div className="bg-slate-900/90 rounded-xl p-2 text-[11px] grid grid-cols-2 gap-1 text-slate-300 border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Batting</span>
                  <span className="font-semibold">{p.battingStyle}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Bowling</span>
                  <span className="font-semibold truncate block" title={p.bowlingStyle}>{p.bowlingStyle}</span>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {isSold ? (
                  <div className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {buyingTeam && <img src={buyingTeam.logo} alt={buyingTeam.shortName} className="w-3.5 h-3.5 object-contain" />}
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">
                        SOLD TO {buyingTeam?.shortName || p.soldTo}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-emerald-300">₹{p.soldPrice?.toFixed(2)} Cr</span>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-slate-400">BASE PRICE</span>
                      <span className="font-mono font-bold text-amber-400">₹{p.basePrice} Cr</span>
                    </div>

                    <button
                      onClick={() => onSendToStage(p.id)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-lg text-[11px] uppercase tracking-wide transition-colors shadow"
                    >
                      Stage
                    </button>
                  </>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
