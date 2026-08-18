import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";


// ============================================================
// GAME SETUP
// ============================================================

const game = document.getElementById("game");


// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);


// ============================================================
// CAMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

camera.position.set(
    0,
    3,
    8
);


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

game.appendChild(renderer.domElement);


// ============================================================
// LIGHTING
// ============================================================

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

sun.position.set(
    20,
    30,
    10
);

scene.add(sun);


const ambient =
    new THREE.AmbientLight(
        0xffffff,
        0.55
    );

scene.add(ambient);


// ============================================================
// BLOCK MATERIALS
// ============================================================

const grassMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x55aa33
    });


const dirtMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x8b5a2b
    });


const stoneMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x777777
    });


const woodMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x8b4513
    });


const leavesMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x228b22
    });


// ============================================================
// BLOCK GEOMETRY
// ============================================================

const blockGeometry =
    new THREE.BoxGeometry(
        1,
        1,
        1
    );


// ============================================================
// WORLD
// ============================================================

const blocks = [];

function createBlock(
    x,
    y,
    z,
    material
) {

    const block =
        new THREE.Mesh(
            blockGeometry,
            material
        );

    block.position.set(
        x,
        y,
        z
    );

    scene.add(block);

    blocks.push(block);

    return block;
}


// ============================================================
// TERRAIN
// ============================================================

const WORLD_SIZE = 24;


function terrainHeight(x, z) {

    const height =
        Math.sin(x * 0.25) *
        1.2 +
        Math.cos(z * 0.22) *
        1.2 +
        Math.sin(
            (x + z) * 0.12
        );

    return Math.floor(
        height
    );
}


for (
    let x = -WORLD_SIZE;
    x <= WORLD_SIZE;
    x++
) {

    for (
        let z = -WORLD_SIZE;
        z <= WORLD_SIZE;
        z++
    ) {

        const height =
            terrainHeight(
                x,
                z
            );

        for (
            let y = -3;
            y <= height;
            y++
        ) {

            let material;

            if (
                y === height
            ) {

                material =
                    grassMaterial;

            } else if (
                y >= height - 2
            ) {

                material =
                    dirtMaterial;

            } else {

                material =
                    stoneMaterial;

            }

            createBlock(
                x,
                y,
                z,
                material
            );
        }
    }
}


// ============================================================
// TREES
// ============================================================

function createTree(
    x,
    z
) {

    const ground =
        terrainHeight(
            x,
            z
        );

    // Trunk

    for (
        let y = 1;
        y <= 4;
        y++
    ) {

        createBlock(
            x,
            ground + y,
            z,
            woodMaterial
        );
    }


    // Leaves

    for (
        let dx = -2;
        dx <= 2;
        dx++
    ) {

        for (
            let dz = -2;
            dz <= 2;
            dz++
        ) {

            for (
                let dy = 3;
                dy <= 5;
                dy++
            ) {

                const distance =
                    Math.abs(dx) +
                    Math.abs(dz);

                if (
                    distance <= 3
                ) {

                    createBlock(
                        x + dx,
                        ground + dy,
                        z + dz,
                        leavesMaterial
                    );
                }
            }
        }
    }
}


createTree(-8, -8);
createTree(8, -7);
createTree(-10, 8);
createTree(9, 9);


// ============================================================
// PLAYER
// ============================================================

const player = {

    position:
        new THREE.Vector3(
            0,
            5,
            8
        ),

    velocity:
        new THREE.Vector3(),

    height: 1.8,

    speed: 5,

    jumpPower: 8,

    onGround: false
};


// ============================================================
// INPUT
// ============================================================

const keys = {};

window.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[event.code] = false;

    }
);


// ============================================================
// MOUSE LOOK
// ============================================================

let yaw = 0;

let pitch = 0;


document.body.addEventListener(
    "click",
    () => {

        document.body.requestPointerLock();

    }
);


document.addEventListener(
    "mousemove",
    event => {

        if (
            document.pointerLockElement !==
            document.body
        ) {
            return;
        }

        yaw -=
            event.movementX *
            0.002;

        pitch -=
            event.movementY *
            0.002;


        const limit =
            Math.PI / 2 - 0.05;

        pitch =
            Math.max(
                -limit,
                Math.min(
                    limit,
                    pitch
                )
            );
    }
);


// ============================================================
// SIMPLE COLLISION
// ============================================================

function getGroundHeight(
    x,
    z
) {

    return terrainHeight(
        Math.round(x),
        Math.round(z)
    );
}


// ============================================================
// JUMP
// ============================================================

window.addEventListener(
    "keydown",
    event => {

        if (
            event.code === "Space" &&
            player.onGround
        ) {

            player.velocity.y =
                player.jumpPower;

            player.onGround =
                false;
        }
    }
);


// ============================================================
// MOVEMENT
// ============================================================

function updatePlayer(
    delta
) {

    const movement =
        new THREE.Vector3();


    if (
        keys["KeyW"]
    ) {

        movement.z -= 1;

    }


    if (
        keys["KeyS"]
    ) {

        movement.z += 1;

    }


    if (
        keys["KeyA"]
    ) {

        movement.x -= 1;

    }


    if (
        keys["KeyD"]
    ) {

        movement.x += 1;

    }


    if (
        movement.lengthSq() > 0
    ) {

        movement.normalize();

        movement.applyAxisAngle(
            new THREE.Vector3(
                0,
                1,
                0
            ),
            yaw
        );


        player.position.x +=
            movement.x *
            player.speed *
            delta;


        player.position.z +=
            movement.z *
            player.speed *
            delta;
    }


    // Gravity

    player.velocity.y -=
        20 * delta;


    player.position.y +=
        player.velocity.y *
        delta;


    // Ground

    const ground =
        getGroundHeight(
            player.position.x,
            player.position.z
        );


    const minimumHeight =
        ground + 2;


    if (
        player.position.y <
        minimumHeight
    ) {

        player.position.y =
            minimumHeight;

        player.velocity.y = 0;

        player.onGround = true;

    } else {

        player.onGround = false;

    }
}


// ============================================================
// CAMERA
// ============================================================

function updateCamera() {

    camera.position.copy(
        player.position
    );

    camera.rotation.order =
        "YXZ";

    camera.rotation.y =
        yaw;

    camera.rotation.x =
        pitch;
}


// ============================================================
// GAME LOOP
// ============================================================

const clock =
    new THREE.Clock();


function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    updatePlayer(
        delta
    );


    updateCamera();


    renderer.render(
        scene,
        camera
    );
}


gameLoop();


// ============================================================
// WINDOW RESIZE
// ============================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);
