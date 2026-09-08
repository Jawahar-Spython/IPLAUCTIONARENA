import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { Gavel, AlertCircle, Sparkles, Trophy, CheckCircle, ArrowRight, Shuffle, Star, Layers } from 'lucide-react';
import { CATEGORY_ROUNDS, getTeamLogo } from '../data/teams';
import { PlayerPresentationSlide } from './PlayerPresentationSlide';

export const LiveAuctionStage = ({ onSelectTeam }) => {
  const {
    stagePlayer,
    currentBid,
    teams,
    placeBid,
    sellCurrentPlayer,
    markCurrentUnsold,
    currentRoundIndex,
    currentRoundName,
    roundQueue,
    changeCategoryRound,
    shuffleCurrentRoundQueue,
    transactions,
  } = useAuction();

  const [selectedBidder, setSelectedBidder] = useState(teams[0].id);
  const [selectedMarqueeSlot, setSelectedMarqueeSlot] = useState(null); // null, 1, or 2
  const [customBid, setCustomBid] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!stagePlayer) {
    return (
      <div className="p-12 text-center stadium-card rounded-3xl border border-slate-800 space-y-4 max-w-2xl mx-auto my-12">
        <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
        <h2 className="text-3xl font-black text-white uppercase font-display">Category Round Completed!</h2>
        <p className="text-slate-400 text-sm">All players in <strong>{currentRoundName}</strong> have been auctioned or marked unsold.</p>
        <div className="flex justify-center gap-3 pt-2">
          {currentRoundIndex < CATEGORY_ROUNDS.length - 1 && (
            <button
              onClick={() => changeCategoryRound(currentRoundIndex + 1)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl uppercase text-xs tracking-wider shadow"
            >
              Advance to {CATEGORY_ROUNDS[currentRoundIndex + 1]}
            </button>
          )}
        </div>
      </div>
    );
  }

  const leadingTeam = teams.find((t) => t.id === currentBid.teamId);

  const handleIncrementBid = (delta) => {
    setValidationError('');
    setSuccessMessage('');
    const newAmount = Number((currentBid.amount + delta).toFixed(2));
    const result = placeBid(selectedBidder, newAmount, selectedMarqueeSlot);
    if (!result.valid) {
      setValidationError(result.reason);
    }
  };

  const handleCustomBidSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');
    const val = parseFloat(customBid);
    if (isNaN(val) || val <= currentBid.amount) {
      setValidationError(`Custom bid must be greater than current bid ₹${currentBid.amount} Cr`);
      return;
    }
    const result = placeBid(selectedBidder, val, selectedMarqueeSlot);
    if (!result.valid) {
      setValidationError(result.reason);
    } else {
      setCustomBid('');
    }
  };

  const handleSell = () => {
    setValidationError('');
    if (!currentBid.teamId) {
      setValidationError('Please select a bidding team before clicking SOLD!');
      return;
    }
    const res = sellCurrentPlayer(selectedMarqueeSlot);
    if (res.success) {
      setSuccessMessage(`🔨 SOLD! ${stagePlayer.name} to ${res.teamName} for ₹${res.price} Cr!`);
      setSelectedMarqueeSlot(null);
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setValidationError(res.message);
    }
  };

  const handleUnsold = () => {
    setValidationError('');
    setSelectedMarqueeSlot(null);
    markCurrentUnsold();
  };

  return (
    <div className="space-y-6">
      
      {/* Category Round Banner Bar */}
      <div className="stadium-card rounded-2xl p-4 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500 text-black font-black">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                ACTIVE AUCTION ROUND
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {roundQueue.length} Players Remaining in Queue
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-wide">
              {currentRoundName}
            </h2>
          </div>
        </div>

        {/* Round Switcher & Shuffle Control */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={shuffleCurrentRoundQueue}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors"
            title="Randomize display order of players in this round"
          >
            <Shuffle className="w-3.5 h-3.5" /> Shuffle Round Queue
          </button>

          <select
            value={currentRoundIndex}
            onChange={(e) => changeCategoryRound(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {CATEGORY_ROUNDS.map((rName, idx) => (
              <option key={idx} value={idx}>{rName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation / Success Messages */}
      {validationError && (
        <div className="bg-rose-500/10 border border-rose-500/50 rounded-xl p-4 flex items-center gap-3 text-rose-300 animate-badge-pop">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-sm font-semibold">{validationError}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-xl p-4 flex items-center gap-3 text-emerald-300 animate-badge-pop">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-bold">{successMessage}</p>
        </div>
      )}

      {/* Main Live Stage Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Columns: Active Stage Player Slide & Controls */}
        <div className="lg:col-span-7 space-y-6">
          <PlayerPresentationSlide 
            player={stagePlayer}
            teams={teams}
            currentBid={currentBid}
          />

          {/* Stage Action Buttons: SOLD / UNSOLD */}
          <div className="stadium-card rounded-2xl p-4 border border-slate-800 flex flex-wrap sm:flex-nowrap gap-3">
            <button
              onClick={handleSell}
              disabled={!currentBid.teamId}
              className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-base uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 transition-all ${
                currentBid.teamId
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black hover:scale-[1.02] shadow-amber-500/25 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Gavel className="w-5 h-5 -rotate-12" />
              <span>SOLD (HAMMER DOWN)</span>
            </button>

            <button
              onClick={handleUnsold}
              className="px-6 py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-extrabold text-sm uppercase tracking-wider transition-all"
            >
              UNSOLD
            </button>
          </div>

          {/* Rapid Bidding Control Panel */}
          <div className="stadium-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase text-amber-400 tracking-wider flex items-center gap-2">
              <Gavel className="w-4 h-4" /> Bidding Console
            </h3>

            {/* Select Bidding College Team */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Bidding Team:</label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {teams.map((t) => {
                  const isSelected = selectedBidder === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedBidder(t.id);
                        setValidationError('');
                      }}
                      className={`p-2 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 border ${
                        isSelected
                          ? 'ring-2 ring-amber-400 bg-amber-500 text-black border-amber-400 shadow-md font-black scale-105'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <img src={t.logo} alt={t.shortName} className="w-5 h-5 object-contain" />
                      <span>{t.shortName}</span>
                      <span className="text-[9px] font-mono opacity-80">₹{t.remainingPurse.toFixed(0)}Cr</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Marquee Slot Selection Toggle */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> Optional Marquee Slot Assignment (Team's Choice):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSelectedMarqueeSlot(null)}
                  className={`py-2 px-3 rounded-xl border transition-all ${
                    selectedMarqueeSlot === null
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Normal Open Bid (No Cap)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMarqueeSlot(1)}
                  className={`py-2 px-3 rounded-xl border transition-all ${
                    selectedMarqueeSlot === 1
                      ? 'bg-amber-500 text-black border-amber-400 font-extrabold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Marquee Slot 1 (Cap ₹18Cr)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMarqueeSlot(2)}
                  className={`py-2 px-3 rounded-xl border transition-all ${
                    selectedMarqueeSlot === 2
                      ? 'bg-amber-500 text-black border-amber-400 font-extrabold'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Marquee Slot 2 (Cap ₹13Cr)
                </button>
              </div>
            </div>

            {/* Rapid Bid Increments */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-300">Raise Bid For Selected Team:</span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[0.25, 0.5, 1.0, 2.0, 5.0].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => handleIncrementBid(inc)}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400 rounded-xl font-bold text-xs font-mono transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
                  >
                    +₹{inc} Cr
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Bid Input Form */}
            <form onSubmit={handleCustomBidSubmit} className="flex gap-2 pt-2">
              <input
                type="number"
                step="0.05"
                placeholder="Enter exact bid (e.g. 14.5)"
                value={customBid}
                onChange={(e) => setCustomBid(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-black rounded-xl font-bold text-xs hover:bg-amber-400 transition-colors"
              >
                Place Custom Bid
              </button>
            </form>
          </div>

        </div>

        {/* Right 5 Columns: Live Leaderboard */}
        <div className="lg:col-span-5 space-y-4">
          <div className="stadium-card rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Team Purse Leaderboard
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">10 Teams</span>
            </div>

            <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              {teams.map((t) => {
                const isSelected = selectedBidder === t.id;
                const isLeading = currentBid.teamId === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedBidder(t.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isLeading
                        ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : isSelected
                        ? 'bg-slate-800/90 border-slate-600'
                        : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img src={t.logo} alt={t.shortName} className="w-5 h-5 object-contain" />
                        <span className="font-bold text-xs text-white">{t.name}</span>
                        {isLeading && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500 text-black uppercase">
                            HIGHEST BIDDER
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTeam(t.id);
                        }}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                      >
                        Squad <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-500"
                        style={{ width: `${(t.remainingPurse / t.initialPurse) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <div>
                        Purse: <span className="font-bold text-amber-400">₹{t.remainingPurse.toFixed(2)} Cr</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <span>Squad: <strong className="text-white">{t.roster.length}/15</strong></span>
                        <span>Marquee: <strong className="text-amber-300">{t.marqueePicksCount}/2</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Sales Ticker */}
          <div className="stadium-card rounded-2xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Recent Sales Log
            </h4>
            <div className="space-y-2">
              {transactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">{tx.playerName}</span>
                    <span className="text-[10px] text-slate-400 block">{tx.playerRole} • {tx.teamShort}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400">₹{tx.soldPrice.toFixed(2)} Cr</span>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-2">No sales completed yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
