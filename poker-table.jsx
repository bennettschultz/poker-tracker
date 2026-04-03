import { useState, useCallback, useRef, useEffect } from "react";

const SUITS = ["s", "h", "d", "c"];
const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUIT_SYMBOLS = { s: "♠", h: "♥", d: "♦", c: "♣" };
const SUIT_COLORS = { s: "#e2e8f0", h: "#f87171", d: "#60a5fa", c: "#a3e635" };

const DEFAULT_PLAYERS = [
  { name: "Hero", stack: 35, isHero: true, bounty: 2.5 },
  { name: "Villain 2", stack: 50, isHero: false, bounty: 2.5 },
  { name: "Villain 3", stack: 80, isHero: false, bounty: 2.5 },
  { name: "Villain 4", stack: 100, isHero: false, bounty: 2.5 },
  { name: "Villain 5", stack: 60, isHero: false, bounty: 2.5 },
  { name: "Villain 6", stack: 45, isHero: false, bounty: 2.5 },
  { name: "Villain 7", stack: 30, isHero: false, bounty: 2.5 },
  { name: "Villain 8", stack: 25, isHero: false, bounty: 2.5 },
];

const POSITIONS_8 = ["UTG", "UTG+1", "MP", "LJ", "HJ", "CO", "BTN", "SB"];
const POSITIONS_9 = ["UTG", "UTG+1", "UTG+2", "MP", "LJ", "HJ", "CO", "BTN", "SB"];
const POSITIONS_6 = ["UTG", "MP", "CO", "BTN", "SB", "BB"];

function getPositions(count) {
  if (count <= 6) return POSITIONS_6.slice(0, count);
  if (count <= 8) return POSITIONS_8.slice(0, count);
  return POSITIONS_9.slice(0, count);
}

// Seat positions around an ellipse for 6-9 players
function getSeatPositions(count) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    // Start from bottom-center and go clockwise
    const angle = (Math.PI / 2) + (2 * Math.PI * i) / count;
    const x = 50 + 40 * Math.cos(angle);
    const y = 50 + 32 * Math.sin(angle);
    positions.push({ x, y });
  }
  return positions;
}

function CardDisplay({ card, small = false }) {
  if (!card) return (
    <div style={{
      width: small ? 28 : 36,
      height: small ? 38 : 50,
      background: "linear-gradient(135deg, #1a365d, #2d3748)",
      borderRadius: 4,
      border: "1px solid #4a5568",
      display: "inline-block",
    }} />
  );
  const [rank, suit] = [card[0], card[1]];
  const color = suit === "h" || suit === "d" ? "#ef4444" : "#e2e8f0";
  return (
    <div style={{
      width: small ? 28 : 36,
      height: small ? 38 : 50,
      background: "#f8fafc",
      borderRadius: 4,
      border: "1px solid #94a3b8",
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      fontWeight: 700,
      fontSize: small ? 11 : 14,
      color,
      lineHeight: 1,
      gap: 0,
    }}>
      <span>{rank}</span>
      <span style={{ fontSize: small ? 10 : 12 }}>{SUIT_SYMBOLS[suit]}</span>
    </div>
  );
}

function MiniCard({ card }) {
  if (!card) return null;
  const [rank, suit] = [card[0], card[1]];
  const color = suit === "h" || suit === "d" ? "#ef4444" : "#e2e8f0";
  return (
    <span style={{ color, fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>
      {rank}{SUIT_SYMBOLS[suit]}
    </span>
  );
}

// Card selector component
function CardSelector({ label, value, onChange, usedCards }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const allCards = RANKS.flatMap(r => SUITS.map(s => r + s));

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 2, textAlign: "center" }}>{label}</div>
      <div
        onClick={() => setOpen(!open)}
        style={{
          cursor: "pointer",
          padding: 2,
          borderRadius: 4,
          border: open ? "2px solid #22d3ee" : "2px solid transparent",
        }}
      >
        {value ? <CardDisplay card={value} /> : (
          <div style={{
            width: 36, height: 50, background: "#1e293b", borderRadius: 4,
            border: "2px dashed #4a5568", display: "flex", alignItems: "center",
            justifyContent: "center", color: "#64748b", fontSize: 18,
          }}>?</div>
        )}
      </div>
      {open && (
        <div style={{
          position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
          marginBottom: 4, background: "#1e293b", border: "1px solid #334155",
          borderRadius: 8, padding: 8, zIndex: 100, width: 200,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          {value && (
            <button
              onClick={(e) => { e.stopPropagation(); onChange(null); setOpen(false); }}
              style={{
                width: "100%", padding: "4px 0", marginBottom: 6, background: "#7f1d1d",
                border: "none", borderRadius: 4, color: "#fca5a5", cursor: "pointer",
                fontSize: 11, fontWeight: 600,
              }}
            >Clear</button>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3 }}>
            {allCards.map(c => {
              const disabled = usedCards.includes(c) && c !== value;
              const color = c[1] === "h" || c[1] === "d" ? "#ef4444" : "#e2e8f0";
              return (
                <button
                  key={c}
                  disabled={disabled}
                  onClick={(e) => { e.stopPropagation(); onChange(c); setOpen(false); }}
                  style={{
                    padding: "3px 2px", background: c === value ? "#164e63" : disabled ? "#0f172a" : "#0f172a",
                    border: c === value ? "1px solid #22d3ee" : "1px solid #1e293b",
                    borderRadius: 3, cursor: disabled ? "not-allowed" : "pointer",
                    color: disabled ? "#334155" : color,
                    fontFamily: "monospace", fontWeight: 700, fontSize: 11,
                    opacity: disabled ? 0.3 : 1,
                  }}
                >
                  {c[0]}{SUIT_SYMBOLS[c[1]]}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const STREETS = ["preflop", "flop", "turn", "river", "showdown"];

function getStreetLabel(street) {
  return street.charAt(0).toUpperCase() + street.slice(1);
}

export default function PokerTable() {
  // Tournament settings
  const [tournamentType, setTournamentType] = useState("bounty"); // bounty, normal
  const [blindLevel, setBlindLevel] = useState(9);
  const [sb, setSb] = useState(250);
  const [bb, setBb] = useState(500);
  const [ante, setAnte] = useState(60);
  const [bountyBB, setBountyBB] = useState(2.5);
  const [playersLeft, setPlayersLeft] = useState(394);
  const [myRank, setMyRank] = useState(358);
  const [paidPlaces, setPaidPlaces] = useState(71);
  const [stackBB, setStackBB] = useState(22.7);

  // Table
  const [playerCount, setPlayerCount] = useState(8);
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);
  const [dealerIndex, setDealerIndex] = useState(null); // Which seat is BTN
  const [heroSeat, setHeroSeat] = useState(0); // Which seat is Hero

  // Hand state
  const [handActive, setHandActive] = useState(false);
  const [street, setStreet] = useState("preflop");
  const [pot, setPot] = useState(0);
  const [heroCards, setHeroCards] = useState([null, null]);
  const [boardCards, setBoardCards] = useState([null, null, null, null, null]);
  const [currentAction, setCurrentAction] = useState(null); // index of player whose action it is
  const [playerStates, setPlayerStates] = useState([]); // "active", "folded", "allin"
  const [betAmounts, setBetAmounts] = useState([]); // current street bets per player
  const [currentBet, setCurrentBet] = useState(0); // highest bet on current street
  const [betInput, setBetInput] = useState("");
  const [actionLog, setActionLog] = useState([]);
  const [handHistory, setHandHistory] = useState([]); // for undo: snapshots
  const [showSetup, setShowSetup] = useState(true);
  const [showAdvisor, setShowAdvisor] = useState(true);
  const [advisorText, setAdvisorText] = useState("");
  const [editingPlayers, setEditingPlayers] = useState(false);

  // Derived
  const positions = getPositions(playerCount);
  const seatPositions = getSeatPositions(playerCount);

  // Get BB index (always seat after SB, which is after BTN)
  const getBBIndex = useCallback(() => {
    if (dealerIndex === null) return null;
    if (playerCount === 2) return dealerIndex; // heads up: BTN is SB
    return (dealerIndex + 2) % playerCount;
  }, [dealerIndex, playerCount]);

  const getSBIndex = useCallback(() => {
    if (dealerIndex === null) return null;
    if (playerCount === 2) return (dealerIndex) % playerCount;
    return (dealerIndex + 1) % playerCount;
  }, [dealerIndex, playerCount]);

  // Position labels relative to dealer
  function getPositionLabel(seatIndex) {
    if (dealerIndex === null) return "";
    const offset = (seatIndex - dealerIndex + playerCount) % playerCount;
    // For N players: last seat before dealer wraps is BTN
    // offset 0 = BTN, offset 1 = SB, offset 2 = BB, then UTG etc.
    // Actually: let's label properly
    // BTN = dealerIndex, SB = dealer+1, BB = dealer+2
    // Then positions go UTG, UTG+1, ... around
    if (playerCount === 2) {
      return offset === 0 ? "BTN/SB" : "BB";
    }
    if (offset === 0) return "BTN";
    if (offset === 1) return "SB";
    if (offset === 2) return "BB";
    // Remaining seats: from offset 3 to playerCount-1
    const remainingCount = playerCount - 3;
    const posIdx = offset - 3;
    if (remainingCount <= 1) return "UTG";
    if (remainingCount === 2) return posIdx === 0 ? "UTG" : "CO";
    if (remainingCount === 3) return ["UTG", "MP", "CO"][posIdx];
    if (remainingCount === 4) return ["UTG", "UTG+1", "MP", "CO"][posIdx];
    if (remainingCount === 5) return ["UTG", "UTG+1", "MP", "LJ", "HJ"][posIdx]; // 8-handed: HJ before CO? Actually CO is offset=playerCount-1 relative
    // Let me redo: for 8 players, positions from BTN going clockwise:
    // BTN, SB, BB, UTG, UTG+1, MP, LJ, HJ
    // Wait no. Standard 8-handed: UTG, UTG+1, MP, LJ, HJ, CO, BTN, SB, BB
    // But we skip BB (offset=2), SB(offset=1), BTN(offset=0)
    // From offset 3: UTG, UTG+1, MP, LJ, HJ (5 remaining for 8 players)
    // Hmm that's 5 remaining but we need CO too
    // Actually for 8-handed (excluding BB who we labeled): offsets 3,4,5,6,7 but 7 wraps back
    // No: playerCount=8, offsets 0-7. 0=BTN,1=SB,2=BB,3-7=remaining 5 positions
    // Standard 8-handed: UTG, UTG+1, MP, LJ, HJ, CO, BTN, SB (BB posts)
    // So offsets 3=UTG, 4=UTG+1, 5=MP, 6=LJ, 7=HJ ... wait that's only 5 non-blind/button
    // Actually 8-handed has: UTG, UTG+1, LJ, HJ, CO, BTN, SB, BB
    // That's 5 positions before BTN. offsets 3,4,5,6,7 = UTG, UTG+1, LJ, HJ, CO
    if (remainingCount === 5) return ["UTG", "UTG+1", "LJ", "HJ", "CO"][posIdx];
    if (remainingCount === 6) return ["UTG", "UTG+1", "MP", "LJ", "HJ", "CO"][posIdx];
    return `Seat ${seatIndex + 1}`;
  }

  // Get first-to-act index for a given street
  function getFirstToAct(st, states) {
    if (st === "preflop") {
      // First to act preflop = UTG = seat after BB = dealerIndex + 3
      const utg = (dealerIndex + 3) % playerCount;
      // Find first active player starting from UTG
      for (let i = 0; i < playerCount; i++) {
        const idx = (utg + i) % playerCount;
        if (states[idx] === "active") return idx;
      }
      return null;
    } else {
      // Postflop: first active player after dealer (SB first, then BB, etc.)
      const sbIdx = getSBIndex();
      for (let i = 0; i < playerCount; i++) {
        const idx = (sbIdx + i) % playerCount;
        if (states[idx] === "active") return idx;
      }
      return null;
    }
  }

  // Save snapshot for undo
  function saveSnapshot() {
    setHandHistory(prev => [...prev, {
      street,
      pot,
      currentAction,
      playerStates: [...playerStates],
      betAmounts: [...betAmounts],
      currentBet,
      actionLog: [...actionLog],
      boardCards: [...boardCards],
    }]);
  }

  // Undo last action
  function handleUndo() {
    if (handHistory.length === 0) return;
    const prev = handHistory[handHistory.length - 1];
    setStreet(prev.street);
    setPot(prev.pot);
    setCurrentAction(prev.currentAction);
    setPlayerStates(prev.playerStates);
    setBetAmounts(prev.betAmounts);
    setCurrentBet(prev.currentBet);
    setActionLog(prev.actionLog);
    setBoardCards(prev.boardCards);
    setHandHistory(h => h.slice(0, -1));
  }

  // Deal new hand
  function dealHand() {
    if (dealerIndex === null) {
      alert("Please select a dealer (BTN) first by clicking a seat.");
      return;
    }
    if (!heroCards[0] || !heroCards[1]) {
      alert("Please enter your hole cards first.");
      return;
    }
    const states = players.slice(0, playerCount).map(() => "active");
    const bets = players.slice(0, playerCount).map(() => 0);
    const sbIdx = getSBIndex();
    const bbIdx = getBBIndex();

    // Post blinds and antes
    let initPot = 0;
    const antePerPlayer = ante / bb; // ante in BB
    for (let i = 0; i < playerCount; i++) {
      bets[i] = antePerPlayer;
      initPot += antePerPlayer;
    }
    // SB
    bets[sbIdx] += 0.5;
    initPot += 0.5;
    // BB
    bets[bbIdx] += 1;
    initPot += 1;

    setPlayerStates(states);
    setBetAmounts(bets);
    setCurrentBet(1); // 1 BB
    setPot(initPot);
    setStreet("preflop");
    setHandActive(true);
    setActionLog([]);
    setHandHistory([]);
    setBoardCards([null, null, null, null, null]);

    // First to act = UTG
    const firstAct = getFirstToAct("preflop", states);
    setCurrentAction(firstAct);

    // Generate advisor text for hero if hero is first to act
    if (firstAct === heroSeat) {
      generateAdvisorText(states, bets, "preflop", initPot);
    } else {
      setAdvisorText(`Waiting for ${getPlayerName(firstAct)} (${getPositionLabel(firstAct)}) to act...`);
    }
  }

  function getPlayerName(idx) {
    if (idx === null || idx === undefined) return "?";
    return players[idx]?.name || `Seat ${idx + 1}`;
  }

  function generateAdvisorText(states, bets, st, currentPot) {
    const heroPos = getPositionLabel(heroSeat);
    const heroStack = players[heroSeat].stack;
    const activePlayers = states.filter(s => s === "active").length;
    const card1 = heroCards[0] ? `${heroCards[0][0]}${SUIT_SYMBOLS[heroCards[0][1]]}` : "?";
    const card2 = heroCards[1] ? `${heroCards[1][0]}${SUIT_SYMBOLS[heroCards[1][1]]}` : "?";

    let text = `YOUR ACTION — ${heroPos} — ${card1}${card2}\n`;
    text += `Stack: ${heroStack.toFixed(1)}BB | Pot: ${currentPot.toFixed(1)}BB | ${activePlayers} active\n`;
    if (st === "preflop") {
      text += `Facing: ${bets[heroSeat] < (currentBet || 1) ? (currentBet || 1) + "BB to call" : "checked to you"}\n`;
    }
    text += `\nWhat's your play?`;
    setAdvisorText(text);
  }

  // Find next active player after current
  function getNextPlayer(fromIdx, states) {
    for (let i = 1; i < playerCount; i++) {
      const idx = (fromIdx + i) % playerCount;
      if (states[idx] === "active") return idx;
    }
    return null;
  }

  // Check if betting round is complete
  function isBettingComplete(states, bets, fromIdx, cBet) {
    // Count active players
    const activePlayers = states.reduce((count, s, i) => s === "active" ? count + 1 : count, 0);
    if (activePlayers <= 1) return true;

    // Check if all active players have acted and matched the current bet
    // Actually: the round ends when action comes back to the last raiser (or BB preflop if no raise)
    // Simplified: round ends when next player to act has already matched current bet
    // We'll check by going around and seeing if everyone active has matched
    for (let i = 0; i < playerCount; i++) {
      if (states[i] === "active") {
        // Skip checking if the bet difference is just from blinds/antes preflop
        // Actually, simpler: if any active player hasn't matched the current bet, not done
        // But we also need them to have had a chance to act
        // This is tricky — let's use a simpler approach and just advance manually
      }
    }
    return false;
  }

  // Process an action
  function handleAction(action, amount = 0) {
    if (currentAction === null || !handActive) return;
    saveSnapshot();

    const newStates = [...playerStates];
    const newBets = [...betAmounts];
    let newPot = pot;
    let newCurrentBet = currentBet;
    const playerName = getPlayerName(currentAction);
    const pos = getPositionLabel(currentAction);
    const newLog = [...actionLog];

    switch (action) {
      case "fold":
        newStates[currentAction] = "folded";
        newLog.push(`${playerName} (${pos}) folds`);
        break;
      case "check":
        newLog.push(`${playerName} (${pos}) checks`);
        break;
      case "call": {
        const callAmount = currentBet - newBets[currentAction];
        newBets[currentAction] = currentBet;
        newPot += callAmount;
        newLog.push(`${playerName} (${pos}) calls ${callAmount.toFixed(1)}BB`);
        break;
      }
      case "bet":
      case "raise": {
        const raiseAmount = parseFloat(amount) || (currentBet > 0 ? currentBet * 2 : 2);
        const additional = raiseAmount - newBets[currentAction];
        newBets[currentAction] = raiseAmount;
        newPot += additional;
        newCurrentBet = raiseAmount;
        newLog.push(`${playerName} (${pos}) ${action}s to ${raiseAmount.toFixed(1)}BB`);
        break;
      }
      case "allin": {
        const playerStack = players[currentAction].stack;
        const additional = playerStack - newBets[currentAction];
        newBets[currentAction] = playerStack;
        newPot += additional;
        if (playerStack > newCurrentBet) newCurrentBet = playerStack;
        newStates[currentAction] = "allin";
        newLog.push(`${playerName} (${pos}) all-in ${playerStack.toFixed(1)}BB`);
        break;
      }
    }

    setPlayerStates(newStates);
    setBetAmounts(newBets);
    setPot(newPot);
    setCurrentBet(newCurrentBet);
    setActionLog(newLog);

    // Check if hand is over (1 or fewer active players)
    const activePlayers = newStates.filter(s => s === "active" || s === "allin").length;
    if (activePlayers <= 1) {
      setCurrentAction(null);
      setHandActive(false);
      setAdvisorText(`Hand over. Pot: ${newPot.toFixed(1)}BB`);
      return;
    }

    // Find next active player
    const next = getNextPlayer(currentAction, newStates);

    // Check if we should advance to next street
    // Simple approach: if next player has matched current bet, street is done
    // Actually let's let the user manually advance streets via a button
    setCurrentAction(next);

    if (next === heroSeat) {
      generateAdvisorTextUpdated(newStates, newBets, street, newPot, newCurrentBet);
    } else {
      setAdvisorText(`${getPlayerName(next)} (${getPositionLabel(next)}) to act. Pot: ${newPot.toFixed(1)}BB`);
    }
  }

  function generateAdvisorTextUpdated(states, bets, st, currentPot, cBet) {
    const heroPos = getPositionLabel(heroSeat);
    const heroStack = players[heroSeat].stack;
    const activePlayers = states.filter(s => s === "active").length;
    const card1 = heroCards[0] ? `${heroCards[0][0]}${SUIT_SYMBOLS[heroCards[0][1]]}` : "?";
    const card2 = heroCards[1] ? `${heroCards[1][0]}${SUIT_SYMBOLS[heroCards[1][1]]}` : "?";
    const toCall = cBet - (bets[heroSeat] || 0);

    let text = `YOUR ACTION — ${heroPos} — ${card1}${card2}\n`;
    text += `Stack: ${heroStack.toFixed(1)}BB | Pot: ${currentPot.toFixed(1)}BB | ${activePlayers} active\n`;
    if (toCall > 0) {
      text += `Facing ${toCall.toFixed(1)}BB to call (${cBet.toFixed(1)}BB total)\n`;
    } else {
      text += `Checked to you\n`;
    }

    // Board
    const boardStr = boardCards.filter(c => c).map(c => `${c[0]}${SUIT_SYMBOLS[c[1]]}`).join(" ");
    if (boardStr) text += `Board: ${boardStr}\n`;

    text += `\nWhat's your play?`;
    setAdvisorText(text);
  }

  // Advance to next street
  function advanceStreet() {
    if (!handActive) return;
    saveSnapshot();
    const streetOrder = ["preflop", "flop", "turn", "river", "showdown"];
    const idx = streetOrder.indexOf(street);
    if (idx >= streetOrder.length - 1) {
      setHandActive(false);
      setAdvisorText(`Showdown. Pot: ${pot.toFixed(1)}BB`);
      return;
    }
    const nextStreet = streetOrder[idx + 1];
    setStreet(nextStreet);

    // Reset bets for new street
    const newBets = betAmounts.map(() => 0);
    setBetAmounts(newBets);
    setCurrentBet(0);

    if (nextStreet === "showdown") {
      setCurrentAction(null);
      setAdvisorText(`Showdown. Pot: ${pot.toFixed(1)}BB`);
      return;
    }

    // First to act postflop
    const firstAct = getFirstToAct(nextStreet, playerStates);
    setCurrentAction(firstAct);

    if (firstAct === heroSeat) {
      generateAdvisorTextUpdated(playerStates, newBets, nextStreet, pot, 0);
    } else {
      setAdvisorText(`${getStreetLabel(nextStreet)} — ${getPlayerName(firstAct)} (${getPositionLabel(firstAct)}) to act. Pot: ${pot.toFixed(1)}BB`);
    }
  }

  // End hand
  function endHand() {
    setHandActive(false);
    setCurrentAction(null);
    setAdvisorText("");
  }

  // Used cards for card selector
  const usedCards = [...heroCards, ...boardCards].filter(c => c);

  // Player editing
  function updatePlayer(idx, field, value) {
    setPlayers(prev => {
      const np = [...prev];
      np[idx] = { ...np[idx], [field]: value };
      return np;
    });
  }

  const activeSeatPositions = seatPositions.slice(0, playerCount);

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
      background: "#0a0f1a",
      color: "#e2e8f0",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Top Bar */}
      <div style={{
        background: "#0d1321",
        borderBottom: "1px solid #1e293b",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#22d3ee", fontWeight: 800, fontSize: 16, letterSpacing: 2 }}>POKER TABLE</span>
          <button onClick={dealHand} style={{
            background: handActive ? "#374151" : "#059669",
            color: handActive ? "#9ca3af" : "#fff",
            border: "none", borderRadius: 6, padding: "6px 14px",
            fontWeight: 700, cursor: handActive ? "default" : "pointer",
            fontSize: 12, fontFamily: "inherit",
          }} disabled={handActive}>
            Deal Hand
          </button>
          {handActive && (
            <>
              <button onClick={advanceStreet} style={{
                background: "#1e40af", color: "#93c5fd",
                border: "none", borderRadius: 6, padding: "6px 14px",
                fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: "inherit",
              }}>
                Next Street →
              </button>
              <button onClick={endHand} style={{
                background: "#7f1d1d", color: "#fca5a5",
                border: "none", borderRadius: 6, padding: "6px 14px",
                fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: "inherit",
              }}>
                End Hand
              </button>
            </>
          )}
          <button onClick={handleUndo} disabled={handHistory.length === 0} style={{
            background: handHistory.length > 0 ? "#44403c" : "#1e293b",
            color: handHistory.length > 0 ? "#fbbf24" : "#475569",
            border: "none", borderRadius: 6, padding: "6px 14px",
            fontWeight: 700, cursor: handHistory.length > 0 ? "pointer" : "default",
            fontSize: 12, fontFamily: "inherit",
          }}>
            ↩ Undo
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowSetup(!showSetup)} style={{
            background: "#1e293b", color: "#94a3b8", border: "1px solid #334155",
            borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
          }}>
            {showSetup ? "Hide" : "Show"} Setup
          </button>
          <button onClick={() => setEditingPlayers(!editingPlayers)} style={{
            background: "#1e293b", color: "#94a3b8", border: "1px solid #334155",
            borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
          }}>
            Players
          </button>
        </div>
      </div>

      {/* Setup Panel */}
      {showSetup && (
        <div style={{
          background: "#0d1321",
          borderBottom: "1px solid #1e293b",
          padding: "10px 16px",
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "flex-end",
        }}>
          <label style={labelStyle}>
            <span style={labelTextStyle}>Type</span>
            <select value={tournamentType} onChange={e => setTournamentType(e.target.value)} style={inputStyle}>
              <option value="bounty">Bounty</option>
              <option value="normal">Normal</option>
            </select>
          </label>
          <label style={labelStyle}>
            <span style={labelTextStyle}>Level</span>
            <input type="number" value={blindLevel} onChange={e => setBlindLevel(parseInt(e.target.value) || 1)} style={{ ...inputStyle, width: 50 }} />
          </label>
          <label style={labelStyle}>
            <span style={labelTextStyle}>SB</span>
            <input type="number" value={sb} onChange={e => setSb(parseInt(e.target.value) || 0)} style={{ ...inputStyle, width: 65 }} />
          </label>
          <label style={labelStyle}>
            <span style={labelTextStyle}>BB</span>
            <input type="number" value={bb} onChange={e => setBb(parseInt(e.target.value) || 0)} style={{ ...inputStyle, width: 65 }} />
          </label>
          <label style={labelStyle}>
            <span style={labelTextStyle}>Ante</span>
            <input type="number" value={ante} onChange={e => setAnte(parseInt(e.target.value) || 0)} style={{ ...inputStyle, width: 60 }} />
          </label>
          <label style={labelStyle}>
            <span style={labelTextStyle}>Seats</span>
            <select value={playerCount} onChange={e => setPlayerCount(parseInt(e.target.value))} style={inputStyle}>
              {[2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          {tournamentType === "bounty" && (
            <label style={labelStyle}>
              <span style={labelTextStyle}>Bounty (BB)</span>
              <input type="number" value={bountyBB} step="0.5" onChange={e => setBountyBB(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, width: 55 }} />
            </label>
          )}
          <label style={labelStyle}>
            <span style={labelTextStyle}>Left</span>
            <input type="number" value={playersLeft} onChange={e => setPlayersLeft(parseInt(e.target.value) || 0)} style={{ ...inputStyle, width: 60 }} />
          </label>
          <label style={labelStyle}>
            <span style={labelTextStyle}>Rank</span>
            <input type="number" value={myRank} onChange={e => setMyRank(parseInt(e.target.value) || 0)} style={{ ...inputStyle, width: 60 }} />
          </label>
          <label style={labelStyle}>
            <span style={labelTextStyle}>ITM</span>
            <input type="number" value={paidPlaces} onChange={e => setPaidPlaces(parseInt(e.target.value) || 0)} style={{ ...inputStyle, width: 55 }} />
          </label>
        </div>
      )}

      {/* Player Editor */}
      {editingPlayers && (
        <div style={{
          background: "#0d1321", borderBottom: "1px solid #1e293b",
          padding: "10px 16px", maxHeight: 200, overflowY: "auto",
        }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>
            Click a seat on the table to set dealer (BTN). Hero seat is marked with ★.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {players.slice(0, playerCount).map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 20, fontSize: 11, color: "#64748b" }}>{i + 1}</span>
                <input
                  value={p.name}
                  onChange={e => updatePlayer(i, "name", e.target.value)}
                  style={{ ...inputStyle, width: 100 }}
                  placeholder="Name"
                />
                <input
                  type="number"
                  value={p.stack}
                  step="0.1"
                  onChange={e => updatePlayer(i, "stack", parseFloat(e.target.value) || 0)}
                  style={{ ...inputStyle, width: 65 }}
                  placeholder="Stack BB"
                />
                <button onClick={() => setHeroSeat(i)} style={{
                  background: heroSeat === i ? "#059669" : "#1e293b",
                  color: heroSeat === i ? "#fff" : "#64748b",
                  border: "1px solid #334155", borderRadius: 4, padding: "2px 8px",
                  cursor: "pointer", fontSize: 11, fontFamily: "inherit",
                }}>
                  {heroSeat === i ? "★ Hero" : "Set Hero"}
                </button>
                {getPositionLabel(i) && (
                  <span style={{ fontSize: 11, color: "#94a3b8", minWidth: 40 }}>{getPositionLabel(i)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main area: Table + Sidebar */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Table */}
        <div style={{ flex: 1, position: "relative", minHeight: 420, padding: 16 }}>
          {/* Felt */}
          <div style={{
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: 380,
          }}>
            {/* Table ellipse */}
            <div style={{
              position: "absolute",
              left: "5%", right: "5%",
              top: "8%", bottom: "8%",
              background: "radial-gradient(ellipse at center, #1a4a2e 0%, #0f3320 60%, #0a2618 100%)",
              borderRadius: "50%",
              border: "3px solid #2d5a3d",
              boxShadow: "0 0 60px rgba(0,0,0,0.6), inset 0 0 40px rgba(0,0,0,0.3)",
            }}>
              {/* Pot display */}
              <div style={{
                position: "absolute",
                top: "38%", left: "50%", transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.5)",
                borderRadius: 8,
                padding: "6px 14px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>POT</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fbbf24" }}>
                  {pot.toFixed(1)} BB
                </div>
                {handActive && (
                  <div style={{ fontSize: 10, color: "#22d3ee", marginTop: 2, textTransform: "uppercase", fontWeight: 700 }}>
                    {street}
                  </div>
                )}
              </div>

              {/* Board cards */}
              <div style={{
                position: "absolute",
                top: "55%", left: "50%", transform: "translateX(-50%)",
                display: "flex", gap: 4,
              }}>
                {[0,1,2,3,4].map(i => {
                  const showCard = (street === "flop" && i < 3) ||
                                   (street === "turn" && i < 4) ||
                                   (street === "river" && i < 5) ||
                                   (street === "showdown" && i < 5);
                  if (!handActive && !boardCards[i]) return (
                    <div key={i} style={{
                      width: 40, height: 54, background: "rgba(0,0,0,0.2)",
                      borderRadius: 4, border: "1px dashed rgba(255,255,255,0.1)",
                    }} />
                  );
                  return (
                    <div key={i}>
                      {showCard || boardCards[i] ? (
                        <CardDisplay card={boardCards[i]} />
                      ) : (
                        <div style={{
                          width: 36, height: 50, background: "rgba(0,0,0,0.2)",
                          borderRadius: 4, border: "1px dashed rgba(255,255,255,0.1)",
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Player seats */}
            {activeSeatPositions.map((pos, i) => {
              const player = players[i];
              if (!player) return null;
              const isDealer = i === dealerIndex;
              const isHero = i === heroSeat;
              const isActive = handActive && currentAction === i;
              const isFolded = playerStates[i] === "folded";
              const isAllIn = playerStates[i] === "allin";
              const posLabel = getPositionLabel(i);

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (!handActive) setDealerIndex(i);
                  }}
                  style={{
                    position: "absolute",
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    cursor: handActive ? "default" : "pointer",
                    opacity: isFolded ? 0.35 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {/* Seat circle */}
                  <div style={{
                    width: 56, height: 56,
                    borderRadius: "50%",
                    background: isActive
                      ? "linear-gradient(135deg, #059669, #047857)"
                      : isHero
                        ? "linear-gradient(135deg, #1e40af, #1e3a8a)"
                        : "#1e293b",
                    border: isActive ? "3px solid #34d399"
                      : isDealer ? "3px solid #fbbf24"
                      : isHero ? "2px solid #3b82f6"
                      : "2px solid #334155",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                    boxShadow: isActive ? "0 0 16px rgba(52,211,153,0.4)" : "none",
                    position: "relative",
                  }}>
                    <div style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#e2e8f0",
                      maxWidth: 48,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {player.name}
                    </div>
                    {isDealer && (
                      <div style={{
                        position: "absolute", top: -6, right: -6,
                        background: "#fbbf24", color: "#000",
                        fontSize: 9, fontWeight: 900,
                        width: 18, height: 18, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>D</div>
                    )}
                    {isHero && (
                      <div style={{
                        position: "absolute", top: -6, left: -6,
                        background: "#3b82f6", color: "#fff",
                        fontSize: 9, fontWeight: 900,
                        width: 18, height: 18, borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>★</div>
                    )}
                  </div>
                  {/* Stack + position */}
                  <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700, marginTop: 3 }}>
                    {player.stack.toFixed(1)}BB
                  </div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>
                    {posLabel}
                    {isAllIn && <span style={{ color: "#ef4444", marginLeft: 4 }}>ALL-IN</span>}
                  </div>
                  {/* Bet amount */}
                  {handActive && betAmounts[i] > 0 && (
                    <div style={{ fontSize: 10, color: "#fb923c", marginTop: 1 }}>
                      {betAmounts[i].toFixed(1)}BB
                    </div>
                  )}
                  {/* Show hero cards under hero seat */}
                  {isHero && heroCards[0] && (
                    <div style={{ display: "flex", gap: 2, marginTop: 3, justifyContent: "center" }}>
                      <CardDisplay card={heroCards[0]} small />
                      <CardDisplay card={heroCards[1]} small />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{
          width: 280,
          background: "#0d1321",
          borderLeft: "1px solid #1e293b",
          display: "flex",
          flexDirection: "column",
          padding: 12,
          gap: 12,
          overflowY: "auto",
        }}>
          {/* Hero Cards */}
          <div style={{
            background: "#111827",
            borderRadius: 8,
            padding: 12,
            border: "1px solid #1e293b",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#22d3ee", marginBottom: 8, letterSpacing: 1 }}>
              YOUR CARDS
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <CardSelector
                label="CARD 1"
                value={heroCards[0]}
                onChange={c => setHeroCards([c, heroCards[1]])}
                usedCards={usedCards}
              />
              <CardSelector
                label="CARD 2"
                value={heroCards[1]}
                onChange={c => setHeroCards([heroCards[0], c])}
                usedCards={usedCards}
              />
            </div>
          </div>

          {/* Board Cards */}
          {handActive && street !== "preflop" && (
            <div style={{
              background: "#111827",
              borderRadius: 8,
              padding: 12,
              border: "1px solid #1e293b",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#22d3ee", marginBottom: 8, letterSpacing: 1 }}>
                BOARD
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                {[0,1,2,3,4].map(i => {
                  const needed = street === "flop" ? 3 : street === "turn" ? 4 : 5;
                  if (i >= needed) return null;
                  return (
                    <CardSelector
                      key={i}
                      label={i < 3 ? `F${i+1}` : i === 3 ? "T" : "R"}
                      value={boardCards[i]}
                      onChange={c => {
                        const nb = [...boardCards];
                        nb[i] = c;
                        setBoardCards(nb);
                      }}
                      usedCards={usedCards}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Advisor */}
          {advisorText && (
            <div style={{
              background: "#111827",
              borderRadius: 8,
              padding: 12,
              border: "1px solid #1e293b",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fbbf24", marginBottom: 6, letterSpacing: 1 }}>
                ADVISOR
              </div>
              <pre style={{
                fontSize: 11, color: "#e2e8f0", whiteSpace: "pre-wrap",
                fontFamily: "inherit", margin: 0, lineHeight: 1.5,
              }}>
                {advisorText}
              </pre>
            </div>
          )}

          {/* Action Log */}
          {actionLog.length > 0 && (
            <div style={{
              background: "#111827",
              borderRadius: 8,
              padding: 12,
              border: "1px solid #1e293b",
              flex: 1,
              overflow: "auto",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 6, letterSpacing: 1 }}>
                ACTION LOG
              </div>
              <div style={{ fontSize: 10, color: "#64748b", lineHeight: 1.6 }}>
                {actionLog.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      {handActive && currentAction !== null && (
        <div style={{
          background: "#0d1321",
          borderTop: "1px solid #1e293b",
          padding: "10px 16px",
        }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
            <strong style={{ color: currentAction === heroSeat ? "#22d3ee" : "#e2e8f0" }}>
              {getPlayerName(currentAction)}
            </strong>
            {" "}({getPositionLabel(currentAction)}) — {currentAction === heroSeat ? "YOUR ACTION" : "to act"}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {betAmounts[currentAction] >= currentBet ? (
              <button onClick={() => handleAction("check")} style={actionBtnStyle("#1e293b", "#e2e8f0", "#334155")}>
                Check
              </button>
            ) : (
              <button onClick={() => handleAction("call")} style={actionBtnStyle("#1e40af", "#93c5fd", "#1e40af")}>
                Call {(currentBet - (betAmounts[currentAction] || 0)).toFixed(1)}BB
              </button>
            )}
            <button onClick={() => {
              const amt = parseFloat(betInput);
              if (!amt || amt <= currentBet) {
                handleAction("bet", currentBet > 0 ? currentBet * 2.2 : 2.2);
              } else {
                handleAction(currentBet > 0 ? "raise" : "bet", amt);
              }
              setBetInput("");
            }} style={actionBtnStyle("#065f46", "#34d399", "#065f46")}>
              {currentBet > 0 ? "Raise" : "Bet"}
            </button>
            <input
              type="number"
              value={betInput}
              onChange={e => setBetInput(e.target.value)}
              placeholder="BB amount"
              style={{
                ...inputStyle,
                width: 80,
                height: 32,
              }}
            />
            <button onClick={() => handleAction("allin")} style={actionBtnStyle("#7c2d12", "#fb923c", "#7c2d12")}>
              All-In
            </button>
            <button onClick={() => handleAction("fold")} style={actionBtnStyle("#7f1d1d", "#f87171", "#7f1d1d")}>
              Fold
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={handleUndo} disabled={handHistory.length === 0} style={{
              ...actionBtnStyle(handHistory.length > 0 ? "#44403c" : "#1e293b", handHistory.length > 0 ? "#fbbf24" : "#475569", "#44403c"),
              opacity: handHistory.length > 0 ? 1 : 0.5,
              cursor: handHistory.length > 0 ? "pointer" : "default",
            }}>
              ↩ Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const labelTextStyle = {
  fontSize: 9,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: 1,
  fontWeight: 700,
};

const inputStyle = {
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: 4,
  padding: "4px 8px",
  color: "#e2e8f0",
  fontSize: 12,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  outline: "none",
  width: 70,
};

function actionBtnStyle(bg, color, border) {
  return {
    background: bg,
    color,
    border: `1px solid ${border}`,
    borderRadius: 6,
    padding: "8px 18px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  };
}
