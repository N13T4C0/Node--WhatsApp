const express = require('express')
const port = 3000
const { Server } = require('socket.io');
const { createServer } = require('node:http');




const app = express();
const server = createServer(app);
const io = new Server(server);
var count =0;
var message="";
var mensajes = [];

io.on('connection', (socket) => {
  console.log('conectado: ',);
  count++
  io.emit("contador", count);
  io.emit("cargar mensajes", mensajes);

  socket.on('disconnect', () => {
    console.log('user disconnected');
    count--;
    console.log(socket);
      io.emit("contador", count);

  });


  socket.on("mensaje", ({ texto, nombre }) =>{
    const msgConNombre = nombre + ": " + texto;
    console.log("mensaje recibido: " + msgConNombre);
    mensajes.push(msgConNombre);
    io.emit("chat mensaje", msgConNombre);
  });

  socket.on("nombreUsuario",(nombre)=>{
    const nombreUsuario = nombre.nombreUsuario;
    console.log("Ha entrado "+nombreUsuario);
    socket.broadcast.emit("nombreUsuario", nombre);
    socket.nombreUsuario = nombreUsuario;
  })
});

app.use(express.static('public'))


app.get('/jose', (req, res) => {
  res.send('<h1>Hola Jose</h1>')
})



app.get('/', (req, res) => {
  res.send('<img src="./sergioKik.jpeg" />')

  
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
