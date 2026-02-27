# DestinyCards - 3-Card Poker / Teen Patti Game

## Game Concept

A real-time multiplayer browser-based **3-Card Poker (Teen Patti)** game. Players compete in rounds, betting chips based on their hand strength. Supports 2-8 players per room with AI bot opponents.

---

## Hand Rankings (Highest to Lowest)

| Rank | Name | Description |
|------|------|-------------|
| 1 | **Two-Three-Five** | Cards 2, 3, 5 (special hand, beats everything) |
| 2 | **Trail** | Three of a kind |
| 3 | **Pure Sequence** | Straight flush (consecutive cards, same suit) |
| 4 | **Sequence** | Straight (consecutive cards, any suit) |
| 5 | **Color** | Flush (all same suit) |
| 6 | **Pair** | Two cards of same rank |
| 7 | **High Card** | Baccarat-style mod-10 value |

**Card Values:** A=14, K=13, Q=12, J=11, 2-10=face value
**Special Sequences:** A-2-3 (Ace low) and Q-K-A are valid

---

## Player Statuses

- `waiting` - Game hasn't started
- `blind` - Has not seen their cards
- `seen` - Has looked at their cards
- `folded` - Out of the current round
- `eliminated` - Out of the game (0 chips)

## Game Phases

- `waiting` - Lobby/room setup
- `playing` - Active betting round
- `show-pending` - One player challenged another to show
- `show-all-pending` - All players must approve to show
- `round-end` - Results displayed

---

## Turn Actions

| Action | Cost (Blind) | Cost (Seen) | Description |
|--------|-------------|-------------|-------------|
| **See Cards** | Free | N/A | Reveal your own cards |
| **Bet** | 1x stake | 2x stake | Bet the current stake |
| **Raise** | Doubles stake | Doubles stake | Double the current stake |
| **Fold** | Free | Free | Forfeit the round |
| **Show Request** | 1x stake | 1x stake | Challenge a seen player to reveal (1v1 comparison, requester loses on tie) |
| **Show All** | Free | Free | Request all alive players to show (requires unanimous approval) |

---

## Special Mechanics

### All-In
When a player bets all remaining chips. Triggers side pot calculation.

### Side Pots
When multiple players go all-in at different amounts, separate pots are created so each player only competes for what they can cover.

### Show / Showdown System
- **Show Request:** 1v1 hand comparison. Loser folds. On tie, the requester loses.
- **Show All:** Requires all alive players to approve. Reveals all hands simultaneously and determines the winner.

### Dealer Rotation
Dealer position rotates each round. First turn goes to the player after the dealer.

---

## Room Configuration

- **Players:** 2-8 per room
- **Bots:** 0-7 AI opponents
- **Initial Chips:** Configurable starting amount
- **Initial Stake:** Configurable minimum bet
- **Visibility:** Public (browsable) or Private rooms
- **Host:** Room creator controls game start, transfers on disconnect

---

## Bot AI Behavior

Bots evaluate hand strength into tiers:
- **Premium** (Trail, Pure Sequence) - Aggressive betting/raising
- **Strong** (Sequence, Color) - Confident betting
- **Medium** (Pair) - Moderate play
- **Weak** (High Card) - Conservative, may fold

Context-aware decisions:
- Different behavior when blind vs. seen
- Responds to all-in pressure
- Tactical show request usage
- Staggered action delays (1.5s) for realistic feel
- Auto-responds to show/show-all requests

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Animations | GSAP (GreenSock) |
| Particles/Effects | canvas-confetti |
| Audio | Howler.js |
| Backend | Node.js, Express (via Next.js custom server) |
| Real-time | Socket.IO |
| Unit Tests | Vitest |
| E2E Tests | Playwright |

---

## Architecture

```
src/                          # Frontend
├── app/                      # Next.js pages
│   ├── page.tsx              # Home/lobby
│   ├── lobby/                # Room browser
│   └── room/[roomId]/        # Game table
├── components/
│   ├── game/                 # Table, seats, cards, action panel
│   ├── lobby/                # Room creation/joining
│   ├── history/              # Round history
│   └── ui/                   # Buttons, modals, etc.
├── hooks/                    # useSocket, useGameState, useLobby
├── stores/                   # Zustand game store
└── lib/                      # Types, card utils, socket client, sounds

server/                       # Backend
├── game/
│   ├── engine.ts             # GameEngine (turn/action logic)
│   ├── hand-evaluator.ts     # Hand ranking & comparison
│   ├── deck.ts               # Deck creation & dealing
│   ├── validators.ts         # Action validation
│   ├── bot-ai.ts             # AI decision logic
│   ├── bot-manager.ts        # Bot turn scheduling
│   └── round-end.ts          # Round completion
├── socket/
│   ├── index.ts              # Socket.IO setup
│   └── handlers/
│       ├── lobby.handler.ts  # Room CRUD
│       └── game.handler.ts   # Game actions
├── state/
│   ├── room-manager.ts       # Room state management
│   ├── history-store.ts      # Round history
│   └── types.ts              # Server types
└── utils/                    # Constants, ID generation
```

---

## Socket Events

### Client -> Server
- `room:create`, `room:join`, `room:leave`, `room:reconnect`
- `lobby:list`
- `game:start`, `game:bet`, `game:raise`, `game:fold`, `game:see`
- `game:show-request`, `game:show-respond`
- `game:show-all-request`, `game:show-all-respond`
- `game:next-round`

### Server -> Client (Broadcasts)
- `game:state` - Full game state sync
- `game:action` - Player action notification
- `game:round-end` - Round results
- `room:state` - Room updates

---

## UI Features

- 3D perspective poker table with felt texture
- Animated card flip effects
- Player seats with chip counts and status indicators
- Context-aware action buttons
- Pot and stake visualization
- Game action log
- Round summary with winner and chip changes
- Sound effects and haptic feedback
- Responsive design (mobile + desktop)
- Bot player visual indicators
