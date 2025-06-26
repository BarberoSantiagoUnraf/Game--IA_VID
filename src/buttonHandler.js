// Clase Boton, para no repetir tanto codigo
// recibe:
// - x, y: coordenadas del boton
// - pointer down handler: funcion que se ejecuta al hacer click
// - pointer over handler: funcion que se ejecuta al pasar el mouse por encima
// - pointer out handler: funcion que se ejecuta al quitar el mouse
class ButtonHandler {
  constructor(
    scene,
    atlas,
    key,
    x,
    y,
    pointerDownHandler,
    pointerOverHandler,
    pointerOutHandler
  ) {
    this.Button = scene.add
      .image(x, y, atlas, key)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => pointerDownHandler(scene, this.Button))
      .on("pointerover", () => pointerOverHandler(scene, this.Button))
      .on("pointerout", () => pointerOutHandler(scene, this.Button));
  }

  destroy() {
    if (this.Button) {
      this.Button.destroy();
      this.Button = null;
    }
  }
}

export default ButtonHandler;
