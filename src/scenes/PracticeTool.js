import ButtonHandler from "../buttonHandler.js"; // Importa la clase Boton

export class PracticeTool extends Phaser.Scene {
  constructor() {
    // Se asigna una key para despues poder llamar a la escena
    super("PracticeTool");
  }
  // Array para almacenar puntos de ejes cartesianos
  posiciones = [
    [455, 55],// 0: Arriba
    [686, 152],// 1: Arriba-Derecha
    [782, 385],// 2: Derecha
    [686, 615],// 3: Abajo-Derecha
    [455, 712],// 4: Abajo
    [223, 615],// 5: Abajo-Izquierda
    [126, 385],// 6: Izquierda
    [223, 152],// 7: Arriba-Izquierda
  ];

  preload() {
    // Carga de imagenes
    this.load.image("pj", "./public/Assets/PJ-00.png");
    this.load.image("Pinzas", "./public/Assets/Pinzas-00.png");
    this.load.image("BG_PT", "./public/Assets/Background.png");
    this.load.image("HUD", "./public/Assets/HUD-Background.png");
    this.load.spritesheet("teclas", "./public/Assets/Teclas.png", {
      frameWidth: 66,
      frameHeight: 66,
    });
  }

  create() {
    // Fondo del menú principal
    this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "BG_PT"
    );
    this.add.image(0, 0, "HUD").setOrigin(0, 0);
    // Array para determinar las combinaciones de teclas
    this.paresAleatorios = [];
    for (let i = 0; i < 8; i++) {
      const par = [Phaser.Math.Between(0, 7), Phaser.Math.Between(0, 7)];
      this.paresAleatorios.push(par);
    }

    // agregar controles de cursor
    this.cursors = this.input.keyboard.createCursorKeys();
    // agregar controles de teclas W E S D
    this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      X: Phaser.Input.Keyboard.KeyCodes.X,
    });

    const WW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const SS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const AA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const DD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.BPlay = new ButtonHandler(
      this,
      "Buttons",
      "Boton_Play.png",
      this.posiciones[0][0],
      this.cameras.main.centerY,
      (level, button) => this.BplayDown(level, button),
      (level, button) => this.BplayOver(level, button),
      (level, button) => this.BplayOut(level, button)
    );

    // Cuenta regresiva
    this.tiempo = 60;
    this.tiempoRestante = this.tiempo; // segundos
    this.timerText = this.add
      .text(this.cameras.main.width - 500, 20,`Tiempo: ${this.tiempoRestante}`,
        {
          fontFamily: '"Tektur", Arial, sans-serif',
          fontSize: "64px",
          color: "#67d936",
        }
      )
      .setDepth(6);

    this.Combos = 0;
    this.comboText = this.add
      .text(
        this.cameras.main.width - 500, 100, `Combos: ${this.Combos}`, {
        fontFamily: '"Tektur", Arial, sans-serif',
        fontSize: "48px",
        color: "#67d936",
      })
      .setDepth(6);

    // Array para acumular las últimas 2 teclas presionadas
    this.ultimasTeclas = [];

    // Función para registrar la tecla presionada
    const registrarTecla = (tecla) => {
      this.ultimasTeclas.push(tecla);
      // Mostrar la primera tecla
      if (!this.vertecla1 && this.ultimasTeclas.length === 1) {
        this.vertecla1 = this.add.image(
          this.player.x - 40, this.player.y + 80, "teclas", this.ultimasTeclas[0]
        );
      } else if (this.ultimasTeclas.length === 1 && this.vertecla1) {
        this.vertecla1.setFrame(this.ultimasTeclas[0]);
      }
      // Mostrar la segunda tecla
      if (this.ultimasTeclas.length === 2) {
        if (!this.vertecla2) {
          this.vertecla2 = this.add.image(
            this.player.x + 40, this.player.y + 80, "teclas", this.ultimasTeclas[1]
          );
        } else {
          this.vertecla2.setFrame(this.ultimasTeclas[1]);
        }
        this.verificarTeclas();
      }
    };

    // Registrar eventos para las flechas
    this.input.keyboard.on("keydown-UP", () => registrarTecla(2));
    this.input.keyboard.on("keydown-DOWN", () => registrarTecla(3));
    this.input.keyboard.on("keydown-LEFT", () => registrarTecla(0));
    this.input.keyboard.on("keydown-RIGHT", () => registrarTecla(1));

    // Mueve los listeners aquí:
    WW.on("down", () => {
      registrarTecla(4);
    });
    SS.on("down", () => {
      registrarTecla(6);
    });
    AA.on("down", () => {
      registrarTecla(5);
    });
    DD.on("down", () => {
      registrarTecla(7);
    });
    this.input.keyboard.on("keydown-X", () => {
      this.verificarTeclas();
    });

    // Inicializar el score y el historial de líneas
    this.score = 0;

    // Mostrar el score en la esquina superior izquierda
    this.scoreText = this.add
      .text(this.cameras.main.width - 500, 160, `Score: ${this.score}`, {
        fontFamily: '"Tektur", Arial, sans-serif',
        fontSize: "48px",
        color: "#67d936",
        align: "left",
      })
      .setOrigin(0, 0);
  }

  // FUNCOINES NO HAY UPDATE POR EL MOMENTO
  //creacion de imagenes en posicion correspondiente
  // Crear dos imágenes usando los valores del primer par aleatorio
  ParUP() {
    return [
      this.add.image(
        this.posiciones[0][0] - 40,
        this.posiciones[0][1],
        "teclas",
        this.paresAleatorios[0][0]
      ),
      this.add.image(
        this.posiciones[0][0] + 40,
        this.posiciones[0][1],
        "teclas",
        this.paresAleatorios[0][1]
      ),
    ];
  }

  ParRightUP() {
    return [
      this.add.image(
        this.posiciones[1][0] - 40,
        this.posiciones[1][1],
        "teclas",
        this.paresAleatorios[1][0]
      ).setDepth(6),
      this.add.image(
        this.posiciones[1][0] + 40,
        this.posiciones[1][1],
        "teclas",
        this.paresAleatorios[1][1]
      ).setDepth(6),
    ];
  }

  ParRIGHT() {
    return [
      this.add.image(
        this.posiciones[2][0] - 40,
        this.posiciones[2][1],
        "teclas",
        this.paresAleatorios[2][0]
      ).setDepth(6),
      this.add.image(
        this.posiciones[2][0] + 40,
        this.posiciones[2][1],
        "teclas",
        this.paresAleatorios[2][1]
      ).setDepth(6),
    ];
  }
  ParDOWNRight() {
    return [
      this.add.image(
        this.posiciones[3][0] - 40,
        this.posiciones[3][1],
        "teclas",
        this.paresAleatorios[3][0]
      ).setDepth(6),
      this.add.image(
        this.posiciones[3][0] + 40,
        this.posiciones[3][1],
        "teclas",
        this.paresAleatorios[3][1]
      ).setDepth(6),
    ];
  }
  ParDOWN() {
    return [
      this.add.image(
        this.posiciones[4][0] - 40,
        this.posiciones[4][1],
        "teclas",
        this.paresAleatorios[4][0]
      ).setDepth(6),
      this.add.image(
        this.posiciones[4][0] + 40,
        this.posiciones[4][1],
        "teclas",
        this.paresAleatorios[4][1]
      ).setDepth(6),
    ];
  }
  ParDOWNLEFT() {
    return [
      this.add.image(
        this.posiciones[5][0] - 40,
        this.posiciones[5][1],
        "teclas",
        this.paresAleatorios[5][0]
      ).setDepth(6),
      this.add.image(
        this.posiciones[5][0] + 40,
        this.posiciones[5][1],
        "teclas",
        this.paresAleatorios[5][1]
      ).setDepth(6),
    ];
  }

  ParLEFT() {
    return [
      this.add.image(
        this.posiciones[6][0] - 40,
        this.posiciones[6][1],
        "teclas",
        this.paresAleatorios[6][0]
      ).setDepth(6),
      this.add.image(
        this.posiciones[6][0]+ 40,
        this.posiciones[6][1],
        "teclas",
        this.paresAleatorios[6][1]
      ).setDepth(6),
    ];
  }
  ParUPLEFT() {
    return [
      this.add.image(
        this.posiciones[7][0]- 40,
        this.posiciones[7][1],
        "teclas",
        this.paresAleatorios[7][0]
      ).setDepth(6),
      this.add.image(
        this.posiciones[7][0]+ 40,
        this.posiciones[7][1],
        "teclas",
        this.paresAleatorios[7][1]
      ).setDepth(6),
    ];
  }

  BplayDown(level, button) {
    this.timerText.setText(`Tiempo: ${this.tiempoRestante}`);
    if (!this.player) {
      this.player = this.add.image(
        455,
        385,
        "pj"
      );
      this.pinzas = this.add.image(455, 385, "Pinzas").setOrigin(0.5, -0.4);
    }
    this.ParOrdenado();
    // Si ya hay un evento de tiempo, no crear otro
    if (this.timeEvent && this.timeEvent.getProgress() < 1) {
      return;
    }
    this.timeEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.tiempoRestante--;
        this.timerText.setText(`Tiempo: ${this.tiempoRestante}`);
        if (this.tiempoRestante <= 0) {
          this.timeEvent.remove();
          this.parUPImages?.forEach((image) => image.destroy());
          this.parRightUPImages?.forEach((image) => image.destroy());
          this.parRIGHTImages?.forEach((image) => image.destroy());
          this.parDOWNRightImages?.forEach((image) => image.destroy());
          this.parDOWNImages?.forEach((image) => image.destroy());
          this.parDOWNLEFTImages?.forEach((image) => image.destroy());
          this.parLEFTImages?.forEach((image) => image.destroy());
          this.parUPLEFTImages?.forEach((image) => image.destroy());
          this.player?.destroy();
          this.pinzas?.destroy();
          this.BPlay = new ButtonHandler(
            this,
            "Buttons",
            "Boton_Play.png",
            this.posiciones[0][0],
            this.cameras.main.centerY,
            (level, button) => this.BplayDown(level, button),
            (level, button) => this.BplayOver(level, button),
            (level, button) => this.BplayOut(level, button)
          );
          this.tiempoRestante = this.tiempo;
        }
      },
      callbackScope: this,
      loop: true,
    });
    //almacena las variables de las imagenes de las teclas a seleccionar
    this.parUPImages = this.ParUP();
    this.parRightUPImages = this.ParRightUP();
    this.parRIGHTImages = this.ParRIGHT();
    this.parDOWNRightImages = this.ParDOWNRight();
    this.parDOWNImages = this.ParDOWN();
    this.parDOWNLEFTImages = this.ParDOWNLEFT();
    this.parLEFTImages = this.ParLEFT();
    this.parUPLEFTImages = this.ParUPLEFT();

    //destruye el boton, cualquier logica por arriba de esto
    this.BPlay.destroy();
  }

  BplayOver(level, button) {
    button.setTexture("Buttons", "Boton_PlayPress.png");
  }
  BplayOut(level, button) {
    button.setTexture("Buttons", "Boton_Play.png");
  }

  //cambio de sprite seleccionado
  cambiarSeleccion() {
    //nuevo par aleatorio
    const par = [Phaser.Math.Between(0, 7), Phaser.Math.Between(0, 7)];
    this.paresAleatorios[this.elcorrecto] = par;
    //actualiza el frame en base al nuevo par
    if (this.elcorrecto == 0 && this.parUPImages) {
      this.parUPImages[0].setFrame(par[0]);
      this.parUPImages[1].setFrame(par[1]);
    }
    if (this.elcorrecto == 1 && this.parRightUPImages) {
      this.parRightUPImages[0].setFrame(par[0]);
      this.parRightUPImages[1].setFrame(par[1]);
    }
    if (this.elcorrecto == 2 && this.parRIGHTImages) {
      this.parRIGHTImages[0].setFrame(par[0]);
      this.parRIGHTImages[1].setFrame(par[1]);
    }
    if (this.elcorrecto == 3 && this.parDOWNRightImages) {
      this.parDOWNRightImages[0].setFrame(par[0]);
      this.parDOWNRightImages[1].setFrame(par[1]);
    }
    if (this.elcorrecto == 4 && this.parDOWNImages) {
      this.parDOWNImages[0].setFrame(par[0]);
      this.parDOWNImages[1].setFrame(par[1]);
    }
    if (this.elcorrecto == 5 && this.parDOWNLEFTImages) {
      this.parDOWNLEFTImages[0].setFrame(par[0]);
      this.parDOWNLEFTImages[1].setFrame(par[1]);
    }
    if (this.elcorrecto == 6 && this.parLEFTImages) {
      this.parLEFTImages[0].setFrame(par[0]);
      this.parLEFTImages[1].setFrame(par[1]);
    }
    if (this.elcorrecto == 7 && this.parUPLEFTImages) {
      this.parUPLEFTImages[0].setFrame(par[0]);
      this.parUPLEFTImages[1].setFrame(par[1]);
    }
    
    
  }
  //ajusta rotacion del player
  ParOrdenado() {
    this.elcorrecto = Phaser.Math.Between(0, 7);
    if (this.elcorrecto == 0) {
      this.player.setRotation(Phaser.Math.DegToRad(180));
      this.pinzas.setRotation(Phaser.Math.DegToRad(180));
    }
    if (this.elcorrecto == 1) {
      this.player.setRotation(Phaser.Math.DegToRad(225));
      this.pinzas.setRotation(Phaser.Math.DegToRad(225));
    }
    if (this.elcorrecto == 2) {
      this.player.setRotation(Phaser.Math.DegToRad(270));
      this.pinzas.setRotation(Phaser.Math.DegToRad(270));
    }
    if (this.elcorrecto == 3) {
      this.player.setRotation(Phaser.Math.DegToRad(315));
      this.pinzas.setRotation(Phaser.Math.DegToRad(315));
    }
    if (this.elcorrecto == 4) {
      this.player.setRotation(Phaser.Math.DegToRad(0));
      this.pinzas.setRotation(Phaser.Math.DegToRad(0));
    }
    if (this.elcorrecto == 5) {
      this.player.setRotation(Phaser.Math.DegToRad(45));
      this.pinzas.setRotation(Phaser.Math.DegToRad(45));
    }
    if (this.elcorrecto == 6) {
      this.player.setRotation(Phaser.Math.DegToRad(90));
      this.pinzas.setRotation(Phaser.Math.DegToRad(90));
    }
    if (this.elcorrecto == 7) {
      this.player.setRotation(Phaser.Math.DegToRad(135));
      this.pinzas.setRotation(Phaser.Math.DegToRad(135));
    }
  }
  verificarTeclas() {
    const parCorrecto = this.paresAleatorios[this.elcorrecto];
    if (
      this.ultimasTeclas.length === 2 &&
      this.ultimasTeclas[0] === parCorrecto[0] &&
      this.ultimasTeclas[1] === parCorrecto[1]
    ) {
      this.Combos++;
      this.score += 20+(this.Combos * 20)*0.2; // Incrementa el score
      this.comboText.setText(`Combos: ${this.Combos}`);
      this.scoreText.setText(`Score: ${this.score}`);
      this.vertecla1?.destroy();
      this.vertecla2?.destroy();
      if (this.player) {
        this.player.setTint(0x00ff00);
        this.time.delayedCall(500, () => {
          this.player.clearTint();
        });
      }
      this.ultimasTeclas.length = 0; // Limpia el array de teclas
    } else {
      this.Combos = 1;
      this.comboText.setText(`Combos: ${this.Combos}`);
      this.vertecla1?.destroy();
      this.vertecla2?.destroy();
      // Cambia el tinte del jugador a rojo por 0.5 segundos y luego lo restaura
      if (this.player) {
        this.player.setTint(0xff0000);
        this.time.delayedCall(500, () => {
          this.player.clearTint();
        });
      }
      this.ultimasTeclas.length = 0; // Limpia el array de teclas
      console.log(this.ultimasTeclas);
    }
    this.cambiarSeleccion();
    this.ultimasTeclas = [];
    this.ParOrdenado();
  }
}
