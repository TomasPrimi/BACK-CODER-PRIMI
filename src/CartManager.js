const fs = require('fs').promises;

class CartManager {
  constructor(filePath) {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path for CartManager');
    }

    this.filePath = filePath;
    this.loadCarts();
  }

  async saveCarts() {
    const data = JSON.stringify({ carts: this.carts }, null, 2);
    try {
      await fs.writeFile(this.filePath, data);
    } catch (error) {
      console.error('Error saving carts', error);
      throw error;
    }
  }

  async loadCarts() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const parsedData = JSON.parse(data);

      this.carts = Array.isArray(parsedData.carts) ? parsedData.carts : [];

      if (!Array.isArray(this.carts)) {
        console.error('Data in the file is not a valid array for carts.');
        this.carts = [];
      }
    } catch (error) {
      this.carts = [];
      console.error('Error loading carts', error);
    }
  }

  generateUniqueId() {
    return Date.now().toString();
  }

  async getCartById(cartId) {
    try {
      await this.loadCarts();
      const cart = this.carts.find(cart => cart.id == cartId);

      if (cart) {
        return cart;
      } else {
        console.log('Cart not found');
        return undefined;
      }
    } catch (error) {
      console.error('Error getting cart by ID', error);
      throw error;
    }
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    try {
      await this.loadCarts();

      const cart = this.carts.find(cart => cart.id == cartId);

      if (!cart) {
        throw new Error('Cart not found');
      }

      const existingProduct = cart.products.find(product => product.id === productId);

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({ id: productId, quantity });
      }

      await this.saveCarts();

      return cart.products;
    } catch (error) {
      console.error('Error adding product to cart', error);
      throw error;
    }
  }

  async createCart() {
    try {
      await this.loadCarts();

      const newCart = {
        id: this.generateUniqueId(),
        products: [],
      };

      this.carts.push(newCart);

      await this.saveCarts();

      console.log('New cart created:', newCart);

      return newCart;
    } catch (error) {
      console.error('Error creating a new cart', error);
      throw error;
    }
  }

  async loadProducts() {
    try {
      const data = await fs.readFile('products.json', 'utf8');
      const parsedData = JSON.parse(data);
  
      this.products = Array.isArray(parsedData.products) ? parsedData.products : [];
  
      if (!Array.isArray(this.products)) {
        console.error("Los datos en el archivo no son un array válido.");
        this.products = [];
      }
    } catch (error) {
      this.products = [];
      console.error("Error al cargar productos", error);
    }
  }
  

  async getProductsInCart(cartProducts) {
    try {
      console.log('Loading products...');
      await this.loadProducts();
      console.log('Products loaded:', this.products);
  
      const productsInCart = this.products.filter(product => cartProducts.some(cartProduct => cartProduct.id === product.id));
      console.log('Products in cart:', productsInCart);
  
      return productsInCart;
    } catch (error) {
      console.error('Error al obtener los productos en el carrito', error);
      throw error;
    }
  }
  
  
}

module.exports = CartManager;
