import React, { useState } from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import { Navbar } from './components/Navbar';
import { LiveAuctionStage } from './components/LiveAuctionStage';
import { TeamDashboard } from './components/TeamDashboard';
import { AuctioneerDashboard } from './components/AuctioneerDashboard';
import { PlayerCatalog } from './components/PlayerCatalog';
import { TransactionLog } from './components/TransactionLog';
import { RulesPage } from './components/RulesPage';
import { Gavel } from 'lucide-react';

const MainContent = () => {
  const [activeTab, setActiveTab] = useState('stage');
  const [selectedTeamId, setSelectedTeamId] = useState('CSK');
  const { stagePlayer, setStagePlayerId, recallPlayerToStage } = useAuction();

  const handleSelectTeamFromStage = (teamId) => {
    setSelectedTeamId(teamId);
    setActiveTab('teams');
  };

  const handleSendPlayerToStage = (playerId) => {
    recallPlayerToStage(playerId);
    setActiveTab('stage');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'stage' && (
          <LiveAuctionStage onSelectTeam={handleSelectTeamFromStage} />
        )}

        {activeTab === 'teams' && (
          <TeamDashboard selectedTeamId={selectedTeamId} setSelectedTeamId={setSelectedTeamId} />
        )}

        {activeTab === 'auctioneer' && (
          <AuctioneerDashboard onNavigateToStage={() => setActiveTab('stage')} />
        )}

        {activeTab === 'players' && (
          <PlayerCatalog onSendToStage={handleSendPlayerToStage} />
        )}

        {activeTab === 'ledger' && (
          <TransactionLog />
        )}

        {activeTab === 'rules' && (
          <RulesPage />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0F19] border-t border-slate-800/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-amber-400 -rotate-12" />
            <span className="font-extrabold tracking-wider text-slate-300 font-display">IPL AUCTION ARENA</span>
            <span>• Official College Event Portal</span>
          </div>
          <p>© 2026 IPL AUCTION ARENA Engine • Powered by Real-Time Budget & Marquee Rules Engine</p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuctionProvider>
      <MainContent />
    </AuctionProvider>
  );
}
