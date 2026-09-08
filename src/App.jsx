import React, { useState, Component } from 'react';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import { Navbar } from './components/Navbar';
import { LiveAuctionStage } from './components/LiveAuctionStage';
import { TeamDashboard } from './components/TeamDashboard';
import { AuctioneerDashboard } from './components/AuctioneerDashboard';
import { PlayerCatalog } from './components/PlayerCatalog';
import { TransactionLog } from './components/TransactionLog';
import { RulesPage } from './components/RulesPage';
import { Gavel, RefreshCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("IPL Auction Arena Error Boundary caught an error:", error, errorInfo);
  }

  handleClearAndReload = () => {
    try {
      localStorage.removeItem('IPL_AUCTION_ARENA_STATE_V3');
      localStorage.removeItem('ipl_firebase_config');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full stadium-card-gold rounded-3xl p-8 border border-amber-500/50 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display uppercase tracking-wide text-white">
                IPL AUCTION ARENA
              </h2>
              <p className="text-xs text-amber-400 mt-1 font-semibold">
                An unexpected state error occurred.
              </p>
            </div>
            <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-left overflow-x-auto max-h-32">
              {this.state.error?.toString() || 'Unknown Error'}
            </p>
            <button
              onClick={this.handleClearAndReload}
              className="w-full py-3 px-6 rounded-xl bg-amber-500 text-black font-extrabold uppercase tracking-wider text-xs hover:bg-amber-400 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Reset App Data & Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const MainContent = () => {
  const [activeTab, setActiveTab] = useState('stage');
  const [selectedTeamId, setSelectedTeamId] = useState('CSK');
  const { recallPlayerToStage } = useAuction();

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
    <ErrorBoundary>
      <AuctionProvider>
        <MainContent />
      </AuctionProvider>
    </ErrorBoundary>
  );
}
