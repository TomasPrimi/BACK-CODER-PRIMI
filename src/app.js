const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const ProductManager = require('../dao/ProductManager');
const CartManager = require('../dao/CartManager');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { connect } = require('http2');
const uri = "mongodb+srv://tomasprimi:<> @ecommerce.xi0t48d.mongodb.net/?retryWrites=true&w=majority";
const Message = require('../dao/models/MessageSchema'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const mongoURI = 'tu_cadena_de_conexión';
const DB_HOST = "localhost";
const DB_PORT = 27017;
const DB_NAME = "Ecommerce";

const port = 8080;
const productManager = new ProductManager('products.json');
const cartManager = new CartManager('carts.json');


const connection = mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`)
  .then((conn) => {
    console.log("CONEXIÓN EXITOSA A MONGODB", conn);
  })
  .catch((err) => {
    console.log("ERROR DE CONEXIÓN!!!", err.message);
  });

  mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Conexión exitosa a MongoDB");
  })
  .catch((err) => {
    console.error("Error de conexión a MongoDB:", err.message);
  });

  const messageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  });

  
  module.exports = Message;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db(DB_NAME).command({ ping: 1 });
    console.log("Conexión exitosa a MongoDB! Ping a tu despliegue.");
  } finally {
    await client.close();
  }
}
const socket = io();

const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${message.user}: ${message.message}`;
    chatMessages.appendChild(messageElement);
}


socket.on('message', (message) => {
    displayMessage(message);
});


sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message !== '') {

        socket.emit('chatMessage', { user: 'Usuario', message });
        messageInput.value = '';
    }
});
run().catch(console.dir);


app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(session({
  secret: 'contraseña_secreta', 
  resave: false,
  saveUninitialized: true
}));


passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }
    } catch (error) {
      return done(error);
    }
  }
));

passport.use(new GitHubStrategy({
  clientID: TomasPrimi,
  clientSecret: a,
  callbackURL: "http://localhost:8080/auth/github/callback"
},
function(accessToken, refreshToken, profile, done) {
  User.findOrCreate({ githubId: profile.id }, function (err, user) {
    return done(err, user);
  });
}
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});



app.post('/login', passport.authenticate('local', {
  successRedirect: '/productos',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/productos');
  });

app.get('/api/products', async (req, res) => {
  try {
    const limit = req.query.limit;
    const products = limit ? await productManager.getProducts().then(products => products.slice(0, limit)) : await productManager.getProducts();
    res.render('products', { products });
  } catch (error) {
    res.status(500).send('Error obteniendo los productos');
  }
});



app.get('/api/products/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await productManager.getProductById(productId);
    if (product) {
      res.json({ product });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo el producto' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      throw new Error("All fields are mandatory, except thumbnails");
    }

    const newProduct = {
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails: thumbnails || [],
      status: true,
    };

    productManager.addProduct(newProduct);
    res.json({ product: newProduct });
    io.emit('producto_creado', newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:pid', async (req, res) => {
  const productId = parseInt(req.params.pid);
  const updatedProduct = req.body;

  try {
    const product = await productManager.updateProduct(productId, updatedProduct);

    if (product) {
      res.json({ product });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando el producto' });
  }
});

app.delete('/api/products/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const deleted = await productManager.deleteProduct(productId);

    if (deleted) {
      res.json({ product: deleted });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando el producto' });
  }
});

app.post('/api/carts', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.json({ cart: newCart });
  } catch (error) {
    console.error('Error creando un carrito', error);
    res.status(500).json({ error: 'Error creando un carrito' });
  }
});

app.get('/api/carts/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartManager.getCartById(cartId);

    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    const productsInCart = await cartManager.getProductsInCart(cart.products);
    res.json({ cart, products: productsInCart });
  } catch (error) {
    console.error('Error al obtener los productos del carrito', error);
    res.status(500).json({ error: 'Error al obtener los productos del carrito' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.post('/api/carts/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    const productsInCart = await cartManager.addProductToCart(cartId, productId, quantity);

    if (productsInCart.length > 0) {
      res.json({ products: productsInCart });
    } else {
      res.status(404).json({ error: 'Carrito o producto no encontrado' });
    }
  } catch (error) {
    console.error('Error añadiendo un producto al carrito', error);
    res.status(500).json({ error: 'Error añadiendo un producto al carrito' });
  }
});

mongoose.connect('mongodb://localhost:27017/Ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch(err => console.error('Error de conexión a MongoDB:', err));


app.get('/registro', (req, res) => {
  res.render('registro');
});

app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});


app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ userId: user._id }, 'tu_clave_secreta', { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: 'Token de autenticación requerido' });
  }
  jwt.verify(token, 'tu_clave_secreta', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token de autenticación inválido' });
    }
    req.user = user;
    next();
  });
}

app.get('/ruta-protegida', authenticateToken, (req, res) => {
  res.json({ mensaje: 'Ruta protegida' });
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

module.exports = User;

app.get('/productos', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }
  res.render('productos', { usuario: req.session.usuario });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('mensaje_cliente', (mensaje) => {
    console.log('Mensaje recibido del cliente:', mensaje);
    socket.emit('mensaje_servidor', 'Mensaje recibido por el servidor');
  });

  socket.on('nuevo_producto', (producto) => {
    console.log('Nuevo producto recibido:', producto);

    io.emit('producto_creado', producto);
  });


  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('chatMessage', async (data) => {
    try {
      const message = {
        user: data.user,
        message: data.message
      };
      await Message.create(message);
      io.emit('message', message);
    } catch (error) {
      console.error('Error al guardar el mensaje en la base de datos', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});