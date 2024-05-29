/**
 * Autor: Nicolás Peña Mogollón
 * Servicio simple de envío de correo electrónico utilizando Express y Nodemailer
 */

/**
 * Librerias utilizadas:
 * - dotenv para cargar variables de entorno desde un archivo .env
 * - express para manejar el servidor web y rutas HTTP
 * - bodyParser para parsear datos de formularios HTTP
 * - nodemailer para enviar correos electrónicos
 * - validator para validar el formato de direcciones de correo electrónico
 */
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const validator = require('validator');
const cors = require('cors');

// inicialización de la app
const app = express();
const port = process.env.PORT || 3000;

// Middleware para CORS
app.use(cors());

// Middleware para parsear los cuerpos de las solicitudes HTTP
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ruta inicial para verificar que el servidor está en funcionamiento
app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});

// Ruta POST para manejar el envío de correos electrónicos desde un formulario
app.post('/send-email', (req, res) => {
    // Extraer name, email y message del cuerpo de la solicitud
    const { name, email, subject, message } = req.body;

    // Validar que name, email y message estén presentes en la solicitud
    if (!name || !email || !subject || !message) {
        return res.status(400).send('Todos los campos son obligatorios: name, email, message');
    }

    // Validar el formato del correo electrónico usando validator
    if (!validator.isEmail(email)) {
        return res.status(400).send('El correo electrónico no es válido');
    }

    // Configurar el transporter de nodemailer con las credenciales de Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,  // Usuario de correo electrónico desde variables de entorno
            pass: process.env.EMAIL_PASS,  // Contraseña del usuario desde variables de entorno
        },
    });

    // Configuración del correo para el destinatario (tú mismo)
    const mailOptions = {
        from: process.env.EMAIL_USER,  // Remitente del correo (tu dirección de correo)
        to: process.env.EMAIL_USER,    // Destinatario del correo (también tu dirección de correo)
        subject: subject,  // Asunto del correo
        text: `Nombre: ${name}\n\nCorreo: ${email}\n\nMensaje: ${message}`,  // Contenido del correo
    };

    // Configuración del correo de confirmación para el remitente del formulario
    const confirmationMailOptions = {
        from: process.env.EMAIL_USER,          // Remitente del correo de confirmación
        to: email,                             // Destinatario del correo de confirmación (email del remitente del formulario)
        subject: 'Confirmación de recepción',  // Asunto del correo de confirmación
        text: `Hola ${name},\n\nHe recibido tu mensaje:\n\n"${message}"\n\nMe pondré en contacto contigo pronto.\n\nSaludos,\nNicolás Peña Mogollón`,  // Contenido del correo de confirmación
    };

    // Enviar el correo principal y manejar errores y respuestas
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error al enviar correo:', error);
            return res.status(500).send('Error al enviar correo');
        }
        
        // Enviar correo de confirmación al remitente del formulario
        transporter.sendMail(confirmationMailOptions, (confirmationError, confirmationInfo) => {
            if (confirmationError) {
                console.error('Error al enviar correo de confirmación:', confirmationError);
                return res.status(500).send('Error al enviar correo de confirmación');
            }

            // Respuesta exitosa al cliente si ambos correos se envían correctamente
            res.status(200).send('Correo enviado correctamente y confirmación enviada.');
        });
    });
});

// Iniciar el servidor y escuchar en el puerto especificado
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});