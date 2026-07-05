# Slice — 2D Action-Platformer

<video src="./demo.mp4" controls="controls" muted="muted" style="max-width: 100%;"></video>

A fast-paced, 2D action-platformer prototype featuring tight controls, melee combat, and custom AI logic.

## Tech Stack
* **Language:** TypeScript
* **Engine:** Phaser 3 (HTML5 Canvas)
* **Build Tool:** Vite

## Features
* **Custom Physics & Collision:** Utilizes Phaser's Arcade Physics for precise AABB collision, tuned gravity, and one-way floating platforms.
* **Entity State Machines:** Robust FSM architecture governing Player and Enemy behaviors (Idle, Patrol, Aggro, Attack, Hurt, Dead).
* **Melee Combat System:** Ephemeral collision hitboxes for frame-perfect attack overlap detection and damage calculation.
* **Dynamic UI:** Real-time HUD overlay tracking health, damage flashes, and death/respawn states.

## How to Run Locally

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Then navigate to `http://localhost:3000` to play!

## Controls
* **Move & Jump:** `Arrow Keys` or `W, A, D`
* **Attack:** `Z` or `J`
* **Respawn:** `R` (when dead)
