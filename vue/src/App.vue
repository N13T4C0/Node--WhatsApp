<script setup>
import { ref } from 'vue'
import LoginView from './components/LoginView.vue'
import ChatView from './components/ChatView.vue'

const usuario = ref(null)

function onLogin(datos) {
  usuario.value = datos
}
</script>

<template>
  <div>
    <LoginView v-if="!usuario" @login="onLogin" />
    <ChatView v-else :usuario="usuario" />
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
