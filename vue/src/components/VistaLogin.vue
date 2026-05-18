<script setup>
import { ref } from 'vue'
import { auth, googleProvider } from '../firebase.js'
import { signInWithPopup, signOut } from 'firebase/auth'

const emit = defineEmits(['login'])

// modo: null = elegir, manual = formulario, 'google' = google
const modo = ref(null)

const nombre = ref('')
const estado = ref('')
const avatarSeleccionado = ref(null)
const error = ref('')
const cargando = ref(false)
const usuarioGoogle = ref(null)

const avatares = [
  'https://i.pinimg.com/1200x/34/31/c5/3431c5e19a2a91578064208f9d611486.jpg',
  'https://i.pinimg.com/736x/f7/4e/71/f74e710ec2a23606ca1f058979438a19.jpg',
  'https://i.pinimg.com/736x/70/30/3e/70303e818835dd079aa9ebd018d65b22.jpg',
  'https://i.pinimg.com/736x/b2/33/42/b23342e2f4805deaf6aba6986b3603c6.jpg',
  'https://i.pinimg.com/736x/58/09/e8/5809e8e0c28181dffd2b68527ace1609.jpg',
  'https://i.pinimg.com/736x/69/8d/99/698d99ca1e2b367d426e445fa51d3824.jpg',
  'https://i.pinimg.com/736x/25/1d/f9/251df94d92f984825f4ef217c289adb1.jpg',
]

async function loginGoogle() {
  cargando.value = true
  error.value = ''
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    // imagen con tamaño mayor para evitar que salga pixelada
    const foto = user.photoURL || 'https://i.pinimg.com/736x/25/1d/f9/251df94d92f984825f4ef217c289adb1.jpg'
    emit('login', {
      nombre: user.displayName || user.email,
      estado: 'Disponible',
      imagen: foto,
      uid: user.uid,
      email: user.email,
    })
  } catch (e) {
    error.value = 'Error al iniciar sesión con Google'
    cargando.value = false
  }
}

function cancelarGoogle() {
  signOut(auth)
  usuarioGoogle.value = null
  nombre.value = ''
  estado.value = ''
  modo.value = null
}

function entrarManual() {
  if (!nombre.value.trim()) { error.value = 'Pon un nombre'; return }
  if (!avatarSeleccionado.value) { error.value = 'Selecciona un avatar'; return }
  error.value = ''
  emit('login', {
    nombre: nombre.value.trim(),
    estado: estado.value || 'en clase',
    imagen: avatarSeleccionado.value,
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

        <!-- PANTALLA INICIAL elegir método -->
        <div v-if="modo == null" class="opciones">
          <button class="btn-google" @click="loginGoogle" :disabled="cargando">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="google-icon" />
            {{ cargando ? 'Conectando...' : 'Continuar con Google' }}
          </button>

          <div class="separador"><span>o</span></div>

          <button class="btn-manual" @click="modo = 'manual'">
            Entrar con nombre de usuario
          </button>
        </div>

        <!-- FORMULARIO MANUAL -->
        <div v-else-if="modo == 'manual'">
          <div class="campo">
            <label>Nombre</label>
            <input v-model="nombre" type="text" placeholder="Cómo te verán los demas" @keyup.enter="entrarManual" />
          </div>

          <div class="campo">
            <label>Estado</label>
            <input v-model="estado" type="text" placeholder="Ej: En clase, Disponible..." @keyup.enter="entrarManual" />
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

          <button @click="entrarManual" class="btn-entrar">Entrar al chat</button>
          <button @click="modo = null; nombre = ''; estado = ''; avatarSeleccionado = null; error = ''" class="btn-volver">← Volver</button>
        </div>

        <!-- FORMULARIO GOOGLE -->
        <div v-else-if="modo === 'google'">
          <div class="google-user">
            <img :src="usuarioGoogle.photoURL" class="google-foto" />
            <div>
              <span class="google-nombre">{{ usuarioGoogle.displayName }}</span>
              <span class="google-email">{{ usuarioGoogle.email }}</span>
            </div>
          </div>

          <div class="campo">
            <label>Nombre en el chat</label>
            <input v-model="nombre" type="text" placeholder="Cómo te verán los demás" @keyup.enter="entrarGoogle" />
          </div>

          <div class="campo">
            <label>Estado</label>
            <input v-model="estado" type="text" placeholder="Ej: En clase, Disponible..." @keyup.enter="entrarGoogle" />
          </div>

          <p v-if="error" class="error">{{ error }}</p>

          <button @click="entrarGoogle" class="btn-entrar">Entrar al chat</button>
          <button @click="cancelarGoogle" class="btn-volver">← Volver</button>
        </div>

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

.opciones {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px 20px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 15px;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  width: 100%;
}

.btn-google:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.12); border-color: #bbb; }
.btn-google:disabled { opacity: 0.6; cursor: not-allowed; }

.google-icon { width: 20px; height: 20px; }

.separador {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #aaa;
  font-size: 13px;
}
.separador::before,
.separador::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #eee;
}

.btn-manual {
  width: 100%;
  padding: 11px;
  border: 1.5px solid #25d366;
  border-radius: 8px;
  background: white;
  color: #25d366;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-manual:hover { background: #25d366; color: white; }

.google-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f0f9f4;
  border: 1.5px solid #25d366;
  border-radius: 8px;
  margin-bottom: 18px;
}

.google-foto { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
.google-nombre { display: block; font-size: 14px; font-weight: 600; color: #111; }
.google-email { display: block; font-size: 12px; color: #667781; }

.campo { margin-bottom: 18px; }

.campo label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #3b4a54;
  margin-bottom: 6px;
}

.campo input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.campo input:focus { border-color: #25d366; }

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
.avatar-opcion:hover { border-color: #25d366; transform: scale(1.08); }
.avatar-opcion.seleccionado { border-color: #25d366; box-shadow: 0 0 0 2px #25d36640; }

.error { color: #e53e3e; font-size: 13px; margin-bottom: 12px; }

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
  margin-bottom: 8px;
}
.btn-entrar:hover { background: #1da851; }

.btn-volver {
  width: 100%;
  padding: 10px;
  background: none;
  border: none;
  color: #667781;
  font-size: 14px;
  cursor: pointer;
}
.btn-volver:hover { color: #333; }
</style>
