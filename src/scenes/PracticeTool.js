import ButtonHandler from "../buttonHandler.js"; // Importa la clase Boton

export class PracticeTool extends Phaser.Scene {
  constructor() {
    // Se asigna una key para despues poder llamar a la escena
    super("PracticeTool");
  }

  preload() {
    // Carga de imagenes
    this.load.image("pj", "./public/Assets/PJ-00.png");
    this.load.image("pj2", "./public/Assets/Pinzas-00.png");
    this.load.image("BG_PT", "./public/Assets/Background-PracticeTool.png");
    this.load.spritesheet("teclas", "Assets/teclas.png", {
      frameWidth: 22,
      frameHeight: 22,
    });
  }

  create() {
    // Fondo del menú principal
    this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "BG_PT"
    );
    // Array para determinar las combinaciones de teclas
    this.paresAleatorios = [];
    for (let i = 0; i < 4; i++) {
      const par = [Phaser.Math.Between(0, 7), Phaser.Math.Between(0, 7)];
      this.paresAleatorios.push(par);
      console.log("par ordenado: ", par);
    }

    // Crear dos imágenes usando los valores del primer par aleatorio
    this.ParDOWN = [
      this.add.image(
        this.cameras.main.centerX - 15,
        this.cameras.main.centerY + 200,
        "teclas",
        this.paresAleatorios[0][0]
      ),
      this.add.image(
        this.cameras.main.centerX + 15,
        this.cameras.main.centerY + 200,
        "teclas",
        this.paresAleatorios[0][1]
      ),
    ];

    this.ParUP = [
      this.add.image(
        this.cameras.main.centerX - 15,
        this.cameras.main.centerY - 200,
        "teclas",
        this.paresAleatorios[1][0]
      ),
      this.add.image(
        this.cameras.main.centerX + 15,
        this.cameras.main.centerY - 200,
        "teclas",
        this.paresAleatorios[1][1]
      ),
    ];

    this.ParLEFT = [
      this.add.image(
        this.cameras.main.centerX - 230,
        this.cameras.main.centerY,
        "teclas",
        this.paresAleatorios[2][0]
      ),
      this.add.image(
        this.cameras.main.centerX - 200,
        this.cameras.main.centerY,
        "teclas",
        this.paresAleatorios[2][1]
      ),
    ];

    this.ParRIGHT = [
      this.add.image(
        this.cameras.main.centerX + 200,
        this.cameras.main.centerY,
        "teclas",
        this.paresAleatorios[3][0]
      ),
      this.add.image(
        this.cameras.main.centerX + 230,
        this.cameras.main.centerY,
        "teclas",
        this.paresAleatorios[3][1]
      ),
    ];

    // agregar controles de cursor
    this.cursors = this.input.keyboard.createCursorKeys();
    // agregar controles de teclas W E S D
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

    this.BPlay = new ButtonHandler(
      this,
      "Buttons",
      "Boton_Play.png",
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      (level, button) => this.BplayDown(level, button),
      (level, button) => this.BplayOver(level, button),
      (level, button) => this.BplayOut(level, button)
    );

    // Cuenta regresiva
    this.tiempo = 60;
    this.tiempoRestante = this.tiempo; // segundos
    this.timerText = this.add
      .text(this.cameras.main.centerX, 100, `Tiempo: ${this.tiempoRestante}`, {
        fontFamily: '"Tektur", Arial, sans-serif',
        fontSize: "64px",
        color: "#fff",
      })
      .setOrigin(0.5);

    // Array para acumular las últimas 2 teclas presionadas
    this.ultimasTeclas = [];

    // Función para registrar la tecla presionada
    const registrarTecla = (tecla) => {
      this.ultimasTeclas.push(tecla);
      if (this.ultimasTeclas.length >= 2) {
        this.verificarTeclas();
      }
      console.log("Últimas teclas:", this.ultimasTeclas);
    };

    // Registrar eventos para las flechas
    this.input.keyboard.on("keydown-UP", () => registrarTecla(2));
    this.input.keyboard.on("keydown-DOWN", () => registrarTecla(3));
    this.input.keyboard.on("keydown-LEFT", () => registrarTecla(0));
    this.input.keyboard.on("keydown-RIGHT", () => registrarTecla(1));

    // Mueve los listeners aquí:
    UP.on("down", () => {
      registrarTecla(4);
      console.log("Tecla W presionada");
    });
    DOWN.on("down", () => {
      registrarTecla(6);
      console.log("Tecla S presionada");
    });
    LEFT.on("down", () => {
      registrarTecla(5);
      console.log("Tecla E presionada");
    });
    RIGHT.on("down", () => {
      registrarTecla(7);
      console.log("Tecla D presionada");
    });
    this.input.keyboard.on("keydown-X", () => {
      this.verificarTeclas();
      console.log("Tecla X presionada");
    });

    // Inicializar el score y el historial de líneas
    this.score = 0;
    this.scoreLines = [[]];

    // Mostrar el score en la esquina superior izquierda
    this.scoreText = this.add.text(20, 20, "Score: 0", {
      fontFamily: '"Tektur", Arial, sans-serif',
      fontSize: "32px",
      color: "#fff",
      align: "left",
    }).setOrigin(0, 0);

    // Sobrescribir verificarTeclas para actualizar el score
    const originalVerificarTeclas = this.verificarTeclas.bind(this);
    this.verificarTeclas = () => {
      const parCorrecto = this.paresAleatorios[this.elcorrecto];
      if (
      this.ultimasTeclas.length === 2 &&
      this.ultimasTeclas[0] === parCorrecto[0] &&
      this.ultimasTeclas[1] === parCorrecto[1]
      ) {
      this.score++;
      this.scoreLines[this.scoreLines.length - 1].push(1);
      this.scoreText.setText(`Score: ${this.score}`);
      }
      originalVerificarTeclas();
    };

    // Sobrescribir BplayDown para agregar una nueva línea en el score
    const originalBplayDown = this.BplayDown.bind(this);
    this.BplayDown = (level, button) => {
      this.scoreLines.push([]);
      originalBplayDown(level, button);
    };
  }

  BplayDown(level, button) {
    this.timerText.setText(`Tiempo: ${this.tiempoRestante}`);
    if (!this.player) {
      this.player = this.add.image(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      "pj"
      );
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
          this.BPlay = new ButtonHandler(
            this,
            "Buttons",
            "Boton_Play.png",
            this.cameras.main.centerX,
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
    this.BPlay.destroy();
    console.log("el boton fue presionado");
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
    if (this.elcorrecto == 0) {
      this.ParDOWN[0].setFrame(par[0]);
      this.ParDOWN[1].setFrame(par[1]);
    }
    if (this.elcorrecto == 1) {
      this.ParUP[0].setFrame(par[0]);
      this.ParUP[1].setFrame(par[1]);
    }
    if (this.elcorrecto == 2) {
      this.ParLEFT[0].setFrame(par[0]);
      this.ParLEFT[1].setFrame(par[1]);
    }
    if (this.elcorrecto == 3) {
      this.ParRIGHT[0].setFrame(par[0]);
      this.ParRIGHT[1].setFrame(par[1]);
    }

  }
  //ajusta rotacion del player
  ParOrdenado() {
    this.elcorrecto = Phaser.Math.Between(0, 3);
    if (this.elcorrecto == 0) {
      this.player.setRotation(Phaser.Math.DegToRad(0));
    }
    if (this.elcorrecto == 1) {
      this.player.setRotation(Phaser.Math.DegToRad(180));
    }
    if (this.elcorrecto == 2) {
      this.player.setRotation(Phaser.Math.DegToRad(90));
    }
    if (this.elcorrecto == 3) {
      this.player.setRotation(Phaser.Math.DegToRad(270));
    }
  }
  verificarTeclas() {
    const parCorrecto = this.paresAleatorios[this.elcorrecto];
    if (
      this.ultimasTeclas.length === 2 &&
      this.ultimasTeclas[0] === parCorrecto[0] &&
      this.ultimasTeclas[1] === parCorrecto[1]
    ) {
      
      console.log("¡Combinación correcta!");
      // Aquí puedes agregar lógica extra, como sumar puntos o mostrar feedback
    } else {
      console.log("Combinación incorrecta");
    }
    this.cambiarSeleccion();
    this.ultimasTeclas = [];
    this.ParOrdenado();
    
  }
}
