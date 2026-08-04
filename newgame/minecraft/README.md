# Minecraft Web Game

A browser-based Minecraft-style game built with Three.js featuring block building, terrain generation, and first-person controls.

## Features

### Core Minecraft Mechanics
- **3D Voxel World**: Block-based terrain with multiple block types
- **First-Person View**: Immersive camera controls
- **Block Breaking**: Mine blocks with left click (blocks drop and are collected)
- **Block Placing**: Place blocks with right click
- **Terrain Generation**: Procedurally generated landscapes with hills
- **Trees**: Randomly generated trees across the world
- **Inventory System**: 9-slot hotbar with item counts + 27-slot inventory
- **Crafting System**: Full crafting interface with recipes
- **Tools**: Craft swords for faster mining
- **Hidden Coins**: Collect gold coins hidden throughout the world! 💰
- **Coin Economy**: Start with 50 coins, earn more by finding treasures
- **Shop System**: Buy blocks, materials, and tools with coins (Press Q)
- **Living Animals**: 20 wandering animals - sheep, cows, pigs, chickens! 🐑🐄🐷🐔
- **Animal Interactions**: Click animals to feed them and earn coins!
- **Flying Mode**: Toggle creative-style flight with F key - no falling!

### Block Types
1. **Grass** - Green top with dirt sides
2. **Dirt** - Brown earth block
3. **Stone** - Gray stone block
4. **Wood** - Tree trunk material
5. **Leaves** - Tree foliage
6. **Planks** - Wooden planks (craftable)
7. **Fence** - Brown wooden fence (keeps animals in!)

### Tools & Items

#### Basic Materials
1. **Planks** - Crafted from 1 wood block (makes 4 planks)
2. **Stick** - Crafted from 2 wood blocks (makes 4 sticks)

#### Food Items
1. **Fried Chicken Wings** 🍗 - Obtained by clicking on chickens (2-3 per chicken)

#### Wooden Tools
3. **Wooden Sword** - Planks + Stick
4. **Wooden Pickaxe** - 3 Planks + 2 Sticks
5. **Wooden Axe** - 3 Planks + 2 Sticks
6. **Wooden Shovel** - 1 Plank + 1 Stick

#### Stone Tools
7. **Stone Sword** - Stone + Stick
8. **Stone Pickaxe** - 3 Stone + 2 Sticks
9. **Stone Axe** - 3 Stone + 2 Sticks
10. **Stone Shovel** - Stone + Stick

**Tool Features:**
- All tools provide faster mining speed
- Stone tools are better than wooden tools
- Tools cannot be placed as blocks
- Pickaxes are best for stone
- Axes are best for wood
- Shovels are best for dirt/grass

### Hidden Treasures & Economy
- **Starting Coins**: You begin with 150 coins! 💰
- **Gold Coin Blocks** (💰): Hidden throughout the world
  - Many visible on the surface - easy to spot!
  - Some buried shallow in dirt near the surface
  - A few hidden just below ground in stone
  - Approximately 200+ gold blocks in the 64×64 world
  - Glowing gold blocks that stand out
  - Each gold block gives you **+20 coins** when collected!
  - Track found treasures and balance in top-left corner

### Animals & Wildlife 🐑🐄🐷🐔
- **4 Realistic Animal Types**: 
  - 🐑 **Sheep** - White fluffy body with dark legs and head
  - 🐄 **Cows** - Brown with white spots, horns, and detailed legs
  - 🐷 **Pigs** - Pink with snout and proper proportions
  - 🐔 **Chickens** - White with red comb, yellow beak and legs, tail feathers
- **Detailed Models**: Each animal has body, head, legs, and unique features
- **20 Animals** roaming the world at all times
- **Smart AI**: Animals wander randomly, occasionally jump, and stay within bounds
- **Interactive**: Left-click animals to interact with them!
  - 🐔 **Chickens**: Get **2-3 Fried Chicken Wings** 🍗 (collectible food item!)
  - 🐑🐄🐷 **Other Animals**: Earn **5-10 coins** per interaction
  - Animal respawns elsewhere after interaction
  - Passive and friendly - they won't hurt you
- **Always Active**: Animals move even when menus are open

### Animal Pens 🚧
- **Fence Blocks**: Special blocks to contain animals
- **Collision Detection**: Animals can't walk through fences!
- **Build Enclosures**: Create pens to keep animals together
- **Taller Design**: Fences are 1.5 blocks tall with posts and rails
- **Craft or Buy**: Make fences from sticks + planks, or buy from shop
- Perfect for organizing your farm!

### Shop System 🏪
Press **Q** to open the shop and spend your coins!

**Blocks:**
- Stone - 3 coins
- Wood - 4 coins
- Planks - 5 coins
- Fence - 6 coins (keeps animals in!)

**Materials:**
- Stick - 2 coins

**Wooden Tools:**
- Wooden Shovel - 8 coins
- Wooden Sword - 10 coins
- Wooden Pickaxe - 12 coins
- Wooden Axe - 12 coins

**Stone Tools:**
- Stone Shovel - 18 coins
- Stone Sword - 20 coins
- Stone Pickaxe - 25 coins
- Stone Axe - 25 coins

### Controls
- **W/A/S/D** - Move forward/left/backward/right
- **SPACE** - Jump (or fly up in flying mode)
- **SHIFT** - Fly down (when in flying mode)
- **F** - Toggle flying mode (no fall damage, fly freely!)
- **Mouse** - Look around (requires pointer lock)
- **Left Click** - Break/mine block OR feed animals (earn coins!)
- **Right Click** - Place block
- **1-9** - Select hotbar slot
- **E** - Open/close crafting menu
- **Q** - Open/close shop (buy items with coins!)
- **ESC** - Release mouse pointer

### Crafting
1. Press **E** to open the crafting menu
2. Click a crafting grid slot and select items from your hotbar
3. Arrange items according to recipes (shown in the menu)
4. Click the **Craft** button to create the item
5. Crafted items appear in your inventory/hotbar

#### Recipes

**Basic Materials:**
- **Planks** (x4): 1 Wood block (bottom-left slot)
- **Sticks** (x4): 2 Wood blocks stacked vertically (middle column)
- **Fence** (x3): Stick + Plank + Stick (two rows)

**Wooden Tools:**
- **Wooden Sword**: 1 Plank + 1 Stick (vertical)
- **Wooden Pickaxe**: 3 Planks (top row) + 2 Sticks (middle column)
- **Wooden Axe**: 3 Planks (L-shape top-left) + 2 Sticks (middle column)
- **Wooden Shovel**: 1 Plank + 1 Stick (vertical, middle column)

**Stone Tools:**
- **Stone Sword**: 1 Stone + 1 Stick (vertical)
- **Stone Pickaxe**: 3 Stone (top row) + 2 Sticks (middle column)
- **Stone Axe**: 3 Stone (L-shape top-left) + 2 Sticks (middle column)
- **Stone Shovel**: 1 Stone + 1 Stick (vertical, middle column)

**Tip:** All recipes are shown in the crafting menu!

## How to Play

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. Click anywhere on the loading screen to start
3. Your mouse will be captured for camera controls
4. Explore, mine, build, and find all the hidden coins!

## Technical Details

### Technologies Used
- **Three.js** (r128) - 3D graphics library
- **Vanilla JavaScript** - Game logic
- **HTML5/CSS3** - UI and styling

### Game Mechanics
- **World Size**: 32x32 blocks horizontally
- **Render Distance**: Fog at 100 blocks
- **Physics**: Gravity and collision detection
- **Lighting**: Ambient + directional lighting with shadows
- **Reach Distance**: 5 blocks for mining/placing

## File Structure
```
minecraft/
├── index.html      # Main HTML structure
├── style.css       # Styling and UI
├── game.js         # Game logic and Three.js implementation
└── README.md       # This file
```

## Future Enhancements
- More block types (sand, water, ores, etc.)
- More tools (pickaxe, axe, shovel)
- Armor and combat
- Multiplayer support
- Save/load world
- Mobs and entities
- Day/night cycle
- Better terrain generation with biomes
- Sound effects and music
- Durability system for tools
- More crafting recipes

## Browser Compatibility
Works best in modern browsers with WebGL support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Notes
The game renders all blocks in view. For better performance on slower devices:
- Reduce WORLD_SIZE in game.js
- Decrease render distance
- Disable shadows in renderer settings

Enjoy building! 🎮

