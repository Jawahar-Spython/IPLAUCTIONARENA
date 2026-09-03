import React from 'react';
import { BookOpen, Shield, Star, DollarSign, Users, Layers, Shuffle } from 'lucide-react';

export const RulesPage = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="stadium-card-gold rounded-3xl p-6 sm:p-8 border text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-black mx-auto flex items-center justify-center font-black mb-2 shadow-lg shadow-amber-500/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase font-display tracking-wider">
          IPL AUCTION ARENA - Official Rules & Engine Guide
        </h2>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto">
          The complete rulebook governing category round order, randomized multi-franchise player shuffling, optional marquee slots, and purse guardrails.
        </p>
      </div>

      {/* Rule Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Rule 1: Category Rounds Order */}
        <div className="stadium-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase">1. Category Rounds & Shuffled Pools</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The player pool is <strong>never auctioned team-by-team</strong>. Instead, bidding runs in 5 Category Rounds where players from all 10 teams are randomly shuffled together:
          </p>
          <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside font-mono pt-1">
            <li><strong>Round 1: Star Players</strong> (Top marquee names across franchises)</li>
            <li><strong>Round 2: Batsmen Category</strong> (Shuffled batsmen across teams)</li>
            <li><strong>Round 3: Bowlers Category</strong> (Shuffled bowlers across teams)</li>
            <li><strong>Round 4: All-rounders Category</strong> (Shuffled all-rounders)</li>
            <li><strong>Round 5: Unsold Return</strong> (Shuffled recall of unsold players)</li>
          </ol>
        </div>

        {/* Rule 2: Optional Marquee Slots */}
        <div className="stadium-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white uppercase">2. Marquee Slots (100% Optional)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Each team MAY choose to use up to 2 marquee picks at their own discretion — they are not required to use either slot.
          </p>
          <div className="space-y-1.5 pt-1 font-mono text-xs">
            <div className="bg-slate-900 border border-amber-500/30 rounded-lg p-2 flex justify-between">
              <span className="text-slate-300">Marquee Slot 1 Cap:</span>
              <strong className="text-amber-400">₹18.00 Crore Max</strong>
            </div>
            <div className="bg-slate-900 border border-amber-500/30 rounded-lg p-2 flex justify-between">
              <span className="text-slate-300">Marquee Slot 2 Cap:</span>
              <strong className="text-amber-400">₹13.00 Crore Max</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            *If a team skips marquee slots, all their picks proceed via normal open-purse bidding limited only by remaining budget.
          </p>
        </div>

        {/* Rule 3: Purse & Budget */}
        <div className="stadium-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase">3. ₹120 Crore Starting Purse</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Each of the 10 college teams starts with <strong>₹120.00 Crore</strong>. Sold amounts are instantly deducted from the buying team's purse and credited to the central Bank Account Ledger.
          </p>
        </div>

        {/* Rule 4: Squad Balance Checklist */}
        <div className="stadium-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white uppercase">4. Exactly 15-Member Squad</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every team must fill a 15-member squad with minimum role splits:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">BATSMEN</span>
              <strong className="text-white">Min 5 Players</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">BOWLERS</span>
              <strong className="text-white">Min 5 Players</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ALL-ROUNDERS</span>
              <strong className="text-white">Min 3 Players</strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">WICKETKEEPERS</span>
              <strong className="text-white">Min 2 Players</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
