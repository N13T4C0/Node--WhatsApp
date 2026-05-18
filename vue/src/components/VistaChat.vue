<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { io } from 'socket.io-client'

const props = defineProps({
  usuario: Object
})

// En dev conecta directo al backend; en prod usa la ruta relativa
const socket = import.meta.env.DEV ? io('http://localhost:3000') : io({ path: '/socket.io' })

const mensajes = ref([])
const usuarios = ref([])
const texto = ref('')
const quienEscribe = ref('')
const mensajesDiv = ref(null)
const privadoDiv = ref(null)

// usuario seleccionado para chat privado (objeto completo con socketId)
const usuarioPrivado = ref(null)
// mensajes privados guardados por socketId del otro usuario
const mensajesPrivados = ref({})
const textoPrivado = ref('')
// para la notificacion
const mensajeNuevo = ref(null)

let timerEscribiendo = null

// mensajes del chat privado activo
const mensajesDelPrivado = computed(() => {
  if (!usuarioPrivado.value) return []
  return mensajesPrivados.value[usuarioPrivado.value.socketId] || []
})

// Al conectar, enviamos nuestros datos al servidor para aparecer en la lista de usuarios
onMounted(() => {
  socket.emit('nombreUsuario', {
    nombreUsuario: props.usuario.nombre,
    estado: props.usuario.estado,
    imagen: props.usuario.imagen
  })
})

onUnmounted(() => {
  socket.disconnect()
})

socket.on('cargar mensajes', (arr) => {
  arr.forEach(m => mensajes.value.push(m))
})

socket.on('chat mensaje', (msg) => {
  mensajes.value.push(msg)
})

socket.on('usuarios', (lista) => {
  usuarios.value = lista
})

socket.on('sistema', (msgSistema) => {
  mensajes.value.push({ sistema: true, texto: msgSistema })
})

socket.on('escribiendo', (nombre) => {
  quienEscribe.value = nombre
})

socket.on('parado de escribir', () => {
  quienEscribe.value = ''
})

// recibimos un mensaje privado y lo guardamos bajo el socketId del otro
socket.on('mensaje privado', (msg) => {
  let clave
  if (msg.esReceptor) {
    clave = msg.de   // me lo enviaron a mí
  } else {
    clave = msg.para // yo lo envié
  }
  if (!mensajesPrivados.value[clave]) mensajesPrivados.value[clave] = []
  mensajesPrivados.value[clave].push(msg)



  // mostrar noti solo si me lo enviaron ami y no tengo ese chat abierto
  if (msg.esReceptor && (!usuarioPrivado.value || usuarioPrivado.value.socketId != msg.de)) {
    mensajeNuevo.value = msg
  }
})

function enviar() {
  if (!texto.value.trim()) return
  socket.emit('mensaje', { texto: texto.value.trim(), nombre: props.usuario.nombre })
  texto.value = ''
  socket.emit('parado de escribir')
  clearTimeout(timerEscribiendo)
}

// cada vez q escribimos en el input salta la funcion y a los 2 sec se para
function onEscribiendo() {
  socket.emit('escribiendo', props.usuario.nombre)
  clearTimeout(timerEscribiendo)
  timerEscribiendo = setTimeout(() => {
    socket.emit('parado de escribir')
  }, 2000)
}

// abrimos el panel privado con el usuario clickado
function abrirPrivado(u) {
  if (u.nombre == props.usuario.nombre) return
  usuarioPrivado.value = u
}

function cerrarPrivado() {
  usuarioPrivado.value = null
  textoPrivado.value = ''
}

function enviarPrivado() {
  if (!textoPrivado.value.trim() || !usuarioPrivado.value) return
  socket.emit('mensaje privado', {
    texto: textoPrivado.value.trim(),
    para: usuarioPrivado.value.socketId
  })
  textoPrivado.value = ''
}

function formatHora(iso) {
  return new Date(iso).toLocaleTimeString()
}


</script>

<template>
  <div class='chat-app'>

    <!-- PANEL IZQUIERDO -->
    <div class='panel-izq'>
      <div class='panel-header'>
        <img :src='usuario.imagen' class='mi-avatar' referrerpolicy="no-referrer" />
        <div class='mi-info'>
          <span class='mi-nombre'>{{ usuario.nombre }}</span>
          <span class='mi-estado'>{{ usuario.estado }}</span>
        </div>
      </div>

      <div class='panel-titulo'>Conectados ({{ usuarios.length }})</div>

      <div class='lista-usuarios'>
        <div
          v-for='(u, i) in usuarios'
          :key='i'
          class='usuario-item'
          :class="{ 'soy-yo': u.nombre === usuario.nombre, 'seleccionado-privado': usuarioPrivado && usuarioPrivado.socketId === u.socketId }"
          @click='abrirPrivado(u)'
        >
          <div class='avatar-wrap'>
            <img :src='u.imagen' class='usuario-avatar' referrerpolicy="no-referrer" />
            <span class='punto-verde'></span>
          </div>
          <div class='usuario-datos'>
            <span class='usuario-nombre'>
              {{ u.nombre }}
              <span v-if='u.nombre === usuario.nombre' class='tu-label'>(tú)</span>
            </span>
            <span class='usuario-estado'>{{ u.estado }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL SALA GENERAL -->
    <div class='panel-chat'>
      <div class='chat-header'>
        <div class='chat-header-info'>
          <span class='chat-titulo'>Sala general</span>
          <span class='chat-subtitulo'>{{ usuarios.length }} participantes</span>
        </div>
      </div>

      <div class='mensajes' ref='mensajesDiv'>
        <div v-for='(msg, i) in mensajes' :key='i'>
          <div v-if='msg.sistema' class='msg-sistema'>{{ msg.texto }}</div>
          <div
            v-else
            class='burbuja-wrap'
            :class="msg.nombre === usuario.nombre ? 'derecha' : 'izquierda'"
          >
            <img v-if="msg.nombre !== usuario.nombre" :src='msg.imagen' class='burbuja-avatar' referrerpolicy="no-referrer" />
            <div class='burbuja' :class="msg.nombre === usuario.nombre ? 'burbuja-mia' : 'burbuja-suya'">
              <span v-if="msg.nombre !== usuario.nombre" class='burbuja-autor'>{{ msg.nombre }}</span>
              <span class='burbuja-texto'>{{ msg.texto }}</span>
              <span class='burbuja-hora'>{{ formatHora(msg.timestamp) }}</span>
            </div>
          </div>
        </div>
        <div v-if='quienEscribe' class='escribiendo'>{{ quienEscribe }} está escribiendo...</div>
      </div>

      <div class='chat-input'>
        <input
          v-model='texto'
          type='text'
          placeholder='Escribe un mensaje...'
          @keyup.enter='enviar'
          @input='onEscribiendo'
        />
        <button @click='enviar'>&#9658;</button>
      </div>
    </div>

    <!-- PANEL PRIVADO: solo se muestra cuando hay un usuario seleccionado -->
    <div v-if='usuarioPrivado' class='panel-privado'>
      <div class='chat-header privado-header'>
        <div class='chat-header-info'>
          <img :src='usuarioPrivado.imagen' class='privado-avatar' referrerpolicy="no-referrer" />
          <div>
            <span class='chat-titulo'>{{ usuarioPrivado.nombre }}</span>
            <span class='chat-subtitulo'>Mensaje privado</span>
          </div>
        </div>
        <!-- boton para cerrar el chat privado -->
        <button class='btn-cerrar' @click='cerrarPrivado'>✕</button>
      </div>

      <div class='mensajes' ref='privadoDiv'>
        <div v-for='(msg, i) in mensajesDelPrivado' :key='i'>
          <div
            class='burbuja-wrap'
            :class="msg.nombre === usuario.nombre ? 'derecha' : 'izquierda'"
          >
            <img v-if="msg.nombre !== usuario.nombre" :src='msg.imagen' class='burbuja-avatar' referrerpolicy="no-referrer" />
            <div class='burbuja' :class="msg.nombre === usuario.nombre ? 'burbuja-mia' : 'burbuja-suya'">
              <span class='burbuja-texto'>{{ msg.texto }}</span>
              <span class='burbuja-hora'>{{ formatHora(msg.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class='chat-input'>
        <input
          v-model='textoPrivado'
          type='text'
          :placeholder="'Mensaje privado a ' + usuarioPrivado.nombre + '...'"
          @keyup.enter='enviarPrivado'
        />
        <button @click='enviarPrivado'>&#9658;</button>
      </div>
    </div>

  </div>

  <!-- noti de mensaje privado -->
  <div v-if='mensajeNuevo' class='noti-privada'>
    <div class='noti-header'>
      <img :src='mensajeNuevo.imagen' class='noti-avatar' referrerpolicy="no-referrer" />
      <div class='noti-info'>
        <span class='noti-nombre'>{{ mensajeNuevo.nombre }}</span>
        <span class='noti-label'>Mensaje privado</span>
      </div>
      <button class='noti-cerrar' @click='mensajeNuevo = null'>✕</button>
    </div>
    <p class='noti-texto'>{{ mensajeNuevo.texto }}</p>
  </div>

</template>

<style scoped>
.chat-app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.panel-izq {
  width: 380px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(rgba(5,5,10,0.78), rgba(5,5,10,0.78)),
    url('https://i.pinimg.com/736x/53/96/bb/5396bbd0ae39fe4067dc60059b35c2f1.jpg') right/cover no-repeat;
  border-right: 1px solid rgba(255,255,255,0.07);
}

.panel-header {
  background: rgba(5,5,10,0.65);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(6px);
}

.mi-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.mi-info { display: flex; flex-direction: column; }
.mi-nombre { font-size: 15px; font-weight: 600; color: #f0f0f0; }
.mi-estado { font-size: 12px; color: #aaa; }

.panel-titulo {
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(5,5,10,0.4);
}

.lista-usuarios { flex: 1; overflow-y: auto; }

.usuario-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  cursor: pointer;
  background: rgba(5,5,10,0.35);
  backdrop-filter: blur(4px);
}

.usuario-item:hover { background: rgba(255,255,255,0.08); }
.usuario-item.soy-yo { background: rgba(37,211,102,0.12); cursor: default; }
.usuario-item.seleccionado-privado { background: rgba(0,255,247,0.1); border-left: 2px solid #00fff7; }

.avatar-wrap { position: relative; }

.usuario-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.punto-verde {
  position: absolute;
  bottom: 1px; right: 1px;
  width: 10px; height: 10px;
  background: #25d366;
  border-radius: 50%;
  border: 2px solid white;
}

.usuario-datos { display: flex; flex-direction: column; }
.usuario-nombre { font-size: 14px; font-weight: 500; color: #f0f0f0; }
.tu-label { font-size: 11px; color: #25d366; font-weight: 400; }
.usuario-estado { font-size: 12px; color: #888; }

.panel-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background:
    linear-gradient(rgba(10,10,15,0.72), rgba(10,10,15,0.72)),
    url('https://i.pinimg.com/736x/31/36/64/3136641c2da149e731c6675a14f0faa4.jpg') center/cover no-repeat;
}

/* panel privado estilo cyberpunk */
.panel-privado {
  width: 340px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  background: #050508;
  border-left: 2px solid #00fff7;
  box-shadow: -4px 0 20px rgba(0, 255, 247, 0.15);
}

.chat-header {
  background: rgba(10,10,15,0.75);
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
}

.privado-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0a0a0f;
  border-bottom: 1px solid #00fff7;
  box-shadow: 0 2px 12px rgba(0, 255, 247, 0.1);
}

.privado-header .chat-titulo { color: #00fff7; text-shadow: 0 0 8px #00fff7; letter-spacing: 1px; }
.privado-header .chat-subtitulo { color: #ff00c8; font-size: 11px; letter-spacing: 0.5px; }

.privado-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.chat-header-info {
  display: flex;
  align-items: center;
}

.chat-titulo { font-size: 15px; font-weight: 600; color: #f0f0f0; display: block; }
.chat-subtitulo { font-size: 12px; color: #aaa; }

.btn-cerrar {
  background: none;
  border: 1px solid transparent;
  font-size: 16px;
  color: #00fff7;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}
.btn-cerrar:hover { border-color: #ff00c8; color: #ff00c8; box-shadow: 0 0 8px #ff00c8; }

.mensajes {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.msg-sistema {
  text-align: center;
  font-size: 12px;
  color: #ccc;
  background: rgba(0,0,0,0.45);
  border-radius: 8px;
  padding: 4px 12px;
  margin: 6px auto;
  max-width: 320px;
  backdrop-filter: blur(4px);
}

.burbuja-wrap {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  margin-bottom: 2px;
}

.burbuja-wrap.derecha { flex-direction: row-reverse; }

.burbuja-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.burbuja {
  max-width: 65%;
  padding: 6px 10px 4px 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.burbuja-mia { background: rgba(37,211,102,0.85); border-bottom-right-radius: 2px; backdrop-filter: blur(4px); }
.burbuja-suya { background: rgba(30,30,40,0.82); border-bottom-left-radius: 2px; backdrop-filter: blur(4px); }
.burbuja-autor { font-size: 12px; font-weight: 600; color: #25d366; }
.burbuja-texto { font-size: 14px; color: #f0f0f0; word-break: break-word; }
.burbuja-hora { font-size: 11px; color: rgba(255,255,255,0.5); text-align: right; align-self: flex-end; }

.escribiendo {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  font-style: italic;
  padding: 4px 0;
}

.chat-input {
  background: rgba(10,10,15,0.75);
  padding: 10px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(8px);
}

.chat-input input {
  flex: 1;
  padding: 10px 14px;
  border: none;
  border-radius: 24px;
  background: rgba(255,255,255,0.1);
  color: #f0f0f0;
  font-size: 15px;
  outline: none;
}

.chat-input input::placeholder { color: rgba(255,255,255,0.35); }

.chat-input button {
  width: 44px; height: 44px;
  background: #25d366;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chat-input button:hover { background: #1da851; }

/* input y burbujas cyberpunk */
.panel-privado .chat-input { background: #0a0a0f; border-top: 1px solid #00fff7; }
.panel-privado .chat-input input { background: #0f0f1a; color: #00fff7; border: 1px solid #1a1a2e; border-radius: 4px; font-family: monospace; }
.panel-privado .chat-input input:focus { border-color: #00fff7; box-shadow: 0 0 8px rgba(0,255,247,0.3); outline: none; }
.panel-privado .chat-input input::placeholder { color: #2a4a4a; }
.panel-privado .chat-input button { background: #00fff7; color: #050508; border-radius: 4px; }
.panel-privado .chat-input button:hover { background: #ff00c8; box-shadow: 0 0 12px #ff00c8; }
.panel-privado .mensajes { background: #050508; }
.panel-privado .burbuja-suya { background: #0f0f1a; border: 1px solid #1a3a3a; border-bottom-left-radius: 2px; box-shadow: 0 0 6px rgba(0,255,247,0.05); }
.panel-privado .burbuja-suya .burbuja-texto { color: #a0f0ec; font-family: monospace; }
.panel-privado .burbuja-suya .burbuja-hora { color: #2a6a6a; }
.panel-privado .burbuja-mia { background: #0f1a0f; border: 1px solid #00fff7; border-bottom-right-radius: 2px; box-shadow: 0 0 8px rgba(0,255,247,0.15); }
.panel-privado .burbuja-mia .burbuja-texto { color: #00fff7; font-family: monospace; }
.panel-privado .burbuja-mia .burbuja-hora { color: #00888a; }

/* notificacion mensaje privado */
.noti-privada {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 280px;
  background: #0a0a0f;
  border: 1px solid #00fff7;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 255, 247, 0.25), 0 4px 16px rgba(0, 0, 0, 0.6);
  padding: 12px 14px;
  z-index: 9999;
  animation: noti-slide-in 0.25s ease-out;
}

@keyframes noti-slide-in {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.noti-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.noti-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #00fff7;
  box-shadow: 0 0 6px rgba(0, 255, 247, 0.4);
  flex-shrink: 0;
}

.noti-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.noti-nombre {
  font-size: 13px;
  font-weight: 600;
  color: #00fff7;
  text-shadow: 0 0 6px #00fff7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.noti-label {
  font-size: 10px;
  color: #ff00c8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.noti-cerrar {
  background: none;
  border: none;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 4px;
  line-height: 1;
  flex-shrink: 0;
  transition: color 0.15s;
}
.noti-cerrar:hover { color: #ff00c8; }

.noti-texto {
  margin: 0;
  font-size: 13px;
  color: #a0f0ec;
  font-family: monospace;
  word-break: break-word;
  border-left: 2px solid #00fff7;
  padding-left: 8px;
}
</style>
