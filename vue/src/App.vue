<script setup>
import { ref } from 'vue'
import VistaLogin from './components/VistaLogin.vue'
import VistaChat from './components/VistaChat.vue'

const usuario = ref(null)

function onLogin(datos) {
  // Guardo los datos del usuario
  usuario.value = datos
}
</script>

<template>
  <div>
    <VistaLogin v-if="!usuario" @login="onLogin" />
    <VistaChat v-else :usuario="usuario" />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
}
</style>
