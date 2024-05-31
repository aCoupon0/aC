//Usuario DB gabrielparisbaquero
//Clave DB hAdb8Hfv9K5ZIGW3



const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const uri = "mongodb+srv://gabrielparisbaquero:hAdb8Hfv9K5ZIGW3@acoupondb.lbsmw2g.mongodb.net/?retryWrites=true&w=majority&appName=aCouponDB";

// Definición del modelo Usuario con Mongoose
const UsuarioSchema = new mongoose.Schema({
  cedula: { type: String, required: true },
  celular: { type: String, required: true },
  direccion: { type: String, required: true },
  ciudad: { type: String, required: true },
  cartData: { type: String, required: true },
  precioFinal: { type: Number, required: true }
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Conexión a MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB', err));

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ajustar la ruta de los archivos estáticos y vistas
const rootPath = path.join(__dirname, '..');
app.use('/data', express.static(path.join(rootPath, 'public/data')));
app.use(express.static(path.join(rootPath, 'public')));

// Rutas para servir páginas HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(rootPath, 'views', 'index.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(rootPath, 'views', 'cart.html'));
});

app.get('/formulario', (req, res) => {
  res.sendFile(path.join(rootPath, 'views', 'formulario.html'));
});

app.get('/confirm', (req, res) => {
  res.sendFile(path.join(rootPath, 'views', 'confirm.html'));
});

app.get('/clavel', (req, res) => {
  res.sendFile(path.join(rootPath, 'public', 'productos', 'clavel.html'));
});

// Función para manejar la solicitud del formulario y guardar datos en MongoDB
const guardarPalabraConReintento = async (req, res, intentos = 1) => {
  if (intentos > 3) {
    console.error('Error: máximo número de intentos alcanzado');
    return res.status(500).send('Error al guardar los datos en la base de datos.');
  }

  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 10000)
  );

  const guardarPalabra = new Promise(async (resolve, reject) => {
    try {
      console.log('Intento:', intentos);
      const nuevoUsuario = new Usuario({
        cedula: req.body.cedula,
        celular: req.body.celular,
        direccion: req.body.direccion,
        ciudad: req.body.ciudad,
        cartData: req.body.cartData,
        precioFinal: req.body.precioFinal
      });
      const resultado = await nuevoUsuario.save();
      resolve(resultado);
    } catch (error) {
      reject(error);
    }
  });

  try {
    const resultado = await Promise.race([guardarPalabra, timeoutPromise]);
    console.log('Datos guardados:', resultado);
    res.redirect('/confirm');
  } catch (error) {
    if (error.message === 'Timeout') {
      console.log('Timeout alcanzado, no se pudo guardar los datos.');
      res.status(408).send('Timeout');
    } else {
      console.error('Error al guardar los datos en la base de datos:', error);
      res.status(500).send('Error al guardar los datos en la base de datos.');
    }
  }
};

// Ruta para manejar la solicitud del formulario y guardar datos en MongoDB con reintentos
app.post('/guardar-palabra', async (req, res) => {
  await guardarPalabraConReintento(req, res);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
