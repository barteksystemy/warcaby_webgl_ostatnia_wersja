const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app); // tu zmiana
const { Server } = require("socket.io");
const socketio = new Server(server);
app.use(express.json())
app.use(express.static("static"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
let users = [];
let n = 0;
let l = 0;
socketio.on('connection', (client) => {
  client.on("login", (data) => {
    if (n == 0) {
    client.emit("first", {
        name: data.data,
        color: "białymi"
      })
  } else if (n == 1) {
    client.emit("second", {
        name: data.data,
        color: "czarnymi",
      })
      client.broadcast.emit("dopierwszego", {
        data: "usun"
      })
      
      client.emit("blokada_czarnych")
      client.broadcast.emit("ruch_bialego", {
        kolorek: 'bialy'
      })
  }
    //
    client.on("test", (data) => {
        client.broadcast.emit("blokada_białych")
        client.emit("ruch_czarnego", {
        kolorek: 'czarny'
      })
      })
      client.on("test2", (data) => {
        client.broadcast.emit("blokada_czarnych")
        client.emit("ruch_bialego", {
        kolorek: 'bialy'
      })
      })
    //
    if (data.data == users[0]) {
      client.emit("isuser", {
        isuser: "User o tej nazwie jest już zalogowany!"
      })
    }
   users.push(data.data)
   n++
   if (n == 2) n = 0; 
})
  client.on("disconnect", (reason) => {
    users.splice(users.indexOf(client.id), 1)
      client.broadcast.emit("refresh", {
        refresh: 'Twój przeciwnik się rozłączył!!'
      })
  })
  
  client.on("do_serwera_bialego", (data) => {
    client.broadcast.emit("do_blokady_czarnych")
  })

  client.on("do_serwera_czarnego", (data) => {
    client.broadcast.emit("do_blokady_bialych")
  })

  client.on("bialo", (data) => {
    client.broadcast.emit("koniec_bialo", {
      data: data.data
    })
  })

});

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/static/index.html");
});

server.listen(3000, () => {
  console.log('server listening on 3000');
});



