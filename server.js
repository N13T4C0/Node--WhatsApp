const express = require('express')
const cors = require('cors')
const path = require('path')

const port = process.env.PORT || 3000

const { Server } = require('socket.io')
const { createServer } = require('node:http')

const app = express()
app.use(cors({ origin: '*' }))

const server = createServer(app)
const io = new Server(server, {
  cors: { origin: '*' }
})

var mensajes = []
var usuarios = {}

io.on('connection', (socket) => {
  console.log('Nueva conexion: ' + socket.id)

  // Mandamos el historial de mensajes al que se conecta
  socket.emit('cargar mensajes', mensajes)

  socket.on('disconnect', () => {
    if (usuarios[socket.id]) {
      const nombre = usuarios[socket.id].nombre
      console.log('Se desconecto: ' + nombre)
      delete usuarios[socket.id]
      io.emit('usuarios', Object.values(usuarios))
      //  alguien se fue
      io.emit('sistema', nombre + ' ha salido del chat')
    }
  })

  socket.on('nombreUsuario', (datos) => {
    const nombre = datos.nombreUsuario
    console.log('Entro: ' + nombre)
    socket.nombreUsuario = nombre
    socket.estado = datos.estado || ''
    socket.imagen = datos.imagen || null
    // guardamos tambien el socketId para poder enviar mensajes privados
    usuarios[socket.id] = {
      socketId: socket.id,
      nombre: nombre,
      estado: socket.estado,
      imagen: socket.imagen
    }
    io.emit('usuarios', Object.values(usuarios))
    // cuando nos conectamos
    socket.broadcast.emit('sistema', nombre + ' se ha unido al chat')
  })

  socket.on('mensaje', ({ texto, nombre }) => {
    const msg = {
      texto,
      nombre,
      imagen: socket.imagen || null,
      estado: socket.estado || '',
      timestamp: new Date().toISOString()
    }
    mensajes.push(msg)
    io.emit('chat mensaje', msg)
  })

  // envia el mensaje solo al destinatario y al emisor
  socket.on('mensaje privado', ({ texto, para }) => {
    const msg = {
      texto,
      nombre: socket.nombreUsuario,
      imagen: socket.imagen ,
      timestamp: new Date().toISOString(),
      privado: true
    }
    socket.to(para).emit('mensaje privado', { ...msg, de: socket.id })
    socket.emit('mensaje privado', { ...msg, de: socket.id, para })
  })

  // Indicador de escritura
  socket.on('escribiendo', (nombre) => {
    socket.broadcast.emit('escribiendo', nombre)
  })

  socket.on('parado de escribir', () => {
    socket.broadcast.emit('parado de escribir')
  })
})

// Servimos el build de Vue en produccion
app.use(express.static(path.join(__dirname, 'vue/dist')))

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'vue/dist/index.html'))
})

server.listen(port, () => {
  console.log('Servidor corriendo en http://localhost:' + port)
})
