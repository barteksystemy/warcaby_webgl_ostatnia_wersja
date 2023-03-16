let game;
let net;
let ui;
window.onload = () => {
  game = new Game();
  net = new Net();
  net.login();
};
