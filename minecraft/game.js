// Game constants
const BLOCK_SIZE = 1;
const WORLD_SIZE = 64; // Increased from 32 to 64 for bigger world
const CHUNK_HEIGHT = 16;
const GRAVITY = 20;
const JUMP_SPEED = 8;
const MOVE_SPEED = 5;
const REACH_DISTANCE = 5;

// Animal types
const AnimalType = {
    SHEEP: 'sheep',
    COW: 'cow',
    PIG: 'pig',
    CHICKEN: 'chicken'
};

const AnimalColors = {
    [AnimalType.SHEEP]: 0xf0f0f0, // White
    [AnimalType.COW]: 0x8b4513, // Brown
    [AnimalType.PIG]: 0xffc0cb, // Pink
    [AnimalType.CHICKEN]: 0xffffff // White
};

// Enemy types
const EnemyType = {
    ZOMBIE: 'zombie',
    SKELETON: 'skeleton'
};

const EnemyColors = {
    [EnemyType.ZOMBIE]: 0x2d5016, // Dark green (zombie skin)
    [EnemyType.SKELETON]: 0xe0e0e0 // Light gray (bones)
};

// Block types
const BlockType = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    COIN: 6,
    FENCE: 7
};

// Item types (includes blocks and tools)
const ItemType = {
    ...BlockType,
    WOODEN_SWORD: 100,
    STONE_SWORD: 101,
    WOODEN_PICKAXE: 102,
    STONE_PICKAXE: 103,
    WOODEN_AXE: 104,
    STONE_AXE: 105,
    WOODEN_SHOVEL: 106,
    STONE_SHOVEL: 107,
    WOODEN_SHIELD: 108,
    STONE_SHIELD: 109,
    STICK: 110,
    PLANKS: 111,
    COIN_ITEM: 112,
    FRIED_CHICKEN_WING: 113,
    FENCE: 7  // Same as BlockType.FENCE
};

const BlockColors = {
    [BlockType.GRASS]: { top: 0x7cbd3a, side: 0x8b6942, bottom: 0x654321 },
    [BlockType.DIRT]: 0x8b6942,
    [BlockType.STONE]: 0x808080,
    [BlockType.WOOD]: 0x8b6942,
    [BlockType.LEAVES]: 0x228b22,
    [BlockType.COIN]: 0xffd700, // Gold color for coins
    [BlockType.FENCE]: 0x8b6942, // Brown fence
    [ItemType.PLANKS]: 0xc19a6b,
    [ItemType.FRIED_CHICKEN_WING]: 0xd2691e // Golden brown fried color
};

// Crafting recipes
const Recipes = [
    // Basic materials
    {
        pattern: [
            [ItemType.AIR, ItemType.AIR, ItemType.AIR],
            [ItemType.AIR, ItemType.WOOD, ItemType.AIR],
            [ItemType.AIR, ItemType.WOOD, ItemType.AIR]
        ],
        result: ItemType.STICK,
        count: 4
    },
    {
        pattern: [
            [ItemType.AIR, ItemType.AIR, ItemType.AIR],
            [ItemType.AIR, ItemType.AIR, ItemType.AIR],
            [ItemType.WOOD, ItemType.AIR, ItemType.AIR]
        ],
        result: ItemType.PLANKS,
        count: 4
    },
    // Wooden tools
    {
        pattern: [
            [ItemType.AIR, ItemType.AIR, ItemType.AIR],
            [ItemType.PLANKS, ItemType.AIR, ItemType.AIR],
            [ItemType.STICK, ItemType.AIR, ItemType.AIR]
        ],
        result: ItemType.WOODEN_SWORD
    },
    {
        pattern: [
            [ItemType.PLANKS, ItemType.PLANKS, ItemType.PLANKS],
            [ItemType.AIR, ItemType.STICK, ItemType.AIR],
            [ItemType.AIR, ItemType.STICK, ItemType.AIR]
        ],
        result: ItemType.WOODEN_PICKAXE
    },
    {
        pattern: [
            [ItemType.PLANKS, ItemType.PLANKS, ItemType.AIR],
            [ItemType.PLANKS, ItemType.STICK, ItemType.AIR],
            [ItemType.AIR, ItemType.STICK, ItemType.AIR]
        ],
        result: ItemType.WOODEN_AXE
    },
    {
        pattern: [
            [ItemType.AIR, ItemType.AIR, ItemType.AIR],
            [ItemType.AIR, ItemType.PLANKS, ItemType.AIR],
            [ItemType.AIR, ItemType.STICK, ItemType.AIR]
        ],
        result: ItemType.WOODEN_SHOVEL
    },
    // Fence
    {
        pattern: [
            [ItemType.AIR, ItemType.AIR, ItemType.AIR],
            [ItemType.STICK, ItemType.PLANKS, ItemType.STICK],
            [ItemType.STICK, ItemType.PLANKS, ItemType.STICK]
        ],
        result: ItemType.FENCE,
        count: 3
    },
    // Shields
    {
        pattern: [
            [ItemType.AIR, ItemType.AIR, ItemType.AIR],
            [ItemType.PLANKS, ItemType.PLANKS, ItemType.PLANKS],
            [ItemType.AIR, ItemType.PLANKS, ItemType.AIR]
        ],
        result: ItemType.WOODEN_SHIELD
    },
    {
        pattern: [
            [ItemType.AIR, ItemType.AIR, ItemType.AIR],
            [ItemType.STONE, ItemType.STONE, ItemType.STONE],
            [ItemType.AIR, ItemType.STONE, ItemType.AIR]
        ],
        result: ItemType.STONE_SHIELD
    },
    // Stone tools
    {
        pattern: [
            [ItemType.AIR, ItemType.AIR, ItemType.AIR],
            [ItemType.STONE, ItemType.AIR, ItemType.AIR],
            [ItemType.STICK, ItemType.AIR, ItemType.AIR]
        ],
        result: ItemType.STONE_SWORD
    },
    {
        pattern: [
            [ItemType.STONE, ItemType.STONE, ItemType.STONE],
            [ItemType.AIR, ItemType.STICK, ItemType.AIR],
            [ItemType.AIR, ItemType.STICK, ItemType.AIR]
        ],
        result: ItemType.STONE_PICKAXE
    },
    {
        pattern: [
            [ItemType.STONE, ItemType.STONE, ItemType.AIR],
            [ItemType.STONE, ItemType.STICK, ItemType.AIR],
            [ItemType.AIR, ItemType.STICK, ItemType.AIR]
        ],
        result: ItemType.STONE_AXE
    },
    {
        pattern: [
            [ItemType.AIR, ItemType.AIR, ItemType.AIR],
            [ItemType.AIR, ItemType.STONE, ItemType.AIR],
            [ItemType.AIR, ItemType.STICK, ItemType.AIR]
        ],
        result: ItemType.STONE_SHOVEL
    }
];

// Game state
class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.clock = new THREE.Clock();
        
        this.world = {};
        this.blocks = new Map();
        this.animals = [];
        this.enemies = [];
        this.player = {
            position: new THREE.Vector3(WORLD_SIZE / 2, CHUNK_HEIGHT + 5, WORLD_SIZE / 2),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0, 'YXZ'),
            onGround: false,
            health: 100,
            maxHealth: 100,
            healthRegenTimer: 0
        };
        
        // Inventory system
        this.inventory = Array(27).fill(null).map(() => ({ type: ItemType.AIR, count: 0 }));
        this.hotbar = [
            { type: ItemType.GRASS, count: Infinity },
            { type: ItemType.DIRT, count: Infinity },
            { type: ItemType.STONE, count: Infinity },
            { type: ItemType.WOOD, count: Infinity },
            { type: ItemType.LEAVES, count: Infinity },
            { type: ItemType.AIR, count: 0 },
            { type: ItemType.AIR, count: 0 },
            { type: ItemType.AIR, count: 0 },
            { type: ItemType.AIR, count: 0 }
        ];
        this.selectedSlot = 0;
        
        // Crafting state
        this.craftingGrid = Array(9).fill(null).map(() => ({ type: ItemType.AIR, count: 0 }));
        this.craftingMenuOpen = false;
        
        // Coin collection
        this.coinsCollected = 0;
        this.totalCoins = 0;
        this.coinBalance = 150; // Start with 150 coins!
        
        // Flying mode
        this.isFlying = false;
        
        // Shop state
        this.shopMenuOpen = false;
        
        this.keys = {};
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isPointerLocked = false;
        
        // Performance tracking
        this.worldGenComplete = false;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsDisplay = 60;
        this.fpsUpdateTimer = 0;
        this.uiUpdateTimer = 0;
        
        this.init();
    }
    
    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        this.renderer.shadowMap.enabled = false;
        document.body.appendChild(this.renderer.domElement);
        
        // Setup scene
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 0, 150); // Increased fog distance for bigger world
        
        // Setup camera
        this.camera.position.copy(this.player.position);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(50, 100, 50);
        this.scene.add(directionalLight);
        
        // Initialize material cache for performance
        this.initMaterialCache();
        
        // Generate world
        this.generateWorld();
        
        // Spawn animals
        this.spawnAnimals();
        
        // Spawn enemies
        this.spawnEnemies();
        
        // Setup controls
        this.setupControls();
        
        // Update UI
        this.updateHotbarUI();
        this.updateInventoryUI();
        
        // Start game loop
        this.animate();
    }
    
    generateWorld() {
        this.worldGenComplete = false;
        for (let x = 0; x < WORLD_SIZE; x++) {
            for (let z = 0; z < WORLD_SIZE; z++) {
                // Simple terrain generation
                const height = Math.floor(
                    CHUNK_HEIGHT + 
                    Math.sin(x * 0.1) * 3 + 
                    Math.cos(z * 0.1) * 3 +
                    Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2
                );
                
                for (let y = 0; y < height; y++) {
                    let blockType;
                    if (y === height - 1) {
                        blockType = BlockType.GRASS;
                    } else if (y > height - 4) {
                        blockType = BlockType.DIRT;
                    } else {
                        blockType = BlockType.STONE;
                    }
                    this.setBlock(x, y, z, blockType);
                }
                
                // Add occasional trees
                if (Math.random() > 0.98 && height === CHUNK_HEIGHT) {
                    this.generateTree(x, height, z);
                }
            }
        }
        
        // Hide coins in the world
        this.generateCoins();
        
        // Build meshes only for visible (exposed) blocks
        this.worldGenComplete = true;
        this.buildVisibleMeshes();
    }
    
    initMaterialCache() {
        this.sharedGeometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        this.fencePostGeo = new THREE.BoxGeometry(0.15, 1.5, 0.15);
        this.fenceRailGeo = new THREE.BoxGeometry(0.8, 0.1, 0.1);
        
        this.cachedMaterials = {};
        this.cachedMaterials[BlockType.GRASS] = [
            new THREE.MeshLambertMaterial({ color: BlockColors[BlockType.GRASS].side }),
            new THREE.MeshLambertMaterial({ color: BlockColors[BlockType.GRASS].side }),
            new THREE.MeshLambertMaterial({ color: BlockColors[BlockType.GRASS].top }),
            new THREE.MeshLambertMaterial({ color: BlockColors[BlockType.GRASS].bottom }),
            new THREE.MeshLambertMaterial({ color: BlockColors[BlockType.GRASS].side }),
            new THREE.MeshLambertMaterial({ color: BlockColors[BlockType.GRASS].side }),
        ];
        this.cachedMaterials[BlockType.DIRT] = new THREE.MeshLambertMaterial({ color: BlockColors[BlockType.DIRT] });
        this.cachedMaterials[BlockType.STONE] = new THREE.MeshLambertMaterial({ color: BlockColors[BlockType.STONE] });
        this.cachedMaterials[BlockType.WOOD] = new THREE.MeshLambertMaterial({ color: BlockColors[BlockType.WOOD] });
        this.cachedMaterials[BlockType.LEAVES] = new THREE.MeshLambertMaterial({ color: BlockColors[BlockType.LEAVES] });
        this.cachedMaterials[BlockType.COIN] = new THREE.MeshLambertMaterial({ 
            color: BlockColors[BlockType.COIN],
            emissive: 0xffaa00,
            emissiveIntensity: 0.3
        });
        this.cachedMaterials[BlockType.FENCE] = new THREE.MeshLambertMaterial({ color: BlockColors[BlockType.FENCE] });
        this.cachedMaterials[ItemType.PLANKS] = new THREE.MeshLambertMaterial({ color: BlockColors[ItemType.PLANKS] });
    }
    
    isBlockExposed(x, y, z) {
        return (
            this.getBlock(x + 1, y, z) === BlockType.AIR ||
            this.getBlock(x - 1, y, z) === BlockType.AIR ||
            this.getBlock(x, y + 1, z) === BlockType.AIR ||
            this.getBlock(x, y - 1, z) === BlockType.AIR ||
            this.getBlock(x, y, z + 1) === BlockType.AIR ||
            this.getBlock(x, y, z - 1) === BlockType.AIR
        );
    }
    
    updateBlockMesh(x, y, z) {
        const key = `${x},${y},${z}`;
        const type = this.world[key];
        if (!type || type === BlockType.AIR) return;
        
        const exposed = this.isBlockExposed(x, y, z);
        const existingMesh = this.blocks.get(key);
        
        if (exposed && !existingMesh) {
            const mesh = this.createBlockMesh(type);
            mesh.position.set(x, y, z);
            mesh.userData = { x, y, z, type };
            this.scene.add(mesh);
            this.blocks.set(key, mesh);
        } else if (!exposed && existingMesh) {
            this.scene.remove(existingMesh);
            this.blocks.delete(key);
        }
    }
    
    updateNeighborVisibility(x, y, z) {
        const neighbors = [
            [x + 1, y, z], [x - 1, y, z],
            [x, y + 1, z], [x, y - 1, z],
            [x, y, z + 1], [x, y, z - 1]
        ];
        for (const [nx, ny, nz] of neighbors) {
            if (this.world[`${nx},${ny},${nz}`]) {
                this.updateBlockMesh(nx, ny, nz);
            }
        }
    }
    
    buildVisibleMeshes() {
        for (const key in this.world) {
            const [x, y, z] = key.split(',').map(Number);
            if (this.isBlockExposed(x, y, z)) {
                const type = this.world[key];
                const mesh = this.createBlockMesh(type);
                mesh.position.set(x, y, z);
                mesh.userData = { x, y, z, type };
                this.scene.add(mesh);
                this.blocks.set(key, mesh);
            }
        }
    }
    
    spawnAnimals() {
        const animalTypes = [AnimalType.SHEEP, AnimalType.COW, AnimalType.PIG, AnimalType.CHICKEN];
        const numAnimals = 20; // Spawn 20 animals
        
        for (let i = 0; i < numAnimals; i++) {
            const type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
            const x = Math.random() * WORLD_SIZE;
            const z = Math.random() * WORLD_SIZE;
            const y = this.findSurfaceHeight(Math.floor(x), Math.floor(z)) + 2;
            
            const animal = this.createAnimal(type, x, y, z);
            this.animals.push(animal);
            this.scene.add(animal.mesh);
        }
    }
    
    createAnimal(type, x, y, z) {
        const group = new THREE.Group();
        
        if (type === AnimalType.SHEEP) {
            // Sheep - white fluffy body with legs and head
            // Body
            const bodyGeo = new THREE.BoxGeometry(0.8, 0.6, 1.0);
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.3;
            body.castShadow = true;
            group.add(body);
            
            // Head
            const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const head = new THREE.Mesh(headGeo, bodyMat);
            head.position.set(0, 0.4, 0.7);
            head.castShadow = true;
            group.add(head);
            
            // Legs (4)
            const legGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
            const legMat = new THREE.MeshLambertMaterial({ color: 0x2f2f2f });
            const positions = [[-0.3, -0.25, 0.4], [0.3, -0.25, 0.4], [-0.3, -0.25, -0.4], [0.3, -0.25, -0.4]];
            positions.forEach(pos => {
                const leg = new THREE.Mesh(legGeo, legMat);
                leg.position.set(...pos);
                leg.castShadow = true;
                group.add(leg);
            });
            
        } else if (type === AnimalType.COW) {
            // Cow - brown and white body with legs and head
            // Body
            const bodyGeo = new THREE.BoxGeometry(0.9, 0.7, 1.2);
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.35;
            body.castShadow = true;
            group.add(body);
            
            // White spots
            const spotGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
            const spotMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
            const spot1 = new THREE.Mesh(spotGeo, spotMat);
            spot1.position.set(0.2, 0.5, 0.3);
            group.add(spot1);
            const spot2 = new THREE.Mesh(spotGeo, spotMat);
            spot2.position.set(-0.25, 0.4, -0.2);
            group.add(spot2);
            
            // Head
            const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
            const head = new THREE.Mesh(headGeo, bodyMat);
            head.position.set(0, 0.5, 0.8);
            head.castShadow = true;
            group.add(head);
            
            // Horns
            const hornGeo = new THREE.BoxGeometry(0.15, 0.3, 0.15);
            const hornMat = new THREE.MeshLambertMaterial({ color: 0xd3d3d3 });
            const horn1 = new THREE.Mesh(hornGeo, hornMat);
            horn1.position.set(-0.2, 0.8, 0.8);
            group.add(horn1);
            const horn2 = new THREE.Mesh(hornGeo, hornMat);
            horn2.position.set(0.2, 0.8, 0.8);
            group.add(horn2);
            
            // Legs (4)
            const legGeo = new THREE.BoxGeometry(0.25, 0.6, 0.25);
            const legMat = new THREE.MeshLambertMaterial({ color: 0x654321 });
            const positions = [[-0.3, -0.3, 0.5], [0.3, -0.3, 0.5], [-0.3, -0.3, -0.5], [0.3, -0.3, -0.5]];
            positions.forEach(pos => {
                const leg = new THREE.Mesh(legGeo, legMat);
                leg.position.set(...pos);
                leg.castShadow = true;
                group.add(leg);
            });
            
        } else if (type === AnimalType.PIG) {
            // Pig - pink body with snout and legs
            // Body
            const bodyGeo = new THREE.BoxGeometry(0.8, 0.6, 0.9);
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffb6c1 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.3;
            body.castShadow = true;
            group.add(body);
            
            // Head
            const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const head = new THREE.Mesh(headGeo, bodyMat);
            head.position.set(0, 0.35, 0.65);
            head.castShadow = true;
            group.add(head);
            
            // Snout
            const snoutGeo = new THREE.BoxGeometry(0.3, 0.25, 0.2);
            const snoutMat = new THREE.MeshLambertMaterial({ color: 0xff99aa });
            const snout = new THREE.Mesh(snoutGeo, snoutMat);
            snout.position.set(0, 0.35, 0.95);
            group.add(snout);
            
            // Legs (4)
            const legGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
            const legMat = new THREE.MeshLambertMaterial({ color: 0xff99aa });
            const positions = [[-0.3, -0.25, 0.3], [0.3, -0.25, 0.3], [-0.3, -0.25, -0.3], [0.3, -0.25, -0.3]];
            positions.forEach(pos => {
                const leg = new THREE.Mesh(legGeo, legMat);
                leg.position.set(...pos);
                leg.castShadow = true;
                group.add(leg);
            });
            
        } else if (type === AnimalType.CHICKEN) {
            // Chicken - white body with red comb and small size
            // Body
            const bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 0.6);
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.25;
            body.castShadow = true;
            group.add(body);
            
            // Head
            const headGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
            const head = new THREE.Mesh(headGeo, bodyMat);
            head.position.set(0, 0.45, 0.4);
            head.castShadow = true;
            group.add(head);
            
            // Comb (red)
            const combGeo = new THREE.BoxGeometry(0.15, 0.25, 0.15);
            const combMat = new THREE.MeshLambertMaterial({ color: 0xff0000 });
            const comb = new THREE.Mesh(combGeo, combMat);
            comb.position.set(0, 0.7, 0.4);
            group.add(comb);
            
            // Beak (yellow)
            const beakGeo = new THREE.BoxGeometry(0.15, 0.1, 0.2);
            const beakMat = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
            const beak = new THREE.Mesh(beakGeo, beakMat);
            beak.position.set(0, 0.45, 0.6);
            group.add(beak);
            
            // Legs (2)
            const legGeo = new THREE.BoxGeometry(0.12, 0.4, 0.12);
            const legMat = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
            const leg1 = new THREE.Mesh(legGeo, legMat);
            leg1.position.set(-0.15, -0.2, 0.1);
            leg1.castShadow = true;
            group.add(leg1);
            const leg2 = new THREE.Mesh(legGeo, legMat);
            leg2.position.set(0.15, -0.2, 0.1);
            leg2.castShadow = true;
            group.add(leg2);
            
            // Tail feathers
            const tailGeo = new THREE.BoxGeometry(0.3, 0.4, 0.1);
            const tailMat = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
            const tail = new THREE.Mesh(tailGeo, tailMat);
            tail.position.set(0, 0.4, -0.35);
            tail.rotation.x = -0.3;
            group.add(tail);
        }
        
        group.position.set(x, y, z);
        
        return {
            type: type,
            mesh: group,
            velocity: new THREE.Vector3(0, 0, 0),
            moveTimer: 0,
            moveDirection: new THREE.Vector3(0, 0, 0),
            health: 100
        };
    }
    
    spawnEnemies() {
        const enemyTypes = [EnemyType.ZOMBIE, EnemyType.SKELETON];
        const numEnemies = 15; // Spawn 15 enemies
        
        for (let i = 0; i < numEnemies; i++) {
            const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            // Spawn enemies away from player spawn point
            let x, z;
            do {
                x = Math.random() * WORLD_SIZE;
                z = Math.random() * WORLD_SIZE;
            } while (Math.abs(x - WORLD_SIZE / 2) < 10 && Math.abs(z - WORLD_SIZE / 2) < 10);
            
            const y = this.findSurfaceHeight(Math.floor(x), Math.floor(z)) + 2;
            
            const enemy = this.createEnemy(type, x, y, z);
            this.enemies.push(enemy);
            this.scene.add(enemy.mesh);
        }
    }
    
    createEnemy(type, x, y, z) {
        const group = new THREE.Group();
        
        if (type === EnemyType.ZOMBIE) {
            // Zombie - humanoid figure with green skin
            const bodyGeo = new THREE.BoxGeometry(0.6, 1.0, 0.4);
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.5;
            body.castShadow = true;
            group.add(body);
            
            // Head
            const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const head = new THREE.Mesh(headGeo, bodyMat);
            head.position.set(0, 1.25, 0);
            head.castShadow = true;
            group.add(head);
            
            // Eyes (red glowing)
            const eyeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.05);
            const eyeMat = new THREE.MeshLambertMaterial({ 
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.5
            });
            const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
            eye1.position.set(-0.15, 1.3, 0.26);
            group.add(eye1);
            const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
            eye2.position.set(0.15, 1.3, 0.26);
            group.add(eye2);
            
            // Arms
            const armGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);
            const armMat = new THREE.MeshLambertMaterial({ color: 0x243d12 });
            const leftArm = new THREE.Mesh(armGeo, armMat);
            leftArm.position.set(-0.425, 0.6, 0);
            leftArm.castShadow = true;
            group.add(leftArm);
            const rightArm = new THREE.Mesh(armGeo, armMat);
            rightArm.position.set(0.425, 0.6, 0);
            rightArm.castShadow = true;
            group.add(rightArm);
            
            // Legs
            const legGeo = new THREE.BoxGeometry(0.25, 0.8, 0.25);
            const leftLeg = new THREE.Mesh(legGeo, bodyMat);
            leftLeg.position.set(-0.15, -0.4, 0);
            leftLeg.castShadow = true;
            group.add(leftLeg);
            const rightLeg = new THREE.Mesh(legGeo, bodyMat);
            rightLeg.position.set(0.15, -0.4, 0);
            rightLeg.castShadow = true;
            group.add(rightLeg);
            
        } else if (type === EnemyType.SKELETON) {
            // Skeleton - thin humanoid with bone color
            const bodyGeo = new THREE.BoxGeometry(0.5, 0.9, 0.3);
            const bodyMat = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.y = 0.45;
            body.castShadow = true;
            group.add(body);
            
            // Head (skull)
            const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
            const head = new THREE.Mesh(headGeo, bodyMat);
            head.position.set(0, 1.15, 0);
            head.castShadow = true;
            group.add(head);
            
            // Eyes (dark sockets)
            const eyeGeo = new THREE.BoxGeometry(0.12, 0.12, 0.05);
            const eyeMat = new THREE.MeshLambertMaterial({ color: 0x000000 });
            const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
            eye1.position.set(-0.12, 1.2, 0.23);
            group.add(eye1);
            const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
            eye2.position.set(0.12, 1.2, 0.23);
            group.add(eye2);
            
            // Arms (thin)
            const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
            const leftArm = new THREE.Mesh(armGeo, bodyMat);
            leftArm.position.set(-0.35, 0.5, 0);
            leftArm.castShadow = true;
            group.add(leftArm);
            const rightArm = new THREE.Mesh(armGeo, bodyMat);
            rightArm.position.set(0.35, 0.5, 0);
            rightArm.castShadow = true;
            group.add(rightArm);
            
            // Legs (thin)
            const legGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
            const leftLeg = new THREE.Mesh(legGeo, bodyMat);
            leftLeg.position.set(-0.12, -0.35, 0);
            leftLeg.castShadow = true;
            group.add(leftLeg);
            const rightLeg = new THREE.Mesh(legGeo, bodyMat);
            rightLeg.position.set(0.12, -0.35, 0);
            rightLeg.castShadow = true;
            group.add(rightLeg);
        }
        
        group.position.set(x, y, z);
        
        return {
            type: type,
            mesh: group,
            velocity: new THREE.Vector3(0, 0, 0),
            health: 50,
            maxHealth: 50,
            damage: 10,
            attackCooldown: 0,
            isHostile: true
        };
    }
    
    updateEnemies(deltaTime) {
        this.enemies.forEach((enemy, index) => {
            // Chase player AI
            const distanceToPlayer = enemy.mesh.position.distanceTo(this.player.position);
            
            if (distanceToPlayer < 20) { // Aggro range
                // Move towards player
                const direction = new THREE.Vector3();
                direction.subVectors(this.player.position, enemy.mesh.position);
                direction.y = 0; // Don't move vertically
                direction.normalize();
                
                const speed = 2.5; // Slightly slower than player
                enemy.velocity.x = direction.x * speed;
                enemy.velocity.z = direction.z * speed;
                
                // Face player
                const angle = Math.atan2(direction.x, direction.z);
                enemy.mesh.rotation.y = angle;
                
                // Attack player if close enough
                if (distanceToPlayer < 1.5) {
                    enemy.attackCooldown -= deltaTime;
                    if (enemy.attackCooldown <= 0) {
                        // Check if player has a shield equipped
                        const currentItem = this.hotbar[this.selectedSlot];
                        let damageReduction = 0;
                        let blockedMessage = '';
                        
                        if (currentItem.type === ItemType.WOODEN_SHIELD) {
                            damageReduction = 0.5; // Block 50% damage
                            blockedMessage = ' (50% blocked by wooden shield!)';
                        } else if (currentItem.type === ItemType.STONE_SHIELD) {
                            damageReduction = 0.7; // Block 70% damage
                            blockedMessage = ' (70% blocked by stone shield!)';
                        }
                        
                        const actualDamage = Math.round(enemy.damage * (1 - damageReduction));
                        this.player.health -= actualDamage;
                        enemy.attackCooldown = 1.0; // Attack once per second
                        console.log(`${enemy.type} attacked! Damage: ${actualDamage}${blockedMessage} | Player health: ${this.player.health}`);
                        
                        if (this.player.health <= 0) {
                            this.gameOver();
                        }
                    }
                }
            } else {
                // Idle - slow random movement
                enemy.velocity.x *= 0.9;
                enemy.velocity.z *= 0.9;
            }
            
            // Apply gravity
            enemy.velocity.y -= GRAVITY * deltaTime;
            
            // Update position
            const newPos = enemy.mesh.position.clone();
            newPos.add(enemy.velocity.clone().multiplyScalar(deltaTime));
            
            // Check ground collision
            const groundY = this.findSurfaceHeight(Math.floor(newPos.x), Math.floor(newPos.z)) + 1;
            
            if (newPos.y <= groundY) {
                newPos.y = groundY;
                enemy.velocity.y = 0;
            }
            
            // Keep enemies in bounds
            if (newPos.x < 2 || newPos.x > WORLD_SIZE - 2) {
                enemy.velocity.x *= -1;
                newPos.x = Math.max(2, Math.min(WORLD_SIZE - 2, newPos.x));
            }
            if (newPos.z < 2 || newPos.z > WORLD_SIZE - 2) {
                enemy.velocity.z *= -1;
                newPos.z = Math.max(2, Math.min(WORLD_SIZE - 2, newPos.z));
            }
            
            enemy.mesh.position.copy(newPos);
        });
    }
    
    updateAnimals(deltaTime) {
        this.animals.forEach(animal => {
            // Simple wandering AI
            animal.moveTimer -= deltaTime;
            
            if (animal.moveTimer <= 0) {
                // Change direction every 2-5 seconds
                animal.moveTimer = 2 + Math.random() * 3;
                
                // Random chance to move or stop
                if (Math.random() > 0.3) {
                    animal.moveDirection.x = (Math.random() - 0.5) * 2;
                    animal.moveDirection.z = (Math.random() - 0.5) * 2;
                    animal.moveDirection.normalize();
                } else {
                    animal.moveDirection.set(0, 0, 0);
                }
            }
            
            // Apply movement
            const speed = 1.5;
            animal.velocity.x = animal.moveDirection.x * speed;
            animal.velocity.z = animal.moveDirection.z * speed;
            
            // Simple gravity
            animal.velocity.y -= GRAVITY * deltaTime;
            
            // Update position
            const newPos = animal.mesh.position.clone();
            newPos.add(animal.velocity.clone().multiplyScalar(deltaTime));
            
            // Check fence collision - animals can't pass through fences
            const checkX = Math.floor(newPos.x);
            const checkZ = Math.floor(newPos.z);
            const checkY = Math.floor(newPos.y);
            
            // Check horizontal collision with fences
            if (this.getBlock(checkX, checkY, Math.floor(animal.mesh.position.z)) === BlockType.FENCE) {
                newPos.x = animal.mesh.position.x;
                animal.moveDirection.x *= -1;
            }
            if (this.getBlock(Math.floor(animal.mesh.position.x), checkY, checkZ) === BlockType.FENCE) {
                newPos.z = animal.mesh.position.z;
                animal.moveDirection.z *= -1;
            }
            
            // Check ground collision
            const groundY = this.findSurfaceHeight(Math.floor(newPos.x), Math.floor(newPos.z)) + 1;
            
            if (newPos.y <= groundY) {
                newPos.y = groundY;
                animal.velocity.y = 0;
                
                // Random small jump
                if (Math.random() > 0.98) {
                    animal.velocity.y = 3;
                }
            }
            
            // Keep animals in bounds
            if (newPos.x < 2 || newPos.x > WORLD_SIZE - 2) {
                animal.moveDirection.x *= -1;
                newPos.x = Math.max(2, Math.min(WORLD_SIZE - 2, newPos.x));
            }
            if (newPos.z < 2 || newPos.z > WORLD_SIZE - 2) {
                animal.moveDirection.z *= -1;
                newPos.z = Math.max(2, Math.min(WORLD_SIZE - 2, newPos.z));
            }
            
            animal.mesh.position.copy(newPos);
            
            // Face movement direction
            if (animal.moveDirection.length() > 0) {
                const angle = Math.atan2(animal.moveDirection.x, animal.moveDirection.z);
                animal.mesh.rotation.y = angle;
            }
        });
    }
    
    generateCoins() {
        const numCoins = Math.floor(WORLD_SIZE * WORLD_SIZE * 0.05); // 5% of world area (more coins!)
        this.totalCoins = numCoins;
        
        for (let i = 0; i < numCoins; i++) {
            const x = Math.floor(Math.random() * WORLD_SIZE);
            const z = Math.floor(Math.random() * WORLD_SIZE);
            
            // Different hiding strategies - more visible coins!
            const strategy = Math.floor(Math.random() * 4);
            
            if (strategy === 0) {
                // Underground (buried in stone) - less deep
                const y = Math.floor(Math.random() * 5) + CHUNK_HEIGHT - 3; // Closer to surface
                if (this.getBlock(x, y, z) === BlockType.STONE) {
                    this.setBlock(x, y, z, BlockType.COIN);
                }
            } else if (strategy === 1) {
                // In dirt layers - very shallow
                const surface = this.findSurfaceHeight(x, z);
                const y = Math.max(surface - 1, 2); // Just below surface
                if (this.getBlock(x, y, z) === BlockType.DIRT) {
                    this.setBlock(x, y, z, BlockType.COIN);
                }
            } else if (strategy === 2) {
                // On surface everywhere (not just hills!)
                const surface = this.findSurfaceHeight(x, z);
                this.setBlock(x, surface, z, BlockType.COIN);
            } else {
                // On surface as well (doubled surface coins!)
                const surface = this.findSurfaceHeight(x, z);
                this.setBlock(x, surface, z, BlockType.COIN);
            }
        }
    }
    
    findSurfaceHeight(x, z) {
        for (let y = CHUNK_HEIGHT + 10; y >= 0; y--) {
            if (this.getBlock(x, y, z) !== BlockType.AIR) {
                return y;
            }
        }
        return CHUNK_HEIGHT;
    }
    
    generateTree(x, y, z) {
        // Trunk
        for (let i = 0; i < 5; i++) {
            this.setBlock(x, y + i, z, BlockType.WOOD);
        }
        
        // Leaves
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 4; dy <= 6; dy++) {
                    if (dx === 0 && dz === 0 && dy < 6) continue;
                    if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
                    this.setBlock(x + dx, y + dy, z + dz, BlockType.LEAVES);
                }
            }
        }
    }
    
    setBlock(x, y, z, type) {
        const key = `${x},${y},${z}`;
        
        if (type === BlockType.AIR) {
            const block = this.blocks.get(key);
            if (block) {
                this.scene.remove(block);
                this.blocks.delete(key);
            }
            delete this.world[key];
            if (this.worldGenComplete) {
                this.updateNeighborVisibility(x, y, z);
            }
            return;
        }
        
        this.world[key] = type;
        
        if (this.worldGenComplete) {
            this.updateBlockMesh(x, y, z);
            this.updateNeighborVisibility(x, y, z);
        }
    }
    
    getBlock(x, y, z) {
        const key = `${x},${y},${z}`;
        return this.world[key] || BlockType.AIR;
    }
    
    createBlockMesh(type) {
        if (type === BlockType.FENCE) {
            const group = new THREE.Group();
            const fenceMat = this.cachedMaterials[BlockType.FENCE];
            
            const post1 = new THREE.Mesh(this.fencePostGeo, fenceMat);
            post1.position.set(-0.3, 0.25, 0);
            group.add(post1);
            
            const post2 = new THREE.Mesh(this.fencePostGeo, fenceMat);
            post2.position.set(0.3, 0.25, 0);
            group.add(post2);
            
            const rail1 = new THREE.Mesh(this.fenceRailGeo, fenceMat);
            rail1.position.set(0, 0.6, 0);
            group.add(rail1);
            
            const rail2 = new THREE.Mesh(this.fenceRailGeo, fenceMat);
            rail2.position.set(0, 0.3, 0);
            group.add(rail2);
            
            return group;
        }
        
        const material = this.cachedMaterials[type] || this.cachedMaterials[BlockType.STONE];
        return new THREE.Mesh(this.sharedGeometry, material);
    }
    
    setupControls() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            // Prevent space from triggering focused buttons
            if (e.code === 'Space' && !this.craftingMenuOpen) {
                e.preventDefault();
            }
            
            this.keys[e.code] = true;
            
            // Number keys for hotbar selection
            if (e.code >= 'Digit1' && e.code <= 'Digit9') {
                const slot = parseInt(e.code.charAt(5)) - 1;
                this.selectHotbarSlot(slot);
            }
            
            // E key for crafting menu
            if (e.code === 'KeyE' && (this.isPointerLocked || this.craftingMenuOpen)) {
                this.toggleCraftingMenu();
            }
            
            // F key for flying mode
            if (e.code === 'KeyF' && this.isPointerLocked) {
                this.toggleFlyingMode();
            }
            
            // Q key for shop
            if (e.code === 'KeyQ' && (this.isPointerLocked || this.shopMenuOpen)) {
                this.toggleShop();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse
        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked || this.craftingMenuOpen) return;
            
            const sensitivity = 0.002;
            this.player.rotation.y -= e.movementX * sensitivity;
            this.player.rotation.x -= e.movementY * sensitivity;
            this.player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.rotation.x));
        });
        
        document.addEventListener('mousedown', (e) => {
            if (!this.isPointerLocked || this.craftingMenuOpen) return;
            
            if (e.button === 0) { // Left click - break block
                this.breakBlock();
            } else if (e.button === 2) { // Right click - place block
                this.placeBlock();
            }
        });
        
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Pointer lock
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === document.body;
            if (this.isPointerLocked) {
                loadingScreen.classList.add('hidden');
            }
        });
        
        // Hotbar clicks
        document.querySelectorAll('.hotbar-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => this.selectHotbarSlot(index));
        });
        
        // Crafting menu
        this.setupCraftingUI();
        
        // Shop menu
        this.setupShopUI();
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupCraftingUI() {
        const closeBtn = document.getElementById('close-crafting');
        closeBtn.addEventListener('click', () => this.toggleCraftingMenu());
        
        const craftBtn = document.getElementById('craft-button');
        craftBtn.addEventListener('click', () => this.craftItem());
        
        // Setup crafting grid slots
        document.querySelectorAll('.crafting-slot[data-craft-slot]').forEach((slot, index) => {
            slot.addEventListener('click', () => this.handleCraftingSlotClick(index));
        });
        
        // Setup inventory slots
        this.updateInventoryUI();
    }
    
    setupShopUI() {
        const closeBtn = document.getElementById('close-shop');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.toggleShop());
        }
        
        // Setup buy buttons
        document.querySelectorAll('.buy-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemType = parseInt(e.target.dataset.item);
                const cost = parseInt(e.target.dataset.cost);
                this.buyItem(itemType, cost);
            });
        });
    }
    
    toggleCraftingMenu() {
        this.craftingMenuOpen = !this.craftingMenuOpen;
        const menu = document.getElementById('crafting-menu');
        menu.classList.toggle('hidden', !this.craftingMenuOpen);
        
        if (this.craftingMenuOpen) {
            document.exitPointerLock();
        } else {
            // Re-lock pointer when closing menu
            document.body.requestPointerLock();
            // Remove focus from any buttons to prevent space from triggering them
            if (document.activeElement) {
                document.activeElement.blur();
            }
        }
    }
    
    handleCraftingSlotClick(slotIndex) {
        const currentItem = this.hotbar[this.selectedSlot];
        
        if (currentItem.type !== ItemType.AIR && currentItem.count > 0) {
            // Add item to crafting grid
            this.craftingGrid[slotIndex].type = currentItem.type;
            this.craftingGrid[slotIndex].count = 1;
            
            // Remove from hotbar
            if (currentItem.count !== Infinity) {
                currentItem.count--;
                if (currentItem.count === 0) {
                    currentItem.type = ItemType.AIR;
                }
            }
        } else {
            // Remove from crafting grid
            if (this.craftingGrid[slotIndex].type !== ItemType.AIR) {
                this.addToInventory(this.craftingGrid[slotIndex].type, 1);
                this.craftingGrid[slotIndex].type = ItemType.AIR;
                this.craftingGrid[slotIndex].count = 0;
            }
        }
        
        this.updateCraftingUI();
        this.updateHotbarUI();
        this.checkRecipe();
    }
    
    checkRecipe() {
        // Count items in the crafting grid
        const itemCounts = {};
        this.craftingGrid.forEach(slot => {
            if (slot.type !== ItemType.AIR) {
                itemCounts[slot.type] = (itemCounts[slot.type] || 0) + 1;
            }
        });
        
        // Check each recipe
        for (const recipe of Recipes) {
            // Count items needed in the recipe
            const recipeCounts = {};
            recipe.pattern.forEach(row => {
                row.forEach(item => {
                    if (item !== ItemType.AIR) {
                        recipeCounts[item] = (recipeCounts[item] || 0) + 1;
                    }
                });
            });
            
            // Check if the grid matches the recipe (items can be anywhere!)
            if (this.matchesRecipe(itemCounts, recipeCounts)) {
                this.showCraftResult(recipe.result);
                return;
            }
        }
        
        // No match
        this.showCraftResult(null);
    }
    
    matchesRecipe(gridCounts, recipeCounts) {
        // Check if grid has exactly the items needed
        const gridKeys = Object.keys(gridCounts);
        const recipeKeys = Object.keys(recipeCounts);
        
        // Must have same number of different item types
        if (gridKeys.length !== recipeKeys.length) {
            return false;
        }
        
        // Check each item type and count
        for (const itemType in recipeCounts) {
            if (gridCounts[itemType] !== recipeCounts[itemType]) {
                return false;
            }
        }
        
        return true;
    }
    
    showCraftResult(itemType) {
        const resultSlot = document.getElementById('craft-result');
        const craftBtn = document.getElementById('craft-button');
        
        resultSlot.innerHTML = '';
        
        if (itemType) {
            const recipe = Recipes.find(r => r.result === itemType);
            const preview = this.createItemPreview(itemType);
            resultSlot.appendChild(preview);
            
            // Show count if recipe produces multiple items
            if (recipe && recipe.count > 1) {
                const count = document.createElement('span');
                count.className = 'item-count';
                count.textContent = recipe.count;
                resultSlot.appendChild(count);
            }
            
            craftBtn.disabled = false;
            resultSlot.dataset.result = itemType;
        } else {
            craftBtn.disabled = true;
            delete resultSlot.dataset.result;
        }
    }
    
    craftItem() {
        const resultSlot = document.getElementById('craft-result');
        const itemType = parseInt(resultSlot.dataset.result);
        
        if (!itemType) return;
        
        // Find recipe to get count
        const recipe = Recipes.find(r => r.result === itemType);
        const count = recipe && recipe.count ? recipe.count : 1;
        
        // Clear crafting grid
        this.craftingGrid.forEach(slot => {
            slot.type = ItemType.AIR;
            slot.count = 0;
        });
        
        // Add result to inventory
        this.addToInventory(itemType, count);
        
        this.updateCraftingUI();
        this.updateHotbarUI();
        this.updateInventoryUI();
        this.checkRecipe();
    }
    
    addToInventory(itemType, count) {
        // Try to add to existing stack in hotbar
        for (let slot of this.hotbar) {
            if (slot.type === itemType && slot.count !== Infinity) {
                slot.count += count;
                return;
            }
        }
        
        // Try to add to empty hotbar slot
        for (let slot of this.hotbar) {
            if (slot.type === ItemType.AIR) {
                slot.type = itemType;
                slot.count = count;
                return;
            }
        }
        
        // Try inventory
        for (let slot of this.inventory) {
            if (slot.type === itemType) {
                slot.count += count;
                return;
            }
        }
        
        for (let slot of this.inventory) {
            if (slot.type === ItemType.AIR) {
                slot.type = itemType;
                slot.count = count;
                return;
            }
        }
    }
    
    updateCraftingUI() {
        document.querySelectorAll('.crafting-slot[data-craft-slot]').forEach((slot, index) => {
            slot.innerHTML = '';
            const item = this.craftingGrid[index];
            
            if (item.type !== ItemType.AIR) {
                const preview = this.createItemPreview(item.type);
                slot.appendChild(preview);
                slot.classList.add('has-item');
                
                if (item.count > 1) {
                    const count = document.createElement('span');
                    count.className = 'item-count';
                    count.textContent = item.count;
                    slot.appendChild(count);
                }
            } else {
                slot.classList.remove('has-item');
            }
        });
    }
    
    updateInventoryUI() {
        const grid = document.getElementById('inventory-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.inventory.forEach((item, index) => {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            if (item.type !== ItemType.AIR && item.count > 0) {
                const preview = this.createItemPreview(item.type);
                slot.appendChild(preview);
                slot.classList.add('has-item');
                
                const count = document.createElement('span');
                count.className = 'item-count';
                count.textContent = item.count;
                slot.appendChild(count);
            }
            
            grid.appendChild(slot);
        });
    }
    
    createItemPreview(itemType) {
        const preview = document.createElement('div');
        
        // Tools
        if (itemType === ItemType.WOODEN_SWORD) {
            preview.className = 'tool-preview wooden-sword';
        } else if (itemType === ItemType.STONE_SWORD) {
            preview.className = 'tool-preview stone-sword';
        } else if (itemType === ItemType.WOODEN_PICKAXE) {
            preview.className = 'tool-preview wooden-pickaxe';
        } else if (itemType === ItemType.STONE_PICKAXE) {
            preview.className = 'tool-preview stone-pickaxe';
        } else if (itemType === ItemType.WOODEN_AXE) {
            preview.className = 'tool-preview wooden-axe';
        } else if (itemType === ItemType.STONE_AXE) {
            preview.className = 'tool-preview stone-axe';
        } else if (itemType === ItemType.WOODEN_SHOVEL) {
            preview.className = 'tool-preview wooden-shovel';
        } else if (itemType === ItemType.STONE_SHOVEL) {
            preview.className = 'tool-preview stone-shovel';
        } else if (itemType === ItemType.WOODEN_SHIELD) {
            preview.className = 'tool-preview wooden-shield';
        } else if (itemType === ItemType.STONE_SHIELD) {
            preview.className = 'tool-preview stone-shield';
        } else if (itemType === ItemType.STICK) {
            preview.className = 'item-preview stick';
        } else if (itemType === ItemType.COIN_ITEM) {
            preview.className = 'item-preview coin';
        } else if (itemType === ItemType.FRIED_CHICKEN_WING) {
            preview.className = 'item-preview fried-chicken-wing';
        }
        // Blocks
        else if (itemType === ItemType.GRASS) {
            preview.className = 'block-preview grass';
        } else if (itemType === ItemType.DIRT) {
            preview.className = 'block-preview dirt';
        } else if (itemType === ItemType.STONE) {
            preview.className = 'block-preview stone';
        } else if (itemType === ItemType.WOOD) {
            preview.className = 'block-preview wood';
        } else if (itemType === ItemType.LEAVES) {
            preview.className = 'block-preview leaves';
        } else if (itemType === ItemType.PLANKS) {
            preview.className = 'block-preview planks';
        } else if (itemType === ItemType.FENCE || itemType === BlockType.FENCE) {
            preview.className = 'block-preview fence';
        }
        
        return preview;
    }
    
    selectHotbarSlot(slot) {
        this.selectedSlot = slot;
        
        document.querySelectorAll('.hotbar-slot').forEach((el, index) => {
            el.classList.toggle('active', index === slot);
        });
    }
    
    updateHotbarUI() {
        document.querySelectorAll('.hotbar-slot').forEach((slot, index) => {
            const item = this.hotbar[index];
            
            // Clear existing content
            const existingPreview = slot.querySelector('.block-preview, .tool-preview');
            if (existingPreview) {
                existingPreview.remove();
            }
            
            // Add new preview
            if (item.type !== ItemType.AIR) {
                const preview = this.createItemPreview(item.type);
                slot.insertBefore(preview, slot.firstChild);
            }
            
            // Update count
            const countSpan = slot.querySelector('.item-count');
            if (countSpan) {
                if (item.count === Infinity) {
                    countSpan.textContent = '∞';
                } else if (item.count > 0) {
                    countSpan.textContent = item.count;
                } else {
                    countSpan.textContent = '';
                }
            }
        });
    }
    
    breakBlock() {
        // Check if clicking on an enemy first
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const enemyMeshes = this.enemies.map(e => e.mesh);
        const enemyHits = this.raycaster.intersectObjects(enemyMeshes, true);
        
        if (enemyHits.length > 0 && enemyHits[0].distance <= REACH_DISTANCE) {
            const hitObject = enemyHits[0].object;
            let enemyIndex = -1;
            
            for (let i = 0; i < this.enemies.length; i++) {
                if (this.enemies[i].mesh === hitObject || this.enemies[i].mesh === hitObject.parent) {
                    enemyIndex = i;
                    break;
                }
            }
            
            if (enemyIndex !== -1) {
                const enemy = this.enemies[enemyIndex];
                const currentItem = this.hotbar[this.selectedSlot];
                
                // Calculate damage based on weapon
                let damage = 5; // Base fist damage
                if (currentItem.type === ItemType.WOODEN_SWORD) {
                    damage = 15;
                } else if (currentItem.type === ItemType.STONE_SWORD) {
                    damage = 25;
                } else if (currentItem.type === ItemType.WOODEN_AXE) {
                    damage = 12;
                } else if (currentItem.type === ItemType.STONE_AXE) {
                    damage = 20;
                }
                
                enemy.health -= damage;
                console.log(`Hit ${enemy.type}! Damage: ${damage}, Health: ${enemy.health}/${enemy.maxHealth}`);
                
                if (enemy.health <= 0) {
                    // Enemy defeated - remove and give rewards
                    this.scene.remove(enemy.mesh);
                    this.enemies.splice(enemyIndex, 1);
                    
                    // Reward coins
                    const coinReward = Math.floor(Math.random() * 20) + 15; // 15-35 coins
                    this.coinBalance += coinReward;
                    console.log(`Defeated ${enemy.type}! +${coinReward} coins!`);
                    this.updateCoinDisplay();
                    
                    // Respawn a new enemy elsewhere
                    const enemyTypes = [EnemyType.ZOMBIE, EnemyType.SKELETON];
                    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
                    let x, z;
                    do {
                        x = Math.random() * WORLD_SIZE;
                        z = Math.random() * WORLD_SIZE;
                    } while (Math.abs(x - WORLD_SIZE / 2) < 10 && Math.abs(z - WORLD_SIZE / 2) < 10);
                    const y = this.findSurfaceHeight(Math.floor(x), Math.floor(z)) + 2;
                    
                    const newEnemy = this.createEnemy(type, x, y, z);
                    this.enemies.push(newEnemy);
                    this.scene.add(newEnemy.mesh);
                }
                return;
            }
        }
        
        // Check if clicking on an animal
        const animalMeshes = this.animals.map(a => a.mesh);
        const animalHits = this.raycaster.intersectObjects(animalMeshes, true); // true = check children
        
        if (animalHits.length > 0 && animalHits[0].distance <= REACH_DISTANCE) {
            const hitObject = animalHits[0].object;
            // Find which animal was hit by checking parent groups
            let animalIndex = -1;
            for (let i = 0; i < this.animals.length; i++) {
                if (this.animals[i].mesh === hitObject || this.animals[i].mesh === hitObject.parent) {
                    animalIndex = i;
                    break;
                }
            }
            
            if (animalIndex !== -1) {
                const animal = this.animals[animalIndex];
                
                // Check if it's a chicken - give fried chicken wings!
                if (animal.type === AnimalType.CHICKEN) {
                    const wings = Math.floor(Math.random() * 2) + 2; // 2-3 fried chicken wings
                    this.addToInventory(ItemType.FRIED_CHICKEN_WING, wings);
                    console.log(`Caught chicken! +${wings} fried chicken wings! 🍗`);
                    this.updateHotbarUI();
                    this.updateInventoryUI();
                } else {
                    // Give rewards for interacting with other animals
                    const reward = Math.floor(Math.random() * 6) + 5; // 5-10 coins
                    this.coinBalance += reward;
                    console.log(`Fed ${animal.type}! +${reward} coins!`);
                }
                
                // Remove animal and respawn elsewhere
                this.scene.remove(animal.mesh);
                this.animals.splice(animalIndex, 1);
                
                // Respawn a new animal
                const animalTypes = [AnimalType.SHEEP, AnimalType.COW, AnimalType.PIG, AnimalType.CHICKEN];
                const type = animalTypes[Math.floor(Math.random() * animalTypes.length)];
                const x = Math.random() * WORLD_SIZE;
                const z = Math.random() * WORLD_SIZE;
                const y = this.findSurfaceHeight(Math.floor(x), Math.floor(z)) + 2;
                
                const newAnimal = this.createAnimal(type, x, y, z);
                this.animals.push(newAnimal);
                this.scene.add(newAnimal.mesh);
                
                this.updateCoinDisplay();
                return;
            }
        }
        
        const target = this.getTargetBlock();
        if (target && target.block) {
            const { x, y, z, type } = target.block.userData;
            
            // Check if it's a coin
            if (type === BlockType.COIN) {
                this.coinsCollected++;
                this.coinBalance += 20; // Each hidden coin gives 20 coins!
                this.setBlock(x, y, z, BlockType.AIR);
                this.updateCoinDisplay();
                
                // Play a visual effect or sound here if desired
                console.log(`Coin collected! +20 coins! ${this.coinsCollected}/${this.totalCoins}`);
                return;
            }
            
            // Check if using sword (faster mining)
            const currentItem = this.hotbar[this.selectedSlot];
            const isSword = currentItem.type === ItemType.WOODEN_SWORD || 
                           currentItem.type === ItemType.STONE_SWORD;
            
            // Add block to inventory
            this.addToInventory(type, 1);
            
            // Remove block
            this.setBlock(x, y, z, BlockType.AIR);
            
            this.updateHotbarUI();
            this.updateInventoryUI();
        }
    }
    
    updateCoinDisplay() {
        const coinCounter = document.getElementById('coin-counter');
        if (coinCounter) {
            coinCounter.textContent = `${this.coinsCollected}/${this.totalCoins}`;
        }
        
        const coinBalance = document.getElementById('coin-balance');
        if (coinBalance) {
            coinBalance.textContent = this.coinBalance;
        }
    }
    
    toggleFlyingMode() {
        this.isFlying = !this.isFlying;
        const flyIndicator = document.getElementById('fly-indicator');
        if (flyIndicator) {
            flyIndicator.style.display = this.isFlying ? 'block' : 'none';
        }
        
        // Reset vertical velocity when toggling
        if (this.isFlying) {
            this.player.velocity.y = 0;
        }
    }
    
    toggleShop() {
        this.shopMenuOpen = !this.shopMenuOpen;
        const menu = document.getElementById('shop-menu');
        menu.classList.toggle('hidden', !this.shopMenuOpen);
        
        if (this.shopMenuOpen) {
            document.exitPointerLock();
            this.updateShopUI();
        } else {
            document.body.requestPointerLock();
            if (document.activeElement) {
                document.activeElement.blur();
            }
        }
    }
    
    updateShopUI() {
        this.updateCoinDisplay();
        const shopBalance = document.getElementById('shop-coin-balance');
        if (shopBalance) {
            shopBalance.textContent = this.coinBalance;
        }
    }
    
    buyItem(itemType, cost) {
        if (this.coinBalance >= cost) {
            this.coinBalance -= cost;
            this.addToInventory(itemType, 1);
            this.updateCoinDisplay();
            this.updateHotbarUI();
            this.updateInventoryUI();
            console.log(`Purchased item for ${cost} coins!`);
        } else {
            alert(`Not enough coins! You need ${cost} but have ${this.coinBalance}`);
        }
    }
    
    placeBlock() {
        const currentItem = this.hotbar[this.selectedSlot];
        
        // Can't place if it's a tool, shield, or no item
        const isPlaceableBlock = currentItem.type <= BlockType.FENCE || currentItem.type === ItemType.PLANKS;
        const isShield = currentItem.type === ItemType.WOODEN_SHIELD || currentItem.type === ItemType.STONE_SHIELD;
        
        if (!isPlaceableBlock || isShield || currentItem.type === ItemType.AIR || currentItem.count === 0) {
            return;
        }
        
        // Always calculate mid-air placement position first
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const direction = this.raycaster.ray.direction.clone();
        const origin = this.camera.position.clone();
        
        // Place block 5 blocks away from player
        const placeDistance = 5;
        const placePoint = origin.add(direction.multiplyScalar(placeDistance));
        
        let newX = Math.floor(placePoint.x);
        let newY = Math.floor(placePoint.y);
        let newZ = Math.floor(placePoint.z);
        
        // Check if we're looking at an existing block - if so, place next to it instead
        const target = this.getTargetBlock();
        if (target && target.face) {
            // Place next to existing block
            const { x, y, z } = target.block.userData;
            const normal = target.face.normal;
            
            newX = Math.round(x + normal.x);
            newY = Math.round(y + normal.y);
            newZ = Math.round(z + normal.z);
        }
        // Otherwise use the mid-air position we calculated above
        
        // Check if there's already a block there
        if (this.getBlock(newX, newY, newZ) !== BlockType.AIR) {
            return; // Can't place if there's already a block
        }
        
        // Check if player would be inside the block
        const playerBlock = this.player.position.clone().floor();
        if (newX === playerBlock.x && newY === playerBlock.y && newZ === playerBlock.z) return;
        if (newX === playerBlock.x && newY === playerBlock.y - 1 && newZ === playerBlock.z) return;
        
        this.setBlock(newX, newY, newZ, currentItem.type);
        
        // Remove from inventory
        if (currentItem.count !== Infinity) {
            currentItem.count--;
            if (currentItem.count === 0) {
                currentItem.type = ItemType.AIR;
            }
            this.updateHotbarUI();
        }
    }
    
    getTargetBlock() {
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        
        // Only check blocks near the player instead of all blocks
        const nearbyBlocks = [];
        const px = Math.floor(this.player.position.x);
        const py = Math.floor(this.player.position.y);
        const pz = Math.floor(this.player.position.z);
        const range = REACH_DISTANCE + 1;
        
        for (let dx = -range; dx <= range; dx++) {
            for (let dy = -range; dy <= range; dy++) {
                for (let dz = -range; dz <= range; dz++) {
                    const block = this.blocks.get(`${px + dx},${py + dy},${pz + dz}`);
                    if (block) nearbyBlocks.push(block);
                }
            }
        }
        
        const intersects = this.raycaster.intersectObjects(nearbyBlocks);
        
        if (intersects.length > 0) {
            const hit = intersects[0];
            if (hit.distance <= REACH_DISTANCE) {
                return { block: hit.object, face: hit.face, point: hit.point };
            }
        }
        return null;
    }
    
    updatePlayer(deltaTime) {
        // Movement input
        const moveDirection = new THREE.Vector3();
        
        if (this.keys['KeyW']) moveDirection.z -= 1;
        if (this.keys['KeyS']) moveDirection.z += 1;
        if (this.keys['KeyA']) moveDirection.x -= 1;
        if (this.keys['KeyD']) moveDirection.x += 1;
        
        // Apply rotation to movement
        moveDirection.applyEuler(new THREE.Euler(0, this.player.rotation.y, 0));
        moveDirection.normalize();
        
        // Apply movement
        this.player.velocity.x = moveDirection.x * MOVE_SPEED;
        this.player.velocity.z = moveDirection.z * MOVE_SPEED;
        
        if (this.isFlying) {
            // Flying mode - no gravity, can move up and down
            this.player.velocity.y = 0;
            
            if (this.keys['Space']) {
                this.player.velocity.y = MOVE_SPEED; // Fly up
            }
            if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
                this.player.velocity.y = -MOVE_SPEED; // Fly down
            }
        } else {
            // Normal mode - gravity and jumping
            this.player.velocity.y -= GRAVITY * deltaTime;
            
            // Jump
            if (this.keys['Space'] && this.player.onGround) {
                this.player.velocity.y = JUMP_SPEED;
                this.player.onGround = false;
            }
        }
        
        // Update position
        const newPos = this.player.position.clone();
        newPos.add(this.player.velocity.clone().multiplyScalar(deltaTime));
        
        if (this.isFlying) {
            // In flying mode, no collision detection except for blocks
            const posX = Math.floor(newPos.x);
            const posY = Math.floor(newPos.y);
            const posZ = Math.floor(newPos.z);
            
            // Only prevent flying through solid blocks
            if (this.getBlock(posX, posY, posZ) !== BlockType.AIR) {
                newPos.copy(this.player.position);
            }
            
            this.player.position.copy(newPos);
        } else {
            // Normal mode - full collision detection
            this.player.onGround = false;
            
            // Check Y collision (vertical)
            const feetY = Math.floor(newPos.y - 1.6);
            const headY = Math.floor(newPos.y + 0.2);
            const posX = Math.floor(newPos.x);
            const posZ = Math.floor(newPos.z);
            
            // Check ground
            if (this.getBlock(posX, feetY, posZ) !== BlockType.AIR) {
                this.player.onGround = true;
                this.player.velocity.y = 0;
                newPos.y = feetY + 1 + 1.6;
            }
            
            // Check ceiling
            if (this.getBlock(posX, headY, posZ) !== BlockType.AIR) {
                this.player.velocity.y = 0;
                newPos.y = this.player.position.y;
            }
            
            // Check X collision
            const checkX = Math.floor(newPos.x);
            if (this.getBlock(checkX, Math.floor(newPos.y - 1), posZ) !== BlockType.AIR ||
                this.getBlock(checkX, Math.floor(newPos.y), posZ) !== BlockType.AIR) {
                newPos.x = this.player.position.x;
            }
            
            // Check Z collision
            const checkZ = Math.floor(newPos.z);
            if (this.getBlock(posX, Math.floor(newPos.y - 1), checkZ) !== BlockType.AIR ||
                this.getBlock(posX, Math.floor(newPos.y), checkZ) !== BlockType.AIR) {
                newPos.z = this.player.position.z;
            }
            
            this.player.position.copy(newPos);
        }
        
        // Update camera
        this.camera.position.copy(this.player.position);
        this.camera.rotation.copy(this.player.rotation);
    }
    
    gameOver() {
        alert(`Game Over! You were defeated by enemies. Final coin balance: ${this.coinBalance}`);
        // Reload the page to restart
        location.reload();
    }
    
    updateUI() {
        document.getElementById('fps').textContent = this.fpsDisplay;
        
        const pos = this.player.position;
        document.getElementById('position').textContent = 
            `${Math.round(pos.x)}, ${Math.round(pos.y)}, ${Math.round(pos.z)}`;
        
        // Update health bar
        const healthBar = document.getElementById('health-bar');
        const healthText = document.getElementById('health-text');
        if (healthBar && healthText) {
            const healthPercent = (this.player.health / this.player.maxHealth) * 100;
            healthBar.style.width = healthPercent + '%';
            healthText.textContent = `${Math.round(this.player.health)}/${this.player.maxHealth}`;
            
            // Change color based on health
            if (healthPercent > 60) {
                healthBar.style.backgroundColor = '#44aa44';
            } else if (healthPercent > 30) {
                healthBar.style.backgroundColor = '#ffaa00';
            } else {
                healthBar.style.backgroundColor = '#ff4444';
            }
        }
        
        this.updateCoinDisplay();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const now = performance.now();
        const frameDelta = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;
        const deltaTime = Math.min(frameDelta, 0.1);
        
        // FPS tracking (update display every 0.5s)
        this.frameCount++;
        this.fpsUpdateTimer += deltaTime;
        if (this.fpsUpdateTimer >= 0.5) {
            this.fpsDisplay = Math.round(this.frameCount / this.fpsUpdateTimer);
            this.frameCount = 0;
            this.fpsUpdateTimer = 0;
        }
        
        if (this.isPointerLocked && !this.craftingMenuOpen && !this.shopMenuOpen) {
            this.updatePlayer(deltaTime);
        }
        
        this.updateAnimals(deltaTime);
        this.updateEnemies(deltaTime);
        
        // Health regeneration (1 HP every 5 seconds)
        this.player.healthRegenTimer += deltaTime;
        if (this.player.healthRegenTimer >= 5.0 && this.player.health < this.player.maxHealth) {
            this.player.health = Math.min(this.player.health + 1, this.player.maxHealth);
            this.player.healthRegenTimer = 0;
        }
        
        // Throttle UI updates to ~4 times per second
        this.uiUpdateTimer += deltaTime;
        if (this.uiUpdateTimer >= 0.25) {
            this.uiUpdateTimer = 0;
            this.updateUI();
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Start game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});
