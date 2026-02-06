# Mario Platformer Game

A 2D Mario-style platformer game built with PixiJS and TypeScript.

## Features

- **Classic Platformer Mechanics**: Jump, run, and collect coins
- **Enemy AI**: Goombas that patrol platforms
- **Score System**: Collect coins and defeat enemies for points
- **Lives System**: 3 lives to complete the level
- **Physics**: Gravity, jumping, and collision detection
- **Responsive Controls**: WASD or Arrow Keys to move, Space/Up/W to jump

## Controls

- **Move Left**: A or ←
- **Move Right**: D or →
- **Jump**: W, ↑, or SPACEBAR
- **Restart** (after game over): R

## How to Play

1. Navigate Mario through the level using the controls
2. Collect golden coins for points (+10 each)
3. Jump on enemies to defeat them (+100 points)
4. Avoid touching enemies from the side or you'll lose a life
5. Don't fall off the bottom of the screen!

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

## Build

```bash
npm run build
```

## Game Elements

- **Mario**: The main character (custom graphics, 3D model coming soon!)
- **Platforms**: Green floating platforms and brown ground
- **Coins**: Collectible rotating golden coins
- **Enemies**: Brown Goomba-like enemies that patrol

## Notes

A 3D Mario character model is being generated and will be integrated into the game once ready. The current version uses custom 2D graphics drawn with PixiJS.

Enjoy playing!
