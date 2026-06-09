require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
// Middlewares
app.use(cors()); // Permite peticiones desde Netlify
app.use(express.json());
 
// Configurar el transportador de email
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS:true,
  family:4,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS
  }
});

// Ruta de health check
app.get('/', (req, res) => {
  res.send({ status: 'OK', mensaje: 'Servidor funcionando ✓' });
});
 
// Ruta principal: recibe el formulario y envía el email
app.post('/contacto', async (req, res) => {
  const { nombre, email, empresa, mensaje } = req.body;
 
  // Validación básica
  if (!nombre || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }
 try {
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      access_key: process.env.WEB3FORMS_KEY,
      name: nombre,
      email: email,
      message: mensaje,
      subject: `Nuevo interesado en Insky: ${nombre}`
    })
  });

  const result = await response.json();

  if (result.success) {
    res.json({ ok: true, mensaje: 'Mensaje enviado' });
  } else {
    res.status(500).json({ error: 'No se pudo enviar el correo' });
  }
 
  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ error: 'Error al enviar el correo. Intenta de nuevo.' });
  }
});
 app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

