
import { mainmenu } from "./scenes/mainmenu.js";
import { PracticeTool } from "./scenes/PracticeTool.js";

const config = {
  type: Phaser.AUTO,
  width: 1366,
  height: 768,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 720,
      height: 480,
    },
    max: {
      width: 1920,
      height: 1080,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  //agregar escena al completarla!!!!!!!!!
  scene: [ mainmenu, PracticeTool], // Listado de todas las escenas del juego, en orden
  // La primera escena es con la cual empieza el juego
};

const game = new Phaser.Game(config);
