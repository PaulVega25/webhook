# Webhook de Facebook Messenger e Instagram

Servidor webhook en Node.js con Express para recibir y procesar mensajes de Facebook Messenger e Instagram.

## 📋 Requisitos

- Node.js (v14 o superior)
- Una cuenta de Facebook Developer
- Una página de Facebook conectada
- Una cuenta de Instagram Business (para mensajes de Instagram)

## 🚀 Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   
   Copia el archivo `.env.example` a `.env`:
   ```bash
   copy .env.example .env
   ```

   Edita el archivo `.env` con tus valores:
   ```
   PORT=3000
   VERIFY_TOKEN=tu_token_secreto_aqui
   PAGE_ACCESS_TOKEN=tu_page_access_token_aqui
   ```

   - `VERIFY_TOKEN`: Un token secreto que tú eliges (ejemplo: "mi_webhook_2024")
   - `PAGE_ACCESS_TOKEN`: Token de acceso de tu página de Facebook (lo obtienes en Facebook Developer)

3. **Iniciar el servidor:**
   ```bash
   npm start
   ```
   
   Para desarrollo con auto-reload:
   ```bash
   npm run dev
   ```

## 🔧 Configuración en Facebook Developer

### 1. Crear una App en Facebook Developer

1. Ve a https://developers.facebook.com/
2. Crea una nueva app o usa una existente
3. Agrega el producto "Messenger" y/o "Instagram"

### 2. Configurar el Webhook

1. En tu app de Facebook Developer, ve a **Messenger > Configuración**
2. En la sección "Webhooks", haz clic en "Agregar URL de devolución de llamada"
3. Ingresa:
   - **URL de devolución de llamada**: `https://tu-dominio.com/webhook`
   - **Token de verificación**: El mismo que pusiste en `VERIFY_TOKEN` en tu `.env`
4. Suscríbete a los eventos que necesites:
   - `messages`
   - `messaging_postbacks`
   - `message_deliveries`
   - `message_reads`

### 3. Para Instagram

1. En tu app, ve a **Instagram > Configuración**
2. Configura el webhook de manera similar
3. Conecta tu cuenta de Instagram Business
4. Suscríbete a los eventos:
   - `messages`
   - `messaging_postbacks`
   - `message_reactions`

## 📡 Exponer tu servidor local (para pruebas)

Para que Facebook pueda acceder a tu webhook local, necesitas exponerlo públicamente. Usa una de estas opciones:

### Opción 1: ngrok (recomendado para pruebas)
```bash
ngrok http 3000
```
Copia la URL HTTPS que te da ngrok y úsala en Facebook Developer.

### Opción 2: localtunnel
```bash
npx localtunnel --port 3000
```

## 📝 Estructura del Proyecto

```
webhook/
├── server.js          # Servidor principal con toda la lógica
├── package.json       # Dependencias del proyecto
├── .env              # Variables de entorno (crear desde .env.example)
├── .env.example      # Plantilla de variables de entorno
└── README.md         # Este archivo
```

## 🔍 Cómo Funciona

### Verificación GET
Facebook hace una petición GET a `/webhook` para verificar que tu servidor es válido. El servidor responde con el challenge si el token es correcto.

### Recepción de Mensajes POST
Cuando alguien envía un mensaje a tu página de Facebook o Instagram:
1. Facebook envía un POST a `/webhook` con los datos del mensaje
2. El servidor procesa el evento
3. Determina si es de Facebook Messenger o Instagram
4. Ejecuta la función correspondiente (`handleMessengerEvent` o `handleInstagramEvent`)
5. Muestra la información en la consola

## 🎯 Funcionalidades Incluidas

- ✅ Recepción de mensajes de texto de Facebook Messenger
- ✅ Recepción de mensajes de texto de Instagram
- ✅ Manejo de adjuntos (imágenes, videos, archivos)
- ✅ Manejo de postbacks (botones)
- ✅ Manejo de menciones en historias de Instagram
- ✅ Manejo de reacciones de Instagram
- ✅ Funciones para enviar mensajes de respuesta (comentadas, listas para usar)

## 💬 Enviar Respuestas

Para enviar respuestas automáticas, descomenta las líneas en el código:

```javascript
// En handleMessengerEvent
sendTextMessage(senderId, `Recibí tu mensaje: "${messageText}"`);

// En handleInstagramEvent
sendInstagramMessage(senderId, `Recibí tu mensaje: "${messageText}"`);
```

## 📊 Logs en Consola

El servidor muestra información detallada de cada mensaje recibido:

```
📱 MENSAJE DE FACEBOOK MESSENGER
================================
Sender ID: 123456789
Recipient ID: 987654321
Timestamp: 2024-12-03T10:30:00.000Z
Message ID: mid.123
Texto del mensaje: Hola!
```

## 🔒 Seguridad

- Mantén tu `PAGE_ACCESS_TOKEN` seguro y nunca lo compartas
- Usa HTTPS en producción
- Valida siempre el `VERIFY_TOKEN`
- No subas el archivo `.env` al repositorio (está en .gitignore)

## 🚨 Troubleshooting

**El webhook no se verifica:**
- Verifica que el `VERIFY_TOKEN` coincida exactamente
- Asegúrate de que el servidor esté accesible públicamente
- Revisa los logs del servidor

**No recibo mensajes:**
- Verifica que estés suscrito a los eventos correctos
- Asegúrate de que el webhook esté activo en Facebook Developer
- Revisa los permisos de la página

**Error 403:**
- El token de verificación no coincide

**Error 500:**
- Revisa los logs del servidor para ver el error específico

## 📚 Recursos Adicionales

- [Documentación de Messenger Platform](https://developers.facebook.com/docs/messenger-platform)
- [Documentación de Instagram API](https://developers.facebook.com/docs/instagram-api)
- [Graph API Reference](https://developers.facebook.com/docs/graph-api)

## 📄 Licencia

ISC
