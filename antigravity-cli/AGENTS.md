# toon-memory

Persistent memory for this project. Use it to avoid re-investigating things.

## At the START of every session
1. Run memory_stats to see what's in memory.
2. If the user asks something that might be in memory, run memory_recall BEFORE reading files.

## When making decisions
- Before implementing a non-trivial change: memory_remember(category='decision')
- When you resolve a complex bug: memory_remember(category='bug')
- When you observe a code pattern: memory_remember(category='pattern')

## At the END of every session
- Save important decisions, bugs resolved, and patterns observed.
