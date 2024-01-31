const express = require('express');
const ProductManager = require('./ProductManager');
const CartManager = require('./CartManager'); 

const app = express();
const port = 4000;
const productManager = new ProductManager('products.json');
const cartManager = new CartManager('carts.json'); 

app.post('/api/carts/create/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const newCart = await cartManager.createCart(userId);
    res.json({ cart: newCart });
  } catch (error) {
    console.error('Error al crear un carrito', error);
    res.status(500).json({ error: 'Error al crear un carrito' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const limit = req.query.limit;
    const products = limit ? await productManager.getProducts().then(products => products.slice(0, limit)) : await productManager.getProducts();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/api/carts', async (req, res) => {
  try {
    const carts = await cartManager.getCarts();
    res.json({ carts });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener carritos' });
  }
});

// Agregar un producto a un carrito
app.post('/api/carts/:cartId/add-product/:productId', async (req, res) => {
  try {
    const cartId = parseInt(req.params.cartId);
    const productId = parseInt(req.params.productId);
    const product = await productManager.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    await cartManager.addToCart(cartId, product);
    const updatedCart = await cartManager.getCartById(cartId);
    res.json({ cart: updatedCart });
  } catch (error) {
    console.error('Error al agregar producto al carrito', error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
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
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

app.get('/:cid', async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const cart = await cartManager.getCartById(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    const products = await productManager.getProductsInCart(cart.products);
    res.json({ products });
  } catch (error) {
    console.error('Error al obtener los productos del carrito', error);
    res.status(500).json({ error: 'Error al obtener los productos del carrito' });
  }
});

app.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);
    const productId = parseInt(req.params.pid);
    const cart = await cartManager.getCartById(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    const product = await productManager.getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const result = await cartManager.addProductToCart(cartId, productId);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    const updatedCart = await cartManager.getCartById(cartId);
    res.json({ cart: updatedCart });
  } catch (error) {
    console.error('Error al agregar producto al carrito', error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
