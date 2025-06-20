//Stadisticas
let EnergyMax = 1000;
let Energy = EnergyMax; // Energia inicial
let Vida = 20;
let ConsPasivo = 0.1;
let ConsActivo = 1; // lo que consume cada accion
let ConsCantidad = 0 //cantidad de acciones de consumo

export class Play extends Phaser.Scene {
  constructor() {
    // Se asigna una key para despues poder llamar a la escena
    super("Play");
  }

 preload() {
    this.load.image("background", "./public/Assets/Background.png")
    this.load.image("pj", "./public/Assets/PJ-00.png")
    this.load.image("HUD", "./public/Assets/HUD-Background.png")
    this.load.image("Charger", "./public/Assets/BaseCarga.png")

  }

 create() {
    //creacion mapa
    this.add.image(0, 0, "background");
     // HUD
    this.add.image(683, 384, "HUD").setScrollFactor(0);
    // creacion pj
    this.player = this.physics.add.sprite(0, 0, "pj");
    this.player.setCollideWorldBounds(false);

    // Crear imagen interactiva con área circular
    const charger = this.physics.add.image(50, -50, "Charger").setInteractive(new Phaser.Geom.Circle(55, 55, 40), Phaser.Geom.Circle.Contains);

    // Asignar función al hitAreaCallback (evento pointerdown, por ejemplo)
    charger.on('pointerdown', (pointer) => {
      console.log('Charger clicked!');
      if (Energy <= EnergyMax) {
          Energy += 5
          if (Energy > EnergyMax) {
            Energy = EnergyMax; // Limitar la energía al máximo
          }
      }
      // Puedes agregar lógica adicional aquí
    });

    // Variable para controlar el tiempo de carga
    this.chargerOverlapTime = 0;

    // Crear overlap entre el player y el charger
    this.physics.add.overlap(this.player, charger, () => {
      // Se maneja en update para sumar cada segundo
      this.chargerOverlapping = true;
    }, null, this);

    // agregar controles de cursor
    this.cursors = this.input.keyboard.createCursorKeys();

    //agregar camara
    this.cameras.main.startFollow(this.player);

    this.energyText = this.add.text(16, 16, `Energy: ${this.getEnerPorc()}% ${Energy}`, {
      fontFamily: '"Tektur", Arial, sans-serif',
      fontSize: '32px',
      fill: 'Green'
    }).setScrollFactor(0);

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (Energy > 0) {
          Energy = Energy-ConsPasivo; // consumo pasivo de energia
          this.energyText.setText(`Energy: ${this.getEnerPorc()}% ${Energy}`);
        }
      }
    });
   

  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.rotation -= 0.08;
      if (!this.leftWasDown) {
        ConsCantidad += 1;
        this.leftWasDown = true;
        console.log("Consumo Cantidad: " + ConsCantidad);
        console.log(this.leftWasDown);
      }
      this.Consumo();
    }
    if (this.cursors.left.isUp) {
      if (this.leftWasDown) {
        ConsCantidad -= 1;
        console.log("Consumo Cantidad: " + ConsCantidad);
        console.log(this.leftWasDown);
      }
      this.leftWasDown = false;
    }
    if (this.cursors.right.isDown) {
      this.player.rotation += 0.08;
      if (!this.rightWasDown) {
        ConsCantidad += 1;
        this.rightWasDown = true;
        console.log("Consumo Cantidad: " + ConsCantidad);
        console.log(this.leftWasDown);
      }
      this.Consumo();
    }
    if (this.cursors.right.isUp) {
      if (this.rightWasDown) {
        ConsCantidad -= 1;
        console.log("Consumo Cantidad: " + ConsCantidad);
        console.log(this.rightWasDown);
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
        console.log("Consumo Cantidad: " + ConsCantidad);
        console.log(this.upWasDown);
      }
      this.Consumo();
      this.player.body.velocity.x += Math.cos(angle) * thrust;
      this.player.body.velocity.y += Math.sin(angle) * thrust;
    }
    if (this.cursors.up.isUp) {
      if (this.upWasDown) {
        ConsCantidad -= 1;
        console.log("Consumo Cantidad: " + ConsCantidad);
        console.log(this.upWasDown);
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
        console.log("Consumo Cantidad: " + ConsCantidad);
        console.log(this.downWasDown);
      }
      this.Consumo();
      this.player.body.velocity.x += Math.cos(angle) * thrust;
      this.player.body.velocity.y += Math.sin(angle) * thrust;
    }
    if (this.cursors.left.isUp) {
      if (this.downWasDown) {
        ConsCantidad -= 1;
        console.log("Consumo Cantidad: " + ConsCantidad);
        console.log(this.downWasDown);
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
      Energy = Energy - ConsActivo*ConsCantidad; // consumo activo de energia
      this.lastConsumoTime = this.time.now;
      console.log("Consumo Activo: " + ConsActivo);
    }
  }
}


}