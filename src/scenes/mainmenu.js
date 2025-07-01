import ButtonHandler from "../buttonHandler.js"; // Importa la clase Boton
// Clase MainMenu, donde se crean los botones, el logo y el fondo del menú principal
export class mainmenu extends Phaser.Scene {
  constructor() {
    // Se asigna una key para despues poder llamar a la escena
    super("mainmenu");
  }
  preload() {
    // Carga de imagenes
    this.load.atlas(
      "Buttons",
      "./public/Assets/Atlas_Buttons.png",
      "./public/Assets/Atlas_Buttons.json"
    );
    this.load.image("BG_MM", "./public/Assets/Background_MM.png");
  }

  create() {
    // Fondo del menú principal
    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "BG_MM");

    const BPLay = new ButtonHandler(
      this,
      "Buttons",
      "Boton_Play.png",
      220,
      462,
      (level, button) => this.BplayDown(level, button),
      (level, button) => this.BplayOver(level, button),
      (level, button) => this.BplayOut(level, button)
    );

    const BControls = new ButtonHandler(
      this,
      "Buttons",
      "Boton_Controls.png",
      220,
      595,
      (level, button) => this.BControlsDown(level, button),
      (level, button) => this.BControlsOver(level, button),
      (level, button) => this.BControlsOut(level, button)
    );

  }
  //handler Boton de play
  BplayDown(level, button) {
    level.scene.start("PracticeTool");
  }
  BplayOver(level, button) {
    button.setTexture("Buttons", "Boton_PlayPress.png");
  }
  BplayOut(level, button) {
    button.setTexture("Buttons", "Boton_Play.png");
  }

  //handler Boton de Controls
  BControlsDown(level, button) {
    //do nothing for the moment;
  }
  BControlsOver(level, button) {
    button.setTexture("Buttons", "Boton_ControlsPress.png");
  }
  BControlsOut(level, button) {
    button.setTexture("Buttons", "Boton_Controls.png");
  }
}
