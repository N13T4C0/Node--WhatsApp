<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { io } from 'socket.io-client'

const props = defineProps({
  usuario: Object
})

const socket = io({ path: '/socket.io' })

const mensajes = ref([])
const usuarios = ref([])
const texto = ref('')
const quienEscribe = ref('')
const mensajesDiv = ref(null)

let timerEscribiendo = null

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
  scrollAbajo()
})

socket.on('chat mensaje', (msg) => {
  mensajes.value.push(msg)
  scrollAbajo()
})

socket.on('usuarios', (lista) => {
  usuarios.value = lista
})

// FIX: renombramos el parametro para no solapar con el ref 'texto'
socket.on('sistema', (msgSistema) => {
  mensajes.value.push({ sistema: true, texto: msgSistema })
  scrollAbajo()
})

socket.on('escribiendo', (nombre) => {
  quienEscribe.value = nombre
})

socket.on('parado de escribir', () => {
  quienEscribe.value = ''
})

function enviar() {
  if (!texto.value.trim()) return
  socket.emit('mensaje', { texto: texto.value.trim(), nombre: props.usuario.nombre })
  texto.value = ''
  socket.emit('parado de escribir')
  clearTimeout(timerEscribiendo)
}

function onEscribiendo() {
  socket.emit('escribiendo', props.usuario.nombre)
  clearTimeout(timerEscribiendo)
  timerEscribiendo = setTimeout(() => {
    socket.emit('parado de escribir')
  }, 2000)
}

function formatHora(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0')
}

async function scrollAbajo() {
  await nextTick()
  if (mensajesDiv.value) {
    mensajesDiv.value.scrollTop = mensajesDiv.value.scrollHeight
  }
}
</script>

<template>
  <div class="chat-app">

    <!-- PANEL IZQUIERDO -->
    <div class="panel-izq">
      <div class="panel-header">
        <img :src="usuario.imagen" class="mi-avatar" />
        <div class="mi-info">
          <span class="mi-nombre">{{ usuario.nombre }}</span>
          <span class="mi-estado">{{ usuario.estado }}</span>
        </div>
      </div>

      <div class="panel-titulo">Conectados ({{ usuarios.length }})</div>

      <div class="lista-usuarios">
        <div
          v-for="(u, i) in usuarios"
          :key="i"
          class="usuario-item"
          :class="{ 'soy-yo': u.nombre === usuario.nombre }"
        >
          <div class="avatar-wrap">
            <img :src="u.imagen" class="usuario-avatar" />
            <span class="punto-verde"></span>
          </div>
          <div class="usuario-datos">
            <span class="usuario-nombre">
              {{ u.nombre }}
              <span v-if="u.nombre === usuario.nombre" class="tu-label">(tú)</span>
            </span>
            <span class="usuario-estado">{{ u.estado }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL DERECHO -->
    <div class="panel-chat">

      <div class="chat-header">
        <div class="chat-header-info">
          <span class="chat-titulo">Sala general</span>
          <span class="chat-subtitulo">{{ usuarios.length }} participantes</span>
        </div>
      </div>

      <div class="mensajes" ref="mensajesDiv">
        <div v-for="(msg, i) in mensajes" :key="i">

          <div v-if="msg.sistema" class="msg-sistema">
            {{ msg.texto }}
          </div>

          <div
            v-else
            class="burbuja-wrap"
            :class="msg.nombre === usuario.nombre ? 'derecha' : 'izquierda'"
          >
            <img
              v-if="msg.nombre !== usuario.nombre"
              :src="msg.imagen"
              class="burbuja-avatar"
            />
            <div
              class="burbuja"
              :class="msg.nombre === usuario.nombre ? 'burbuja-mia' : 'burbuja-suya'"
            >
              <span v-if="msg.nombre !== usuario.nombre" class="burbuja-autor">{{ msg.nombre }}</span>
              <span class="burbuja-texto">{{ msg.texto }}</span>
              <span class="burbuja-hora">{{ formatHora(msg.timestamp) }}</span>
            </div>
          </div>

        </div>

        <div v-if="quienEscribe" class="escribiendo">
          {{ quienEscribe }} está escribiendo...
        </div>
      </div>

      <div class="chat-input">
        <input
          v-model="texto"
          type="text"
          placeholder="Escribe un mensaje..."
          @keyup.enter="enviar"
          @input="onEscribiendo"
        />
        <button @click="enviar">&#9658;</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.chat-app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.panel-izq {
  width: 300px;
  min-width: 220px;
  background: #fff;
  border-right: 1px solid #e9edef;
  display: flex;
  flex-direction: column;
}

.panel-header {
  background: #f0f2f5;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e9edef;
}

.mi-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.mi-info { display: flex; flex-direction: column; }
.mi-nombre { font-size: 15px; font-weight: 600; color: #111b21; }
.mi-estado { font-size: 12px; color: #667781; }

.panel-titulo {
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #667781;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f0f2f5;
}

.lista-usuarios { flex: 1; overflow-y: auto; }

.usuario-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.usuario-item:hover { background: #f5f6f6; }
.usuario-item.soy-yo { background: #f0fdf4; }

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
.usuario-nombre { font-size: 14px; font-weight: 500; color: #111b21; }
.tu-label { font-size: 11px; color: #25d366; font-weight: 400; }
.usuario-estado { font-size: 12px; color: #667781; }

.panel-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #efeae2;
}

.chat-header {
  background: #f0f2f5;
  padding: 12px 20px;
  border-bottom: 1px solid #e9edef;
}

.chat-titulo { font-size: 15px; font-weight: 600; color: #111b21; display: block; }
.chat-subtitulo { font-size: 12px; color: #667781; }

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
  color: #667781;
  background: rgba(255,255,255,0.7);
  border-radius: 8px;
  padding: 4px 12px;
  margin: 6px auto;
  max-width: 320px;
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

.burbuja-mia { background: #d9fdd3; border-bottom-right-radius: 2px; }
.burbuja-suya { background: white; border-bottom-left-radius: 2px; }
.burbuja-autor { font-size: 12px; font-weight: 600; color: #25d366; }
.burbuja-texto { font-size: 14px; color: #111b21; word-break: break-word; }
.burbuja-hora { font-size: 11px; color: #667781; text-align: right; align-self: flex-end; }

.escribiendo {
  font-size: 12px;
  color: #667781;
  font-style: italic;
  padding: 4px 0;
}

.chat-input {
  background: #f0f2f5;
  padding: 10px 16px;
  display: flex;
  gap: 10px;
  align-items: center;
  border-top: 1px solid #e9edef;
}

.chat-input input {
  flex: 1;
  padding: 10px 14px;
  border: none;
  border-radius: 24px;
  background: white;
  font-size: 15px;
  outline: none;
}

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
</style>
