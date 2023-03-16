class Game {
  constructor() {
    this.net = net;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x2b2b28);
    this.renderer.setSize(window.innerWidth, window.innerHeight - 102);
    document.getElementById("root").append(this.renderer.domElement);

    this.szachownica = [
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
    ];

    this.pionki = [
      [0, 2, 0, 2, 0, 2, 0, 2],
      [2, 0, 2, 0, 2, 0, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 0],
    ];

    this.camera.position.set(0, 8, 10);
    this.camera.lookAt(this.scene.position);

    this.axes = new THREE.AxesHelper(1000);
    this.scene.add(this.axes);
    this.tworzenie_planszy();
    this.render(); // wywołanie metody render
    // raycastery
    this.funct = false;
    this.raycaster = new THREE.Raycaster(); // obiekt Raycastera symulujący "rzucanie" promieni
    this.mouseVector = new THREE.Vector2() // ten wektor czyli pozycja w przestrzeni 2D na ekranie(x,y) wykorzystany będzie do określenie pozycji myszy na ekranie, a potem przeliczenia na pozycje 3D
    // pierwsza tekstura
    this.first_texture;
    this.color;
    this.flaga2 = true;
    this.flaga3 = true;
    this.pattern_bialy;
    this.pattern_czerwony;
    this.poprzedni_pionek;
    this.zmienna;
    this.klikniete_pole;
    this.stop_bialego;
    this.stop_czarnego;
    this.tablica_czarnych;
    this.tablica_pionkow;
    this.dwie_mozliwosci;
    this.lewy;
    this.prawy;
    this.flaga4 = 0;
    this.index;
    this.client = io();
  }

  tworzenie_planszy() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material1 = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide, // dwustronny
      map: new THREE.TextureLoader().load("mats/bialy_kafelek.jpg"), // plik tekstury
    });
    const material2 = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide, // dwustronny
      map: new THREE.TextureLoader().load("mats/czarny_kafelek.jpg"), // plik tekstury
    });
    let tab = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.szachownica[i][j] == 1) {
          this.kafelek = new THREE.Mesh(geometry, material1);
        } else if (this.szachownica[i][j] == 0) {
          this.kafelek = new THREE.Mesh(geometry, material2);
        }
        this.kafelek.position.set(i - 3.5, 0, j - 3.5);
          tab.push(this.kafelek)
          this.scene.add(this.kafelek);
      }
    }
    this.tablica = tab
    // console.log(this.tablica);
  }

  tworzenie_pionkow() {
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 24);
    const material1 = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide, // dwustronny
      map: new THREE.TextureLoader().load("mats/bialy_pionek.jpg"), // plik tekstury
    });
    this.pattern_bialy = material1;
    const material2 = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide, // dwustronny
      map: new THREE.TextureLoader().load("mats/czerwony_pionek.jpg"), // plik tekstury
    });
    this.pattern_czerwony = material2;
    let tab = []
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.pionki[i][j] == 2) {
          this.kafelek2 = new THREE.Mesh(geometry, material2);
          this.kafelek2.position.set(j - 3.5, 0.7, i - 3.5);
          tab.push(this.kafelek2)
          this.scene.add(this.kafelek2);
        } else if (this.pionki[i][j] == 1) {
          this.kafelek2 = new THREE.Mesh(geometry, material1);
          this.kafelek2.position.set(j - 3.5, 0.7, i - 3.5);
          tab.push(this.kafelek2)
          this.scene.add(this.kafelek2);
        }
      }
    }
    this.tablica_pionkow = tab;
    console.log(this.tablica_pionkow);
  }

  zmiana_kamery() {
    this.camera.position.set(0, 8, -10);
    this.camera.lookAt(this.scene.position);
  }

  klikniecie_w_pionka () {
    window.addEventListener("mousedown", (event) => {
    // console.log(e);
    if (this.funct == true) {
    this.mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseVector.y = -(event.clientY / (window.innerHeight + 100)) * 2 + 1;
    this.raycaster.setFromCamera(this.mouseVector, this.camera);
    this.intersects = this.raycaster.intersectObjects(this.scene.children);
      if (this.intersects.length > 0) {
        // zerowy w tablicy czyli najbliższy kamery obiekt to ten, którego potrzebujemy:
        // console.log(this.intersects[0].object);
        if (this.intersects[0].object.geometry.type == "CylinderGeometry") {
          // console.log(this.intersects[0].object);
            this.first_texture = this.intersects[0].object.material.map.source.data.currentSrc
            const material = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide, // dwustronny
                map: new THREE.TextureLoader().load("mats/yellow.jpg"), // plik tekstury
              });
            const material2 = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide, // dwustronny
                map: new THREE.TextureLoader().load("mats/green.jpg"), // plik tekstury
              });
            const material3 = new THREE.MeshBasicMaterial({
                side: THREE.DoubleSide, // dwustronny
                map: new THREE.TextureLoader().load("mats/czarny_kafelek.jpg"), // plik tekstury
              });
            if (this.first_texture == 'http://localhost:3000/mats/bialy_pionek.jpg') {
              if (this.flaga2 == true) { // pierwsze klikniecie
                this.poprzedni_pionek = this.intersects[0].object
                // this.poprzedni_pionek.position
                this.tablica.forEach(element => {
                  // mozliwosc na lewo
                  if ((element.position.x + 1 == this.poprzedni_pionek.position.x) && (element.position.z + 1 == this.poprzedni_pionek.position.z)) {
                    // element.material = material2
                    this.lewy = element
                    this.lewy.material = material2
                  }
                  // mozliwosc na prawo
                  if ((element.position.x - 1 == this.poprzedni_pionek.position.x) && (element.position.z + 1 == this.poprzedni_pionek.position.z)) {
                    // element.material = material2
                    this.prawy = element
                    this.prawy.material = material2
                  }
                });
                this.intersects[0].object.material = material;
                this.flaga2 = false;
              } else if (this.flaga2 == false) { // drugie klikniecie
                this.poprzedni_pionek.material = this.pattern_bialy
                this.prawy.material = material3
                this.lewy.material = material3
                this.intersects[0].object.material = material
                this.poprzedni_pionek = this.intersects[0].object
                this.tablica.forEach(element => {
                  // mozliwosc na lewo
                  if ((element.position.x + 1 == this.poprzedni_pionek.position.x) && (element.position.z + 1 == this.poprzedni_pionek.position.z)) {
                    // element.material = material2
                    this.lewy = element
                    this.lewy.material = material2
                  }
                  // mozliwosc na prawo
                  if ((element.position.x - 1 == this.poprzedni_pionek.position.x) && (element.position.z + 1 == this.poprzedni_pionek.position.z)) {
                    // element.material = material2
                    this.prawy = element
                    this.prawy.material = material2
                  }
                });
              }
              this.flaga3 = true;
            } else if (this.first_texture == 'http://localhost:3000/mats/czerwony_pionek.jpg') {
              if (this.flaga3 == true) { // pierwsze klikniecie
                this.poprzedni_pionek = this.intersects[0].object
                this.tablica.forEach(element => {
                  // mozliwosc na lewo
                  if ((element.position.x + 1 == this.poprzedni_pionek.position.x) && (element.position.z + 1 == this.poprzedni_pionek.position.z)) {
                    // element.material = material2
                    this.lewy = element
                    this.lewy.material = material2
                  }
                  // mozliwosc na prawo
                  if ((element.position.x - 1 == this.poprzedni_pionek.position.x) && (element.position.z + 1 == this.poprzedni_pionek.position.z)) {
                    // element.material = material2
                    this.prawy = element
                    this.prawy.material = material2
                  }
                });
                this.intersects[0].object.material = material
                this.flaga3 = false;
              } else if (this.flaga3 == false) { // drugie klikniecie
                this.poprzedni_pionek.material = this.pattern_czerwony
                this.prawy.material = material3
                this.lewy.material = material3
                this.intersects[0].object.material = material
                this.poprzedni_pionek = this.intersects[0].object
                this.tablica.forEach(element => {
                  // mozliwosc na lewo
                  if ((element.position.x - 1 == this.poprzedni_pionek.position.x) && (element.position.z - 1 == this.poprzedni_pionek.position.z)) {
                    // element.material = material2
                    this.lewy = element
                    this.lewy.material = material2
                  }
                  // mozliwosc na prawo
                  if ((element.position.x + 1 == this.poprzedni_pionek.position.x) && (element.position.z - 1 == this.poprzedni_pionek.position.z)) {
                    // element.material = material2
                    this.prawy = element
                    this.prawy.material = material2
                  }
                });
              }
              this.flaga2 = true;
            }
            // this.intersects[0].object.material.map.source.data.currentSrc = "http://localhost:3000/mats/yellow.png"
        }

        if (this.intersects[0].object.geometry.type == "BoxGeometry" &&  this.intersects[0].object
        .material.map.source.data.currentSrc == 'http://localhost:3000/mats/green.jpg') {
          this.flaga4 = 0;
          this.tablica_pionkow.forEach(element => {
            if ((element.position.x != this.intersects[0].object.position.x) && (element.position.z != this.intersects[0].object.position.z)) {
              this.flaga4 + 0;
            } else if ((element.position.x == this.intersects[0].object.position.x) && (element.position.z == this.intersects[0].object.position.z)){
              this.flaga4++;
              console.log("kliknales na stojący tu pionek!");
              console.log("(x,z) pionka: " + element.position.x + "," + element.position.z);
            }
          });
          if (this.flaga4 == 0) {
            this.index = this.intersects[0].object
          // this.ruch = this.tablica_pionkow[this.tablica_pionkow.indexOf(this.intersects[0].object)]
          this.prawy.material = this.tablica[1].material
          this.lewy.material = this.tablica[1].material
          this.klikniete_pole = this.intersects[0].object.position
          this.ruch = this.intersects[0].object.position
          //
          // this.poprzedni_pionek = this.ruch

          if (net.klient == true) { // bialy
            if ((this.klikniete_pole.x - 1 == this.poprzedni_pionek.position.x) && (this.klikniete_pole.z + 1 == this.poprzedni_pionek.position.z)) {
            new TWEEN.Tween(this.poprzedni_pionek.position) // ruch na prawo
              .to({ x: this.klikniete_pole.x, z: this.klikniete_pole.z }, 500 ) // do jakiej pozycji, w jakim czasie
              .easing(TWEEN.Easing.Quintic.Out) // typ easingu (zmiana w czasie)
              .start()
              //
              this.index = this.poprzedni_pionek
              //
            this.poprzedni_pionek.material = this.pattern_bialy
            this.stop_bialego = true;
          } else if ((this.klikniete_pole.x + 1 == this.poprzedni_pionek.position.x) && (this.klikniete_pole.z + 1 == this.poprzedni_pionek.position.z)) {
            new TWEEN.Tween(this.poprzedni_pionek.position) // ruch na lewo
              .to({ x: this.klikniete_pole.x, z: this.klikniete_pole.z }, 500 ) // do jakiej pozycji, w jakim czasie
              .easing(TWEEN.Easing.Quintic.Out) // typ easingu (zmiana w czasie)
              .start()
              //
              this.index = this.poprzedni_pionek
              this.client.emit("bialo", {
                data: this.index
              })
              //
            this.poprzedni_pionek.material = this.pattern_bialy
            this.stop_bialego = true;
          }
          } else if (net.klient == false) { // czarny
            if ((this.klikniete_pole.x + 1 == this.poprzedni_pionek.position.x) && (this.klikniete_pole.z - 1 == this.poprzedni_pionek.position.z)) {
            new TWEEN.Tween(this.poprzedni_pionek.position) // ruch na prawo
              .to({ x: this.klikniete_pole.x, z: this.klikniete_pole.z }, 500 ) // do jakiej pozycji, w jakim czasie
              .easing(TWEEN.Easing.Quintic.Out) // typ easingu (zmiana w czasie)
              .start()
              //
              this.index = this.poprzedni_pionek
              //
            this.poprzedni_pionek.material = this.pattern_czerwony
            this.stop_czarnego = true;
          } else if ((this.klikniete_pole.x - 1 == this.poprzedni_pionek.position.x) && (this.klikniete_pole.z - 1 == this.poprzedni_pionek.position.z)) {
            new TWEEN.Tween(this.poprzedni_pionek.position) // ruch na lewo
              .to({ x: this.klikniete_pole.x, z: this.klikniete_pole.z }, 500 ) // do jakiej pozycji, w jakim czasie
              .easing(TWEEN.Easing.Quintic.Out) // typ easingu (zmiana w czasie)
              .start()
              //
              this.index = this.poprzedni_pionek
              //
              this.poprzedni_pionek.material = this.pattern_czerwony
              this.stop_czarnego = true;
          }
          }
          }
        } 
        // działania muszą być zakończone przed tym ifem
        }
      }
      }); 
  }

  ruch_na_drugim_kliencie () {
      this.client.on("koniec_bialo", (data) => {
                console.log(data);
              })
  }

  render = () => {
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    TWEEN.update();
  };
}
