# Game Design Patterns

Shared reference for common game development patterns. Use these as architectural guidance when building game modules.

## State Machines

Games are fundamentally state machines. Define explicit phases and transitions:

```
Phase: waiting → playing → resolution → round-end → waiting
```

- Each phase has a set of valid actions
- Transitions are triggered by player actions or timers
- Invalid actions for the current phase should be rejected
- Store the current phase as an enum/union type

## Turn Systems

### Round-Robin
Players take turns in a fixed order (clockwise/counter-clockwise). Track `currentPlayerIndex` and advance after each action.

### Simultaneous
All players act at the same time (e.g., simultaneous reveal). Collect all actions, then resolve together.

### Real-Time
Players can act at any time. Use timestamps and conflict resolution.

### Dealer Rotation
A special player role (dealer/host) rotates each round, affecting turn order or game flow.

## Scoring & Economy

### Points/Currency System
- Track player resources (chips, coins, points)
- Define win/loss conditions based on resource thresholds
- Handle resource transfers between players (pots, bets, trades)

### Ranking Systems
- Define a hierarchy of outcomes (hands, scores, achievements)
- Implement comparison functions that handle all tie-breaking rules
- Consider special rankings (e.g., rare combinations worth more)

### Leaderboards
- Track historical performance across sessions
- Support multiple ranking criteria (wins, total score, win rate)

## Matchmaking & Lobbies

### Room/Session Management
- Create, join, leave, and destroy rooms
- Track room metadata: player count, capacity, status, configuration
- Public rooms visible in lobby, private rooms via invite/code

### Room Configuration
- Max players, initial resources, difficulty, game variant
- Bot/AI player count and difficulty level
- Public/private visibility

### Quick Match
- Auto-assign players to available rooms matching criteria

## Authoritative Server Pattern

The server is the single source of truth:

```
Client → sends intent (e.g., "I want to bet")
Server → validates the action
Server → updates authoritative state
Server → broadcasts new state to all clients
Client → renders the received state
```

- **Never** trust client-computed state
- **Always** validate actions server-side before applying
- Send each player a personalized view (hide private information)
- Handle out-of-turn actions by rejecting them

## Networking Patterns

### Full State Sync
Send the complete game state to all players after each action. Simple but bandwidth-heavy.

### Delta Updates
Send only the changes since the last sync. More efficient but more complex.

### Event Broadcasting
Broadcast action events (e.g., "Player A bet 50") alongside state updates for UI animations.

### Reconnection
- Store game state server-side (not just in memory if persistence needed)
- On reconnect, send the full current state
- Handle "zombie" connections with heartbeats/timeouts
- Allow rejoining mid-game with grace period

## Bot/AI Patterns

### Decision Tiers
- **Easy:** Random valid actions, no strategy
- **Medium:** Basic heuristics (e.g., bet with strong hand, fold with weak)
- **Hard:** Evaluation functions considering multiple factors (hand strength, pot odds, opponent behavior)

### Evaluation Functions
- Score the current state from the bot's perspective
- Weight multiple factors: hand strength, position, opponent behavior, risk
- Add controlled randomness to avoid predictability

### Timing
- Add artificial delays to simulate human thinking
- Vary delay based on decision complexity
- Don't act instantly — it breaks immersion

## Common Game Components

### Decks / Tiles / Pieces
- Create, shuffle, deal/draw from a collection
- Track remaining items, discard piles
- Ensure deterministic shuffling with seeds for replay

### Timers
- Turn timers with auto-action on expiry (e.g., auto-fold)
- Round timers for timed game modes
- Sync timer state between server and clients

### History / Replay
- Store round results, actions taken, outcomes
- Support viewing past rounds
- Useful for debugging and player review

### Spectator Mode
- Read-only view of the game
- Hide private information from spectators
- Real-time updates without action capability
