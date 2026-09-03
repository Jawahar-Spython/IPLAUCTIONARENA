import React, { createContext, useContext, useState, useEffect } from 'react';
import initialPlayers from '../data/players.json';
import { IPL_TEAMS, REQUIRED_SQUAD_COMPOSITION, TOTAL_SQUAD_SIZE, CATEGORY_ROUNDS } from '../data/teams';
import { sound } from '../utils/soundFx';
import confetti from 'canvas-confetti';

const AuctionContext = createContext();

const LOCAL_STORAGE_KEY = 'IPL_AUCTION_ARENA_STATE_V3';

// Fisher-Yates Shuffle Utility across franchises
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const AuctionProvider = ({ children }) => {
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load local storage state", e);
    }
    return null;
  };

  const savedState = loadInitialState();

  const [players, setPlayers] = useState(savedState?.players || initialPlayers);
  const [teams, setTeams] = useState(
    savedState?.teams ||
      IPL_TEAMS.map((t) => ({
        ...t,
        remainingPurse: t.initialPurse,
        roster: [],
        marqueeSlot1: null, // { playerId, price } if used
        marqueeSlot2: null, // { playerId, price } if used
        marqueePicksCount: 0,
      }))
  );
  const [bankAccountTotal, setBankAccountTotal] = useState(savedState?.bankAccountTotal || 0);
  const [transactions, setTransactions] = useState(savedState?.transactions || []);
  const [tagline, setTagline] = useState(
    savedState?.tagline || "The Ultimate Battle of Strategy, Talent & Budgets"
  );
  const [soundEnabled, setSoundEnabled] = useState(savedState?.soundEnabled ?? true);

  // Category Rounds Engine State
  const [currentRoundIndex, setCurrentRoundIndex] = useState(savedState?.currentRoundIndex || 0);
  const [roundQueue, setRoundQueue] = useState(savedState?.roundQueue || []);
  const [stagePlayerId, setStagePlayerId] = useState(savedState?.stagePlayerId || null);

  // Active Bid State
  const [currentBid, setCurrentBid] = useState(
    savedState?.currentBid || { amount: 0, teamId: null, marqueeOption: null }
  );

  // Helper to build a shuffled queue for a round
  const generateQueueForRound = (roundIdx, playerList) => {
    let pool = [];
    if (roundIdx === 0) {
      // Star Players
      pool = playerList.filter((p) => p.categoryRound === 'Star Players' && p.status !== 'Sold');
    } else if (roundIdx === 1) {
      // Batsmen
      pool = playerList.filter((p) => p.categoryRound === 'Batsman' && p.status !== 'Sold');
    } else if (roundIdx === 2) {
      // Bowlers
      pool = playerList.filter((p) => p.categoryRound === 'Bowler' && p.status !== 'Sold');
    } else if (roundIdx === 3) {
      // All-rounders
      pool = playerList.filter((p) => p.categoryRound === 'All-rounder' && p.status !== 'Sold');
    } else if (roundIdx === 4) {
      // Unsold Return
      pool = playerList.filter((p) => p.status === 'Unsold');
    }
    return shuffleArray(pool.map((p) => p.id));
  };

  // Initialize or update round queue on load
  useEffect(() => {
    if (!savedState?.roundQueue || savedState.roundQueue.length === 0) {
      const initialQueue = generateQueueForRound(currentRoundIndex, players);
      setRoundQueue(initialQueue);
      if (initialQueue.length > 0) {
        setStagePlayerId(initialQueue[0]);
      }
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    const stateToSave = {
      players,
      teams,
      bankAccountTotal,
      transactions,
      tagline,
      soundEnabled,
      currentRoundIndex,
      roundQueue,
      stagePlayerId,
      currentBid,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    players,
    teams,
    bankAccountTotal,
    transactions,
    tagline,
    soundEnabled,
    currentRoundIndex,
    roundQueue,
    stagePlayerId,
    currentBid,
  ]);

  const activePlayer = players.find((p) => p.id === stagePlayerId) || players[0];

  // Set base price when stage player changes
  useEffect(() => {
    if (activePlayer && activePlayer.status !== 'Sold') {
      setCurrentBid({
        amount: activePlayer.basePrice,
        teamId: null,
        marqueeOption: null,
      });
    }
  }, [stagePlayerId]);

  // Shuffle current active round queue
  const shuffleCurrentRoundQueue = () => {
    const remainingInRound = players.filter((p) => roundQueue.includes(p.id) && p.status !== 'Sold');
    const newShuffledIds = shuffleArray(remainingInRound.map((p) => p.id));
    setRoundQueue(newShuffledIds);
    if (newShuffledIds.length > 0) {
      setStagePlayerId(newShuffledIds[0]);
    }
  };

  // Change Category Round manually
  const changeCategoryRound = (newRoundIdx) => {
    setCurrentRoundIndex(newRoundIdx);
    const newQueue = generateQueueForRound(newRoundIdx, players);
    setRoundQueue(newQueue);
    if (newQueue.length > 0) {
      setStagePlayerId(newQueue[0]);
    }
  };

  // Helper to calculate team role counts
  const getTeamRoleCounts = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return { Batsman: 0, Bowler: 0, "All-rounder": 0, "Wicketkeeper-Batsman": 0 };
    
    const counts = { Batsman: 0, Bowler: 0, "All-rounder": 0, "Wicketkeeper-Batsman": 0 };
    team.roster.forEach((pId) => {
      const p = players.find((pl) => pl.id === pId);
      if (p && counts[p.role] !== undefined) {
        counts[p.role] += 1;
      }
    });
    return counts;
  };

  // Validate Bid with optional Marquee Slot Cap
  const validateBid = (teamId, bidAmount, marqueeOption = null) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return { valid: false, reason: "Invalid team selection." };

    // 1. Squad size check
    if (team.roster.length >= TOTAL_SQUAD_SIZE) {
      return { valid: false, reason: `${team.shortName} squad is full (15/15)!` };
    }

    // 2. Purse check
    if (bidAmount > team.remainingPurse) {
      return {
        valid: false,
        reason: `Bid (₹${bidAmount.toFixed(2)}Cr) exceeds remaining purse (₹${team.remainingPurse.toFixed(2)}Cr)!`,
      };
    }

    // 3. Optional Marquee Slot Caps
    // ONLY enforce cap IF the auctioneer/team actively chooses to use a marquee slot
    if (marqueeOption === 1) {
      if (team.marqueeSlot1) {
        return { valid: false, reason: `${team.shortName} has already used Marquee Slot 1!` };
      }
      if (bidAmount > 18.0) {
        return {
          valid: false,
          reason: `Marquee Slot 1 Cap Violation: ${team.shortName}'s Marquee Slot 1 is capped at ₹18.0 Cr!`,
        };
      }
    }

    if (marqueeOption === 2) {
      if (team.marqueeSlot2) {
        return { valid: false, reason: `${team.shortName} has already used Marquee Slot 2!` };
      }
      if (bidAmount > 13.0) {
        return {
          valid: false,
          reason: `Marquee Slot 2 Cap Violation: ${team.shortName}'s Marquee Slot 2 is capped at ₹13.0 Cr!`,
        };
      }
    }

    return { valid: true };
  };

  // Place a Bid
  const placeBid = (teamId, newAmount, marqueeOption = null) => {
    const validation = validateBid(teamId, newAmount, marqueeOption);
    if (!validation.valid) {
      return validation;
    }

    setCurrentBid({
      amount: Number(newAmount.toFixed(2)),
      teamId,
      marqueeOption,
    });

    if (soundEnabled) {
      sound.playBid();
    }

    return { valid: true };
  };

  // Trigger SOLD for current stage player
  const sellCurrentPlayer = (marqueeOptionToApply = currentBid.marqueeOption) => {
    if (!activePlayer) return { success: false, message: "No active player on stage." };
    if (!currentBid.teamId) {
      return { success: false, message: "Cannot sell without selecting a bidding team!" };
    }

    const teamId = currentBid.teamId;
    const finalPrice = currentBid.amount;
    const team = teams.find((t) => t.id === teamId);

    // 1. Update Player Status
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === activePlayer.id
          ? {
              ...p,
              status: 'Sold',
              soldTo: teamId,
              soldPrice: finalPrice,
              marqueeSlotUsed: marqueeOptionToApply,
            }
          : p
      )
    );

    // 2. Update Team Purse, Roster & Marquee Slots
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const updated = {
            ...t,
            remainingPurse: Number((t.remainingPurse - finalPrice).toFixed(2)),
            roster: [...t.roster, activePlayer.id],
          };
          if (marqueeOptionToApply === 1) {
            updated.marqueeSlot1 = { playerId: activePlayer.id, price: finalPrice };
            updated.marqueePicksCount += 1;
          } else if (marqueeOptionToApply === 2) {
            updated.marqueeSlot2 = { playerId: activePlayer.id, price: finalPrice };
            updated.marqueePicksCount += 1;
          }
          return updated;
        }
        return t;
      })
    );

    // 3. Update Bank Ledger & Transaction Log
    setBankAccountTotal((prev) => Number((prev + finalPrice).toFixed(2)));

    const newTx = {
      id: `TX-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      playerId: activePlayer.id,
      playerName: activePlayer.name,
      playerRole: activePlayer.role,
      originalTeam: activePlayer.originalTeam,
      teamId,
      teamName: team.name,
      teamShort: team.shortName,
      soldPrice: finalPrice,
      marqueeOptionUsed: marqueeOptionToApply,
      categoryRound: CATEGORY_ROUNDS[currentRoundIndex],
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Audio & Confetti
    if (soundEnabled) {
      sound.playGavel();
      if (finalPrice >= 10.0 || marqueeOptionToApply) {
        setTimeout(() => sound.playFanfare(), 300);
      }
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Advance Stage Queue
    advanceQueue();

    return { success: true, teamName: team.name, price: finalPrice };
  };

  // Mark Stage Player as UNSOLD
  const markCurrentUnsold = () => {
    if (!activePlayer) return;

    setPlayers((prev) =>
      prev.map((p) => (p.id === activePlayer.id ? { ...p, status: 'Unsold' } : p))
    );

    if (soundEnabled) {
      sound.playUnsold();
    }

    advanceQueue();
  };

  // Advance Queue inside current round or trigger next round
  const advanceQueue = () => {
    const updatedQueue = roundQueue.filter((id) => id !== activePlayer.id);
    setRoundQueue(updatedQueue);
    if (updatedQueue.length > 0) {
      setStagePlayerId(updatedQueue[0]);
    } else {
      // Auto advance to next round if available
      if (currentRoundIndex < CATEGORY_ROUNDS.length - 1) {
        changeCategoryRound(currentRoundIndex + 1);
      }
    }
  };

  // Recall an Unsold Player to the Auction Stage
  const recallPlayerToStage = (playerId) => {
    const p = players.find((pl) => pl.id === playerId);
    if (p) {
      setStagePlayerId(p.id);
      setCurrentBid({
        amount: p.basePrice,
        teamId: null,
        marqueeOption: null,
      });
    }
  };

  // Reset Entire Auction State
  const resetAuction = () => {
    setPlayers(
      initialPlayers.map((p) => ({ ...p, status: undefined, soldTo: undefined, soldPrice: undefined }))
    );
    setTeams(
      IPL_TEAMS.map((t) => ({
        ...t,
        remainingPurse: t.initialPurse,
        roster: [],
        marqueeSlot1: null,
        marqueeSlot2: null,
        marqueePicksCount: 0,
      }))
    );
    setBankAccountTotal(0);
    setTransactions([]);
    setCurrentRoundIndex(0);
    const firstQueue = generateQueueForRound(0, initialPlayers);
    setRoundQueue(firstQueue);
    setStagePlayerId(firstQueue[0] || initialPlayers[0].id);
    setCurrentBid({ amount: initialPlayers[0].basePrice, teamId: null, marqueeOption: null });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AuctionContext.Provider
      value={{
        players,
        teams,
        bankAccountTotal,
        transactions,
        tagline,
        setTagline,
        soundEnabled,
        setSoundEnabled,
        currentRoundIndex,
        currentRoundName: CATEGORY_ROUNDS[currentRoundIndex],
        roundQueue,
        changeCategoryRound,
        shuffleCurrentRoundQueue,
        stagePlayer: activePlayer,
        setStagePlayerId,
        currentBid,
        setCurrentBid,
        placeBid,
        sellCurrentPlayer,
        markCurrentUnsold,
        recallPlayerToStage,
        resetAuction,
        validateBid,
        getTeamRoleCounts,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
};
