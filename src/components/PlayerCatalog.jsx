import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Search, Users } from 'lucide-react';
import { IPL_TEAMS, getTeamLogo } from '../data/teams';
import { PlayerPresentationSlide } from './PlayerPresentationSlide';

export const PlayerCatalog = ({ onSendToStage }) => {
  const { players, teams } = useAuction();
  const [selectedPlayerModal, setSelectedPlayerModal] = useState(null);

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
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search player name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-800/80">
          <div>
            <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Franchise</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Franchises</option>
              {IPL_TEAMS.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Roles</option>
              <option value="Batsman">Batsmen</option>
              <option value="Bowler">Bowlers</option>
              <option value="All-rounder">All-rounders</option>
              <option value="Wicketkeeper-Batsman">Wicketkeepers</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available for Stage</option>
              <option value="Sold">Sold</option>
              <option value="Unsold">Unsold</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Batting Style</label>
            <select
              value={battingFilter}
              onChange={(e) => setBattingFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Batting Styles</option>
              <option value="RHB">Right Hand (RHB)</option>
              <option value="LHB">Left Hand (LHB)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Display of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              {/* Header: Photo + Name + Role */}
              <div className="flex items-start gap-3 cursor-pointer" onClick={() => setSelectedPlayerModal(p)}>
                <img
                  src={p.photoUrl || "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=500&auto=format&fit=crop&q=80"}
                  alt={p.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase">
                    <span>{p.role}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm truncate hover:text-amber-400 transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                    <img src={getTeamLogo(p.originalTeam)} alt={p.originalTeam} className="w-3.5 h-3.5 object-contain" />
                    <span>{p.originalTeam}</span>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="bg-slate-950/60 p-2 rounded-lg text-[11px] space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Batting:</span>
                  <span className="font-semibold text-slate-200">{p.battingStyle || 'RHB'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bowling:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[130px]">{p.bowlingStyle || 'N/A'}</span>
                </div>
              </div>

              {/* Footer / Status */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
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

      {/* Presentation Slide Modal */}
      {selectedPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <PlayerPresentationSlide 
            player={selectedPlayerModal}
            teams={teams}
            isModal={true}
            onClose={() => setSelectedPlayerModal(null)}
          />
        </div>
      )}

    </div>
  );
};
