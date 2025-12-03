require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta de verificación GET - Facebook usa esto para verificar tu webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verificar que el token coincida
  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✓ Webhook verificado');
      res.status(200).send(challenge);
    } else {
      console.log('✗ Verificación fallida');
      res.sendStatus(403);
    }
  }
});

// Ruta POST - Recibe los mensajes de Facebook e Instagram
app.post('/webhook', (req, res) => {
  const body = req.body;

  // Verificar que sea un evento de página
  if (body.object === 'page') {
    body.entry.forEach(entry => {
      // Obtener el webhook event
      const webhookEvent = entry.messaging ? entry.messaging[0] : entry.changes[0];
      
      if (entry.messaging) {
        // Es un mensaje de Facebook Messenger
        handleMessengerEvent(webhookEvent);
      } else if (entry.changes) {
        // Es un mensaje de Instagram
        handleInstagramEvent(webhookEvent);
      }
    });

    // Devolver 200 OK para que Facebook sepa que recibimos el evento
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Función para manejar eventos de Facebook Messenger
function handleMessengerEvent(event) {
  const senderId = event.sender.id;
  const recipientId = event.recipient.id;
  const timestamp = event.timestamp;

  console.log('\n📱 MENSAJE DE FACEBOOK MESSENGER');
  console.log('================================');
  console.log('Sender ID:', senderId);
  console.log('Recipient ID:', recipientId);
  console.log('Timestamp:', new Date(timestamp));

  // Verificar si es un mensaje
  if (event.message) {
    const messageId = event.message.mid;
    const messageText = event.message.text;
    const attachments = event.message.attachments;

    console.log('Message ID:', messageId);
    
    if (messageText) {
      console.log('Texto del mensaje:', messageText);
      
      // Aquí puedes agregar tu lógica para responder
      // sendTextMessage(senderId, `Recibí tu mensaje: "${messageText}"`);
    }
    
    if (attachments) {
      console.log('Adjuntos:', JSON.stringify(attachments, null, 2));
    }
  }

  // Verificar si es un postback (cuando hacen clic en un botón)
  if (event.postback) {
    console.log('Postback payload:', event.postback.payload);
  }
}

// Función para manejar eventos de Instagram
function handleInstagramEvent(event) {
  const value = event.value;
  
  console.log('\n📸 MENSAJE DE INSTAGRAM');
  console.log('================================');
  console.log('Evento completo:', JSON.stringify(event, null, 2));

  if (value) {
    const senderId = value.from?.id;
    const messageId = value.mid;
    const messageText = value.text;

    if (senderId) console.log('Sender ID:', senderId);
    if (messageId) console.log('Message ID:', messageId);
    if (messageText) {
      console.log('Texto del mensaje:', messageText);
      
      // Aquí puedes agregar tu lógica para responder
      // sendInstagramMessage(senderId, `Recibí tu mensaje: "${messageText}"`);
    }

    // Manejar diferentes tipos de mensajes de Instagram
    if (value.attachments) {
      console.log('Adjuntos:', JSON.stringify(value.attachments, null, 2));
    }

    if (value.story_mention) {
      console.log('Mención en historia detectada');
    }

    if (value.reaction) {
      console.log('Reacción recibida:', value.reaction.emoji);
    }
  }
}

// Función auxiliar para enviar mensajes de texto a Facebook Messenger
function sendTextMessage(recipientId, messageText) {
  const messageData = {
    recipient: { id: recipientId },
    message: { text: messageText }
  };

  callSendAPI(messageData);
}

// Función auxiliar para enviar mensajes a Instagram
function sendInstagramMessage(recipientId, messageText) {
  const messageData = {
    recipient: { id: recipientId },
    message: { text: messageText }
  };

  callSendAPI(messageData, 'instagram');
}

// Función para llamar a la API de envío de Facebook/Instagram
function callSendAPI(messageData, platform = 'messenger') {
  const request = require('https').request({
    hostname: 'graph.facebook.com',
    port: 443,
    path: '/v18.0/me/messages?access_token=' + PAGE_ACCESS_TOKEN,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, (response) => {
    let body = '';
    response.on('data', chunk => body += chunk);
    response.on('end', () => {
      if (response.statusCode === 200) {
        console.log(`✓ Mensaje enviado a ${platform}`);
      } else {
        console.error(`✗ Error al enviar mensaje:`, body);
      }
    });
  });

  request.on('error', (e) => {
    console.error('Error en la petición:', e.message);
  });

  request.write(JSON.stringify(messageData));
  request.end();
}

// Ruta de inicio
app.get('/', (req, res) => {
  res.send(`
    <h1>Webhook de Facebook e Instagram</h1>
    <p>El servidor está funcionando correctamente.</p>
    <p>Configura el webhook en: <code>/webhook</code></p>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor webhook iniciado');
  console.log(`📡 Escuchando en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}/webhook`);
  console.log('\n⚠️  Asegúrate de configurar las variables de entorno en el archivo .env');
});
