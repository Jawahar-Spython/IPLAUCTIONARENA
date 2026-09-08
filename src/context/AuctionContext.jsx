import React, { createContext, useContext, useState, useEffect } from 'react';
import initialPlayers from '../data/players.json';
import { IPL_TEAMS, REQUIRED_SQUAD_COMPOSITION, TOTAL_SQUAD_SIZE, CATEGORY_ROUNDS } from '../data/teams';
import { sound } from '../utils/soundFx';
import confetti from 'canvas-confetti';

import { syncAuctionStateToFirebase } from '../services/firebase';

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
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.players) && Array.isArray(parsed?.teams)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load local storage state", e);
    }
    return null;
  };

  const savedState = loadInitialState();

  const [players, setPlayers] = useState(savedState?.players || initialPlayers);
  const [teams, setTeams] = useState(() => {
    if (savedState?.teams) {
      return savedState.teams.map((st) => {
        const match = IPL_TEAMS.find((t) => t.id === st.id);
        return {
          ...st,
          logo: match ? match.logo : st.logo,
        };
      });
    }
    return IPL_TEAMS.map((t) => ({
      ...t,
      remainingPurse: t.initialPurse,
      roster: [],
      marqueeSlot1: null, // { playerId, price } if used
      marqueeSlot2: null, // { playerId, price } if used
      marqueePicksCount: 0,
    }));
  });
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
    
    // Sync live state to Firebase Realtime Database
    syncAuctionStateToFirebase({
      players,
      teams,
      stagePlayerId,
      currentBid
    });
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

  // Direct Mark Player Sold (Quick Admin Action for any of the 193 players)
  const markPlayerSoldDirect = (playerId, teamId, price, marqueeOption = null, overrideWarning = false) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return { success: false, message: "Player not found in database." };

    if (player.status === 'Sold') {
      return {
        success: false,
        message: `BLOCKED: ${player.name} has already been sold to ${player.soldTo}!`,
      };
    }

    const team = teams.find((t) => t.id === teamId);
    if (!team) return { success: false, message: "Please select a valid buying team." };

    const finalPrice = parseFloat(price);
    if (isNaN(finalPrice) || finalPrice <= 0) {
      return { success: false, message: "Please enter a valid final sold price greater than 0." };
    }

    // 1. Squad size check (HARD BLOCK)
    if (team.roster.length >= TOTAL_SQUAD_SIZE) {
      return {
        success: false,
        message: `BLOCKED: ${team.name} (${team.shortName}) squad is full (15/15 players)!`,
      };
    }

    // 2. Purse check (HARD BLOCK)
    if (finalPrice > team.remainingPurse) {
      return {
        success: false,
        message: `BLOCKED: Sold price (₹${finalPrice.toFixed(2)} Cr) exceeds ${team.shortName}'s remaining purse (₹${team.remainingPurse.toFixed(2)} Cr)!`,
      };
    }

    // 3. Marquee Slot Validation
    if (marqueeOption === 1) {
      if (team.marqueeSlot1) {
        return { success: false, message: `BLOCKED: ${team.shortName} has already used Marquee Slot 1!` };
      }
      if (finalPrice > 18.0 && !overrideWarning) {
        return {
          success: false,
          isWarning: true,
          message: `MARQUEE CAP WARNING: Marquee Slot 1 is capped at ₹18.0 Cr (${team.shortName} price: ₹${finalPrice.toFixed(2)} Cr). Click confirm again to override if this is a manual correction.`,
        };
      }
    } else if (marqueeOption === 2) {
      if (team.marqueeSlot2) {
        return { success: false, message: `BLOCKED: ${team.shortName} has already used Marquee Slot 2!` };
      }
      if (finalPrice > 13.0 && !overrideWarning) {
        return {
          success: false,
          isWarning: true,
          message: `MARQUEE CAP WARNING: Marquee Slot 2 is capped at ₹13.0 Cr (${team.shortName} price: ₹${finalPrice.toFixed(2)} Cr). Click confirm again to override if this is a manual correction.`,
        };
      }
    }

    // UPDATE PLAYER STATE
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? {
              ...p,
              status: 'Sold',
              soldTo: teamId,
              soldPrice: finalPrice,
              marqueeSlotUsed: marqueeOption,
            }
          : p
      )
    );

    // UPDATE TEAM PURSE & ROSTER
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          const updated = {
            ...t,
            remainingPurse: Number((t.remainingPurse - finalPrice).toFixed(2)),
            roster: [...t.roster, playerId],
          };
          if (marqueeOption === 1) {
            updated.marqueeSlot1 = { playerId, price: finalPrice };
            updated.marqueePicksCount += 1;
          } else if (marqueeOption === 2) {
            updated.marqueeSlot2 = { playerId, price: finalPrice };
            updated.marqueePicksCount += 1;
          }
          return updated;
        }
        return t;
      })
    );

    // UPDATE BANK LEDGER
    setBankAccountTotal((prev) => Number((prev + finalPrice).toFixed(2)));

    // RECORD TRANSACTION LOG
    const newTx = {
      id: `TX-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      playerId: player.id,
      playerName: player.name,
      playerRole: player.role,
      originalTeam: player.originalTeam,
      teamId,
      teamName: team.name,
      teamShort: team.shortName,
      soldPrice: finalPrice,
      marqueeOptionUsed: marqueeOption,
      categoryRound: player.categoryRound || CATEGORY_ROUNDS[currentRoundIndex],
    };

    setTransactions((prev) => [newTx, ...prev]);

    // AUDIO & CONFETTI
    if (soundEnabled) {
      sound.playGavel();
      if (finalPrice >= 10.0 || marqueeOption) {
        setTimeout(() => sound.playFanfare(), 300);
      }
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Remove from active round queue if present
    setRoundQueue((prev) => prev.filter((id) => id !== playerId));
    if (stagePlayerId === playerId) {
      advanceQueue();
    }

    return {
      success: true,
      message: `🔨 SOLD! ${player.name} to ${team.name} for ₹${finalPrice.toFixed(2)} Cr!`,
    };
  };

  // UNDO A SPECIFIC TRANSACTION
  const undoTransaction = (transactionId) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return { success: false, message: "Transaction record not found." };

    // 1. Revert Player Status
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === tx.playerId
          ? {
              ...p,
              status: 'Available',
              soldTo: undefined,
              soldPrice: undefined,
              marqueeSlotUsed: undefined,
            }
          : p
      )
    );

    // 2. Revert Team Purse, Roster & Marquee Slots
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === tx.teamId) {
          const updatedRoster = t.roster.filter((id) => id !== tx.playerId);
          const updated = {
            ...t,
            remainingPurse: Number((t.remainingPurse + tx.soldPrice).toFixed(2)),
            roster: updatedRoster,
          };

          if (t.marqueeSlot1 && t.marqueeSlot1.playerId === tx.playerId) {
            updated.marqueeSlot1 = null;
            updated.marqueePicksCount = Math.max(0, updated.marqueePicksCount - 1);
          }
          if (t.marqueeSlot2 && t.marqueeSlot2.playerId === tx.playerId) {
            updated.marqueeSlot2 = null;
            updated.marqueePicksCount = Math.max(0, updated.marqueePicksCount - 1);
          }
          return updated;
        }
        return t;
      })
    );

    // 3. Revert Bank Ledger Total
    setBankAccountTotal((prev) => Number(Math.max(0, prev - tx.soldPrice).toFixed(2)));

    // 4. Remove Transaction from Log
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));

    if (soundEnabled) {
      sound.playUnsold();
    }

    return {
      success: true,
      message: `↩️ UNDONE! Sale of ${tx.playerName} to ${tx.teamShort} for ₹${tx.soldPrice.toFixed(2)} Cr has been reversed. Purse refunded.`,
    };
  };

  // UNDO THE MOST RECENT SALE
  const undoLastSale = () => {
    if (transactions.length === 0) {
      return { success: false, message: "No sales to undo." };
    }
    const lastTx = transactions[0];
    return undoTransaction(lastTx.id);
  };

  // Recall an Unsold or Pool Player to the Auction Stage
  const recallPlayerToStage = (playerId) => {
    const p = players.find((pl) => pl.id === playerId);
    if (p) {
      setStagePlayerId(p.id);
      setCurrentBid({
        amount: p.basePrice || 2.0,
        teamId: null,
        marqueeOption: null,
      });
      setRoundQueue((prev) => {
        if (!prev.includes(p.id)) {
          return [p.id, ...prev];
        }
        return prev;
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
        markPlayerSoldDirect,
        undoTransaction,
        undoLastSale,
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
