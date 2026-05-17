# Node--WhatsApp 💬

Chat en tiempo real inspirado en WhatsApp, construido con Node.js, Socket.io y Vue 3.

<img src="https://i.postimg.cc/FRc1H9Q6/Captura-de-pantalla-2026-05-17-164947.png">

## Características

- Mensajes en tiempo real con Socket.io
- Mensajes privados entre usuarios
- Indicador de "está escribiendo..."
- Avatares e imágenes de perfil
- Historial de mensajes al conectarse
- Interfaz oscura estilo WhatsApp

## Tecnologías

**Backend:** Node.js · Express · Socket.io  
**Frontend:** Vue 3 · Vite

## Instalación local

```bash
# Instalar dependencias del servidor
npm install

# Instalar dependencias del frontend
cd vue && npm install

# Build del frontend
npm run build && cd ..

# Iniciar servidor
node server.js
```

La app estará disponible en `http://localhost:3000`

## Deploy

Desplegado en [Render](https://render.com) — https://node-whatsapp-fn9f.onrender.com
