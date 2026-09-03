import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { DollarSign, History, Star, Download } from 'lucide-react';

export const TransactionLog = () => {
  const { transactions, bankAccountTotal } = useAuction();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="stadium-card-gold rounded-2xl p-6 border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500 text-black font-black">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-white">
              Official Auction Bank Ledger & Sales History
            </h2>
            <p className="text-xs text-slate-400">
              Chronological log of all completed player sales
            </p>
          </div>
        </div>

        <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl px-4 py-2 text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Ledger Revenue</span>
          <span className="text-xl font-black text-amber-400 font-mono">₹{bankAccountTotal.toFixed(2)} Cr</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="stadium-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold uppercase text-slate-200">
            Total Sales Completed: {transactions.length}
          </h3>
          <span className="text-xs text-slate-400 font-mono">Live Sync</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 italic text-xs">
            No player sales completed yet. Bids placed on the Live Stage will appear here in real time.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Player Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Franchise</th>
                  <th className="py-3 px-4">Sold To (College Team)</th>
                  <th className="py-3 px-4">Marquee Rule</th>
                  <th className="py-3 px-4 text-right">Price (₹ Cr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{tx.timestamp}</td>
                    <td className="py-3 px-4 font-sans font-bold text-white">{tx.playerName}</td>
                    <td className="py-3 px-4 font-sans text-amber-400">{tx.playerRole}</td>
                    <td className="py-3 px-4 font-sans text-slate-300">{tx.originalTeam}</td>
                    <td className="py-3 px-4 font-sans font-extrabold text-slate-100">{tx.teamName} ({tx.teamShort})</td>
                    <td className="py-3 px-4 font-sans">
                      {tx.isMarqueeSlot ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                          <Star className="w-3 h-3 fill-amber-300" /> Slot {tx.marqueeSlotNumber}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Open Bid</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-amber-300 text-sm">
                      ₹{tx.soldPrice.toFixed(2)} Cr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
