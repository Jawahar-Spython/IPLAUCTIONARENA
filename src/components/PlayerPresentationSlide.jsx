import React from 'react';
import { Star, Flame, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { getTeamLogo } from '../data/teams';

export function PlayerPresentationSlide({ player, teams, currentBid, isModal = false, onClose }) {
  if (!player) return null;

  const buyingTeam = (player.soldTo && Array.isArray(teams)) ? teams.find(t => t.id === player.soldTo || t.shortName === player.soldTo || t.name === player.soldTo) : null;
  
  const biddingTeamId = currentBid?.teamId || player.currentBidder;
  const biddingTeam = (biddingTeamId && Array.isArray(teams)) ? teams.find(t => t.id === biddingTeamId || t.shortName === biddingTeamId || t.name === biddingTeamId) : null;

  const activeBidAmount = typeof currentBid?.amount === 'number' ? currentBid.amount : (player.currentBid || player.basePrice || 0);

  const bowlingDisplay = (!player.bowlingStyle || player.bowlingStyle === 'N/A' || player.bowlingStyle === 'None') 
    ? 'Does not bowl' 
    : player.bowlingStyle;

  return (
    <div className={`relative overflow-hidden rounded-3xl border-2 border-amber-500/50 bg-gradient-to-b from-[#0F172A] via-[#131B2E] to-[#0A0E1A] p-6 sm:p-10 md:p-12 text-center shadow-2xl shadow-amber-500/10 transition-all ${isModal ? 'max-w-4xl w-full mx-auto' : 'w-full mb-8'}`}>
      
      {/* Spotlight Radial Background Animation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full filter blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

      {/* Stage Overhead Light Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_#facc15]"></div>

      {/* Close Button if Modal */}
      {isModal && onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors z-20"
        >
          ✕
        </button>
      )}

      {/* Top Banner Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6 relative z-10">
        
        {/* Category Badge */}
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs sm:text-sm font-extrabold uppercase tracking-widest shadow-md">
          {(player.isMarquee || player.categoryRound === 'Star Players') && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
          <span>{(player.isMarquee || player.categoryRound === 'Star Players') ? 'STAR MARQUEE PLAYER' : (player.role || 'PLAYER')}</span>
        </span>

        {/* Previous IPL Team Badge */}
        {player.originalTeam && (
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold shadow-md">
            <img 
              src={getTeamLogo(player.originalTeam)} 
              alt={player.originalTeam} 
              className="w-5 h-5 object-contain"
            />
            <span>Prev IPL: <strong className="text-amber-400">{player.originalTeam}</strong></span>
          </span>
        )}

      </div>

      {/* Centerpiece: Huge Headline Player Name */}
      <div className="relative z-10 mb-6 space-y-2">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-white uppercase drop-shadow-[0_0_35px_rgba(234,179,8,0.35)] leading-none">
          {player.name}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 font-medium">
          {player.role} • <span className="text-slate-200 font-semibold">{player.originalTeam ? `${player.originalTeam} Franchise` : 'IPL Pool'}</span>
        </p>
      </div>

      {/* Slide Specifications Grid (Readable on Projector Screen) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto my-8 relative z-10">
        
        {/* Batting Style */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">Batting Style</span>
          <span className="text-base sm:text-lg font-bold text-white font-sans">
            🏏 {player.battingStyle || 'RHB'}
          </span>
        </div>

        {/* Bowling Style */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">Bowling Style</span>
          <span className="text-sm sm:text-base font-bold text-slate-200 text-center leading-tight">
            ⚡ {bowlingDisplay}
          </span>
        </div>

        {/* Base Price */}
        <div className="col-span-2 sm:col-span-1 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center">
          <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">Base Price</span>
          <span className="text-base sm:text-xl font-display font-extrabold text-amber-400">
            ₹{player.basePrice ? player.basePrice.toFixed(2) : '0.00'} Cr
          </span>
        </div>

      </div>

      {/* Bottom Status Spotlight Banner (Projector Friendly) */}
      <div className="relative z-10 max-w-2xl mx-auto mt-6">
        
        {player.status === 'Sold' && (
          <div className="bg-gradient-to-r from-emerald-950/90 via-emerald-900/90 to-emerald-950/90 border-2 border-emerald-500/60 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-emerald-500/20 animate-badge-pop">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-xs mb-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>OFFICIALLY SOLD</span>
            </div>
            
            <div className="text-2xl sm:text-4xl font-display font-black text-white my-1">
              SOLD TO {buyingTeam ? buyingTeam.name : (player.soldTo || 'BUYER')}
            </div>

            <div className="text-xl sm:text-3xl font-display font-extrabold text-emerald-300">
              FINAL PRICE: ₹{(player.soldPrice || 0).toFixed(2)} Cr
            </div>
          </div>
        )}

        {(player.status === 'Current Bid' || player.status === 'Currently Up for Bid' || !player.status || player.status === 'Not Yet Auctioned') && (
          <div className="bg-gradient-to-r from-amber-950/90 via-stadium-card to-amber-950/90 border-2 border-amber-500/80 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-amber-500/20">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-bold uppercase tracking-widest text-xs mb-1">
              <Flame className="w-5 h-5 text-rose-500 animate-bounce" />
              <span>CURRENTLY UP FOR BID • LIVE ON STAGE</span>
            </div>

            <div className="text-3xl sm:text-5xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-tight my-1">
              HIGHEST BID: ₹{Number(activeBidAmount || 0).toFixed(2)} Cr
            </div>

            {biddingTeam ? (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-950 border border-amber-500/40 text-xs sm:text-sm font-bold text-slate-200 mt-2">
                <img src={biddingTeam.logo} alt={biddingTeam.name} className="w-5 h-5 object-contain" />
                <span>Leading Bidder: <strong className="text-amber-400">{biddingTeam.name}</strong></span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1">Opening at Base Price: ₹{(player.basePrice || 0).toFixed(2)} Cr</p>
            )}
          </div>
        )}

        {player.status === 'Unsold' && (
          <div className="bg-slate-950/90 border border-slate-700 rounded-2xl p-4 sm:p-5 text-slate-400">
            <div className="flex items-center justify-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              <span>STATUS: UNSOLD</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">This player passed without receiving a base price bid.</p>
          </div>
        )}

      </div>

    </div>
  );
}
