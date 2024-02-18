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
      // Guarda el mensaje en la base de datos MongoDB
      await Message.create(message);
      // Emite el mensaje a todos los clientes
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