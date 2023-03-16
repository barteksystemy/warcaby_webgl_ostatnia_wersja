class Net {
  constructor() {
    this.client = io();
    this.submit = document.getElementById("dialog_submit")
    this.reset = document.getElementById("dialog_reset")
    this.name = document.getElementById("dialog_name")
    this.dialog = document.getElementById("dialog")
    this.navbar = document.getElementById("navbar")
    // czekanie na połączenie się drugiego gracza
    this.root = document.getElementById("root")
    this.div = document.createElement("div")
    this.game = game
    this.waitting = document.createElement("div")
    this.waitting.setAttribute("class", "wait")
    this.kolor
    // true dla bialego, false dla czarnego
    this.klient = true
    this.do_blk_czarnych = false
    this.do_blk_bialych = false
}
  login () {
      this.submit.onclick = () => {
        if (this.name.value == "") {
          this.name.value = "unknown"
        }
        this.client.emit("login", {
        data: this.name.value
      })
        this.dialog.remove()
      }

      this.reset.onclick = () => {
        this.name.value = ""
      }

      this.client.on("isuser", (data) => {
        window.setTimeout(() => {
          alert(data.isuser);
          document.location.reload();
          }, 50);
      })

      this.client.on("refresh", (data) => {
        window.setTimeout(() => {
          alert(data.refresh);
          document.location.reload();
          }, 50);
      })
      this.client.on("first", (data) => {
        this.pierwszy_gracz = data.name
        this.navbar.innerHTML = `
        <div style="padding: 20px; font-size: 40px; color: greenyellow">
          Witaj <span style = "color: white">${data.name}</span>, grasz ${data.color}
        </div>
        `
          this.div.setAttribute("class", "czekaj")
          this.div.innerHTML = `
          <span style = "font-size: 40px; color: greenyellow; font-weight: bold">
          Czekaj na drugiego gracza ...
          </span>
          `
          this.root.append(this.div)
      })

      this.client.on("second", (data) => {
        this.navbar.innerHTML = `
        <div style="padding: 20px; font-size: 40px; color: greenyellow">
          Witaj <span style = "color: white">${data.name}</span>, grasz ${data.color} 
        </div>
        `
        this.game.tworzenie_pionkow()
        this.game.zmiana_kamery()
      })

      this.client.on("dopierwszego", (data) => {
        this.div.remove()
        this.game.tworzenie_pionkow()
      })+
      // tury
      // this.client.on("przerwa_drugiego", (data) => {
      //   this.waitting.innerHTML = `<div style = "font-size: 60px; color: greenyellow; font-weight: bold">
      //   Pozostało: <span style: "color: white">${data.data}</span>
      //   <div>`
      // })

      this.client.on("blokada_czarnych", (data) => {
        this.client.on("do_blokady_czarnych", (data) => {
          this.do_blk_czarnych = true
          // code
          this.game.ruch_na_drugim_kliencie()
        })
        this.root.append(this.waitting)
        this.waitting.innerHTML = `<div style = "font-size: 35px; color: greenyellow; font-weight: bold; display: flex; flex-direction: column; align-items: center; justify-content: center">
          <div>Drugiemu graczowi pozostało: <span style: "color: white">30</span> sekund</div>
          <div>do wykonania ruchu</div>
          <div>`
        let i = 29;
        let interval = setInterval(() => {
          this.waitting.innerHTML = `<div style = "font-size: 35px; color: greenyellow; font-weight: bold; display: flex; flex-direction: column; align-items: center; justify-content: center">
          <div>Drugiemu graczowi pozostało: <span style: "color: white">${i}</span> sekund</div>
          <div>do wykonania ruchu</div>
          <div>`
          if (this.do_blk_czarnych == true) {
            this.do_blk_czarnych = false
            clearInterval(interval)
            this.waitting.remove()
            this.client.emit("test")
          } else if (i == 0) {
            clearInterval(interval)
            this.waitting.remove()
            this.client.emit("test")
          }
          i--
        }, 1000)
      })

      this.client.on("blokada_białych", (data) => {
        this.client.on("do_blokady_bialych", (data) => {
          this.do_blk_bialych = true
          // code
          this.game.ruch_na_drugim_kliencie()
        })
        this.root.append(this.waitting)
        this.waitting.innerHTML = `<div style = "font-size: 35px; color: greenyellow; font-weight: bold; display: flex; flex-direction: column; align-items: center; justify-content: center">
          <div>Drugiemu graczowi pozostało: <span style: "color: white">30</span> sekund</div>
          <div>do wykonania ruchu</div>
          <div>`
        let i = 29;
        let interval = setInterval(() => {
          this.waitting.innerHTML = `<div style = "font-size: 35px; color: greenyellow; font-weight: bold; display: flex; flex-direction: column; align-items: center; justify-content: center">
          <div>Drugiemu graczowi pozostało: <span style: "color: white">${i}</span> sekund</div>
          <div>do wykonania ruchu</div>
          <div>`
          if (this.do_blk_bialych == true) {
            this.do_blk_bialych = false
            clearInterval(interval)
            this.waitting.remove()
            this.client.emit("test2")
          } else if (i == 0) {
            clearInterval(interval)
            this.waitting.remove()
            this.client.emit("test2")
          }
          i--
        }, 1000)
      })

      this.client.on("ruch_bialego", (data) => {
      this.klient = true
        this.game.funct = true
        this.game.klikniecie_w_pionka()
        let i = 0;
        let interval = setInterval(() => {
          i++
          if (game.stop_bialego == true) {
            this.pomoc = this.game.index
            this.client.emit("do_serwera_bialego")
            game.stop_bialego = false
            this.game.funct = false
            clearInterval(interval)
          } else if (i == 30) {
            this.game.funct = false
            clearInterval(interval)
          }
        }, 1000)
      })

      this.client.on("ruch_czarnego", (data) => {
        this.klient = false
        this.game.funct = true
        this.game.klikniecie_w_pionka()
        let i = 0;
        let interval = setInterval(() => {
          i++
          if (game.stop_czarnego == true) {
            this.pomoc = this.game.index
            this.client.emit("do_serwera_czarnego")
            game.stop_czarnego = false
            this.game.funct = false
            clearInterval(interval)
          } else if (i == 30) {
            this.game.funct = false
            clearInterval(interval)
          }
        }, 1000)
      })

  }
}

