<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])

const nombre = ref('')
const estado = ref('')
const avatarSeleccionado = ref(null)
const error = ref('')

const avatares = [
  'https://i.pinimg.com/1200x/34/31/c5/3431c5e19a2a91578064208f9d611486.jpg',
  'https://i.pinimg.com/736x/f7/4e/71/f74e710ec2a23606ca1f058979438a19.jpg',
  'https://i.pinimg.com/736x/70/30/3e/70303e818835dd079aa9ebd018d65b22.jpg',
  'https://i.pinimg.com/736x/b2/33/42/b23342e2f4805deaf6aba6986b3603c6.jpg',
  'https://i.pinimg.com/736x/58/09/e8/5809e8e0c28181dffd2b68527ace1609.jpg',
  'https://i.pinimg.com/736x/69/8d/99/698d99ca1e2b367d426e445fa51d3824.jpg',
  'https://i.pinimg.com/736x/25/1d/f9/251df94d92f984825f4ef217c289adb1.jpg',
]

function entrar() {
  if (!nombre.value.trim()) {
    error.value = "pon nombre"
    return
  }
  if (!avatarSeleccionado.value) {
    error.value = 'selecciona  un avatar'
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
            placeholder="pon tu nombre."
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
