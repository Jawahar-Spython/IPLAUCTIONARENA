import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

export const getFirebaseConfig = () => {
  const customConfigStr = localStorage.getItem('ipl_firebase_config');
  if (customConfigStr) {
    try {
      return JSON.parse(customConfigStr);
    } catch (e) {
      console.error('Invalid custom Firebase config string', e);
    }
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
  };
};

let dbInstance = null;

export const initFirebase = () => {
  const config = getFirebaseConfig();
  if (!config.databaseURL) {
    return null;
  }

  try {
    const app = !getApps().length ? initializeApp(config) : getApp();
    dbInstance = getDatabase(app);
    return dbInstance;
  } catch (error) {
    console.error("Firebase initialization failed in Admin panel:", error);
    return null;
  }
};

/**
 * Write current auction state to Firebase Realtime Database at /auctionState
 */
export const syncAuctionStateToFirebase = async ({
  players = [],
  teams = [],
  stagePlayerId = null,
  currentBid = null
}) => {
  const db = initFirebase();
  if (!db) {
    // Database URL not configured yet
    return false;
  }

  try {
    // Format players list: update active stage player with current bid details if active
    const formattedPlayers = players.map(player => {
      if (player.id === stagePlayerId && player.status !== 'Sold' && player.status !== 'Unsold') {
        return {
          ...player,
          status: 'Current Bid',
          currentBid: currentBid?.amount || player.basePrice,
          currentBidder: currentBid?.teamId || null
        };
      }
      return player;
    });

    // Format teams list
    const formattedTeams = teams.map(team => {
      const squadPlayers = formattedPlayers.filter(p => p.status === 'Sold' && p.soldTo === team.id);
      
      const roleCounts = {
        Batsman: 0,
        Bowler: 0,
        "All-rounder": 0,
        "Wicketkeeper-Batsman": 0
      };

      let marqueeCount = 0;
      let spent = 0;

      squadPlayers.forEach(p => {
        if (roleCounts[p.role] !== undefined) roleCounts[p.role] += 1;
        if (p.isMarquee || p.marqueeSlotUsed) marqueeCount += 1;
        spent += (p.soldPrice || 0);
      });

      const spentAmount = Number(spent.toFixed(2));
      const remainingPurse = Number((120 - spentAmount).toFixed(2));

      return {
        ...team,
        spentAmount,
        remainingPurse: remainingPurse >= 0 ? remainingPurse : 0,
        boughtCount: squadPlayers.length,
        roleComposition: roleCounts,
        marqueeSlotsUsed: Math.min(2, marqueeCount),
        squad: squadPlayers
      };
    });

    const payload = {
      lastUpdated: new Date().toISOString(),
      currentSpotlightPlayerId: stagePlayerId,
      players: formattedPlayers,
      teams: formattedTeams
    };

    const stateRef = ref(db, 'auctionState');
    await set(stateRef, payload);
    return true;
  } catch (error) {
    console.error("Failed to sync auction state to Firebase:", error);
    return false;
  }
};
