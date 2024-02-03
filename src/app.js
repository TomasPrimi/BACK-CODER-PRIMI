const express = require('express');
const ProductManager = require('./productManager');
const CartManager = require('./cartManager');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;
const productManager = new ProductManager('products.json');
const cartManager = new CartManager('carts.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/api/products', async (req, res) => {
  try {
    const limit = req.query.limit;
    const products = limit ? await productManager.getProducts().then(products => products.slice(0, limit)) : await productManager.getProducts();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: 'Error getting products' });
  }
});

app.get('/api/products/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const product = await productManager.getProductById(productId);
    if (product) {
      res.json({ product });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error getting the product' });
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
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating the product' });
  }
});

app.delete('/api/products/:pid', async (req, res) => {
  try {
    const productId = parseInt(req.params.pid);
    const deleted = await productManager.deleteProduct(productId);

    if (deleted) {
      res.json({ product: deleted });
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting the product' });
  }
});

app.post('/api/carts', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.json({ cart: newCart });
  } catch (error) {
    console.error('Error creating a cart', error);
    res.status(500).json({ error: 'Error creating a cart' });
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

app.post('/api/carts/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    const productsInCart = await cartManager.addProductToCart(cartId, productId, quantity);

    if (productsInCart.length > 0) {
      res.json({ products: productsInCart });
    } else {
      res.status(404).json({ error: 'Cart or product not found' });
    }
  } catch (error) {
    console.error('Error adding product to cart', error);
    res.status(500).json({ error: 'Error adding product to cart' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
