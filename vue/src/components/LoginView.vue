<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])

const nombre = ref('')
const estado = ref('')
const avatarSeleccionado = ref(null)
const error = ref('')

const avatares = [
  'https://i.pravatar.cc/150?img=1',
  'https://i.pravatar.cc/150?img=2',
  'https://i.pravatar.cc/150?img=3',
  'https://i.pravatar.cc/150?img=4',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=6',
  'https://i.pravatar.cc/150?img=7',
  'https://i.pravatar.cc/150?img=8',
  'https://i.pravatar.cc/150?img=9',
  'https://i.pravatar.cc/150?img=10',
  'https://i.pravatar.cc/150?img=11',
  'https://i.pravatar.cc/150?img=12',
]

function entrar() {
  if (!nombre.value.trim()) {
    error.value = 'El nombre es obligatorio'
    return
  }
  if (!avatarSeleccionado.value) {
    error.value = 'Selecciona un avatar'
    return
  }
  error.value = ''
  emit('login', {
    nombre: nombre.value,
    estado: estado.value || 'en clase',
    imagen: avatarSeleccionado.value
  })
}
</script>

<template>
  <div class="login-fondo">
    <div class="login-caja">

      <div class="login-header">
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" class="logo" />
        <h1>WhatsApp Web</h1>
      </div>

      <div class="login-body">
        <p class="subtitulo">Introduce tus datos para entrar al chat</p>

        <div class="campo">
          <label>Nombre</label>
          <input
            v-model="nombre"
            type="text"
            placeholder="Tu nombre..."
            @keyup.enter="entrar"
          />
        </div>

        <div class="campo">
          <label>Elige tu estado<span class="opcional"></span></label>
          <input
            v-model="estado"
            type="text"
            placeholder="Ej: En clase, Disponible..."
            @keyup.enter="entrar"
          />
        </div>

        <div class="campo">
          <label>Elige tu avatar</label>
          <div class="avatar-grid">
            <img
              v-for="(url, i) in avatares"
              :key="i"
              :src="url"
              :class="{ seleccionado: avatarSeleccionado === url }"
              @click="avatarSeleccionado = url"
              alt="avatar"
              class="avatar-opcion"
            />
          </div>
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button @click="entrar" class="btn-entrar">Entrar al chat</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.login-fondo {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-caja {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 420px;
  overflow: hidden;
}

.login-header {
  background: #25d366;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo {
  width: 40px;
  height: 40px;
  filter: brightness(0) invert(1);
}

.login-header h1 {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.login-body {
  padding: 24px;
}

.subtitulo {
  color: #667781;
  font-size: 13px;
  margin-bottom: 20px;
}

.campo {
  margin-bottom: 18px;
}

.campo label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #3b4a54;
  margin-bottom: 6px;
}

.opcional {
  font-weight: 400;
  color: #aaa;
}

.campo input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.campo input:focus {
  border-color: #25d366;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-top: 6px;
}

.avatar-opcion {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  transition: border-color 0.2s, transform 0.1s;
  object-fit: cover;
}

.avatar-opcion:hover {
  border-color: #25d366;
  transform: scale(1.08);
}

.avatar-opcion.seleccionado {
  border-color: #25d366;
  box-shadow: 0 0 0 2px #25d36640;
}

.error {
  color: #e53e3e;
  font-size: 13px;
  margin-bottom: 12px;
}

.btn-entrar {
  width: 100%;
  padding: 12px;
  background: #25d366;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-entrar:hover {
  background: #1da851;
}
</style>
