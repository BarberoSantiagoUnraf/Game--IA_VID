//Stadisticas
let EnergyMax = 1000;
let Energy = EnergyMax; // Energia inicial
let Vida = 20;
let ConsPasivo = 0.1;
let ConsActivo = 1; // lo que consume cada accion
let ConsCantidad = 0; //cantidad de acciones de consumo
let Zoom = false;

export class copiPlay extends Phaser.Scene {
  constructor() {
    // Se asigna una key para despues poder llamar a la escena
    super("copiPlay");
  }

  preload() {
    this.load.image("background", "./public/Assets/Background.png");
    this.load.image("pj", "./public/Assets/PJ-00.png");
    this.load.image("HUD", "./public/Assets/HUD-Background.png");
    this.load.image("Charger", "./public/Assets/BaseCarga.png");
    this.load.image("Repair", "./public/Assets/BaseVida.png");
    this.load.image("ADN", "./public/Assets/ADN.png");
    this.load.image("Pinzas", "./public/Assets/Pinzas-00.png");
    this.load.spritesheet("Virus0", "./public/Assets/SS_0-Virus.png", {
      frameWidth: 45,
      frameHeight: 44,
    });
    this.load.spritesheet("VirusI", "./public/Assets/SS_I-Virus.png", {
      frameWidth: 76,
      frameHeight: 76,
    });
  }

  create() {
    //set.Interactive(draggable: true)
    //creacion mapa
    this.add.image(0, 0, "background");
    // HUD debe de estar ultimo
    this.add
      .image(this.cameras.main.centerX, this.cameras.main.centerY, "HUD")
      .setScrollFactor(0)
      .setDepth(5);
    // creacion pj
    this.player = this.matter.add.sprite(0, 0, "pj").setDepth(4);
    // Ajusta el tamaño de la colisión
    this.player.setSize(60, 60);
    // No world bounds: do not set any bounds for the Matter world
    this.pinzas = this.matter.add
      .image(0, 0, "Pinzas")
      .setOrigin(0.5, -0.25)
      .setCircle(35, 3, 15);
    //la camara sigue al player
    this.cameras.main.startFollow(this.player);

    // se crean 3 bases de carga y 3 bases de reparacion en posisiones aleatorias
    this.chargers = [];
    for (let i = 0; i < 3; i++) {
      const charger = this.matter.add
        .sprite(
          Phaser.Math.Between(-1000, 1000),
          Phaser.Math.Between(-1000, 1000),
          "Charger"
        )
        .setDepth(3);
      charger.setCircle(25, 17, 17);
      this.chargers.push(charger);

      // Asignar función al hitAreaCallback (evento pointerdown, por ejemplo)
      charger.on("pointerdown", () => {
        console.log("Charger clicked!");
        if (Energy < EnergyMax) {
          Energy += 5;
          if (Energy > EnergyMax) {
            Energy = EnergyMax; // Limitar la energía al máximo
          }
        }
      });
    }
    // Evento de overlap: recarga 5 de energía por segundo mientras el player está sobre cualquier charger
    this.matter.world.on("collisionactive", (event) => {
      event.pairs.forEach((pair) => {
        const bodies = [pair.bodyA.gameObject, pair.bodyB.gameObject];
        this.chargers.forEach((charger) => {
          if (bodies.includes(this.player) && bodies.includes(charger)) {
            if (!charger.isCharging) {
              charger.isCharging = true;
              charger.chargeInterval = this.time.addEvent({
                delay: 1000,
                loop: true,
                callback: () => {
                  if (Energy < EnergyMax) {
                    Energy += 5;
                    if (Energy > EnergyMax) Energy = EnergyMax;
                    this.energyText.setText(`Energy: ${this.getEnerPorc()}% ${Energy}`);
                  }
                },
              });
            }
          }
        });
      });
    });

    // Evento para detener la recarga cuando el player sale de cualquier charger
    this.matter.world.on("collisionend", (event) => {
      event.pairs.forEach((pair) => {
        const bodies = [pair.bodyA.gameObject, pair.bodyB.gameObject];
        this.chargers.forEach((charger) => {
          if (bodies.includes(this.player) && bodies.includes(charger)) {
            if (charger.isCharging && charger.chargeInterval) {
              charger.chargeInterval.remove();
              charger.isCharging = false;
            }
          }
        });
      });
    });
    
    // Crear enemigos Virus0 cada 3 segundos, máximo 10
    this.virusGroup = this.add.group();
    this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        if (this.virusGroup.getChildren().length < 10) {
          const virus = this.matter.add
            .sprite(
              Phaser.Math.Between(-1000, 1000),
              Phaser.Math.Between(-1000, 1000),
              "Virus0"
            )
            .setDepth(3);
          virus.speed = 2; // Ajusta la velocidad para Matter.js (valor menor)
          this.virusGroup.add(virus);

          // Agrega colisión entre virus y jugador para hacer daño
          this.matter.world.on("collisionstart", (event) => {
            event.pairs.forEach((pair) => {
              const bodies = [pair.bodyA.gameObject, pair.bodyB.gameObject];
              if (bodies.includes(this.player) && bodies.includes(virus)) {
                Vida -= 5;
              }
            });
          });
        }
        // Actualizar dirección de todos los virus hacia el jugador
        this.virusGroup.getChildren().forEach((virus) => {
          if (this.player && virus.active) {
            const dx = this.player.x - virus.x;
            const dy = this.player.y - virus.y;
            const angle = Math.atan2(dy, dx);
            // Para Matter.js, usa setVelocity directamente en el body
            virus.setVelocity(
              Math.cos(angle) * virus.speed,
              Math.sin(angle) * virus.speed
            );
          }
        });
      },
    });
    // agrega las teclas a utilizar
    // agregar controles de cursor
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      X: Phaser.Input.Keyboard.KeyCodes.X,
    });

    const UP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const DOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const LEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    const RIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.energyText = this.add
      .text(16, 16, `Energy: ${this.getEnerPorc()}% ${Energy}`, {
        fontFamily: '"Tektur", Arial, sans-serif',
        fontSize: "32px",
        fill: "Green",
      })
      .setScrollFactor(0)
      .setDepth(6);

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (Energy > 0) {
          Energy = Energy - ConsPasivo; // consumo pasivo de energia
          this.energyText.setText(`Energy: ${this.getEnerPorc()}% ${Energy}`);
        }
      },
    });

    //agrega la funcion al presionar la X
    this.input.keyboard.on("keydown-X", () => {
      if (!this.Zoom) {
        this.cameras.main.setZoom(0.4);
        this.Zoom = true;
      } else {
        this.cameras.main.setZoom(1);
        this.Zoom = false;
      }
    });
  }

  update() {
    
    if (this.cursors.left.isDown) {
      this.player.rotation -= 0.08;
      this.pinzas.rotation = this.player.rotation;
      if (!this.leftWasDown) {
        ConsCantidad += 1;
        this.leftWasDown = true;
      }
      this.Consumo();
    }
    if (this.cursors.left.isUp) {
      if (this.leftWasDown) {
        ConsCantidad -= 1;
      }
      this.leftWasDown = false;
    }
    
    if (this.cursors.right.isDown) {
      this.player.rotation += 0.08;
      this.pinzas.rotation = this.player.rotation;
      if (!this.rightWasDown) {
        ConsCantidad += 1;
        this.rightWasDown = true;
      }
      this.Consumo();
    }
    if (this.cursors.right.isUp) {
      if (this.rightWasDown) {
        ConsCantidad -= 1;
      }
      this.rightWasDown = false;
    }
    // Asteroids-style thrust movement
    if (this.cursors.up.isDown) {
      // Calculate thrust vector based on rotation
      const angle = this.player.rotation - Math.PI / 2;
      const thrust = -15;
      if (!this.upWasDown) {
        ConsCantidad += 1;
        this.upWasDown = true;
      }
      this.Consumo();
      this.player.body.velocity.x += Math.cos(angle) * thrust;
      this.player.body.velocity.y += Math.sin(angle) * thrust;
    }
    if (this.cursors.up.isUp) {
      if (this.upWasDown) {
        ConsCantidad -= 1;
      }
      this.upWasDown = false;
    }
    if (this.cursors.down.isDown) {
      // Calculate thrust vector based on rotation
      const angle = this.player.rotation - Math.PI / 2;
      const thrust = 15;
      if (!this.downWasDown) {
        ConsCantidad += 1;
        this.downWasDown = true;
      }
      this.Consumo();
      this.player.body.velocity.x += Math.cos(angle) * thrust;
      this.player.body.velocity.y += Math.sin(angle) * thrust;
    }
    if (this.cursors.left.isUp) {
      if (this.downWasDown) {
        ConsCantidad -= 1;
      }
      this.downWasDown = false;
    }
    // Apply drag
    this.player.body.velocity.x *= 0.97;
    this.player.body.velocity.y *= 0.97;
  }

  //FUNCIONES
  getEnerPorc() {
    return Math.round((Energy * 100) / EnergyMax);
  }

  Consumo() {
    if (!this.lastConsumoTime) {
      this.lastConsumoTime = this.time.now;
    }
    const elapsed = this.time.now - this.lastConsumoTime;
    if (elapsed >= 500) {
      if (Energy > 0) {
        Energy = Energy - ConsActivo * ConsCantidad; // consumo activo de energia
        this.lastConsumoTime = this.time.now;
      }}
  }
}
