const fs = require ('fs').promises

class CartManager {
  async addToCart(cartId, product) {
    try {
      await this.loadCarts();

      const cart = this.carts.find(cart => cart.id === cartId);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      if (!product || typeof product !== 'object') {
        throw new Error('El producto no es válido');
      }

      const isProductInCart = cart.products.some(p => p.id === product.id);
      if (isProductInCart) {
        throw new Error('El producto ya está en el carrito');
      }

      cart.products.push(product);

      await this.saveCarts();

      console.log('Producto agregado al carrito:', product);
    } catch (error) {
      console.error('Error al agregar producto al carrito', error);
      throw error;
    }
  }

  async removeFromCart(cartId, productId) {
    try {
      await this.loadCarts();

      const cart = this.carts.find(cart => cart.id === cartId);

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      const index = cart.products.findIndex(product => product.id === productId);

      if (index === -1) {
        throw new Error('Producto no encontrado en el carrito');
      }

      cart.products.splice(index, 1);

      await this.saveCarts();

      console.log('Producto eliminado del carrito:', productId);
    } catch (error) {
      console.error('Error al eliminar producto del carrito', error);
      throw error;
    }
  }

  async createCart(userId) {
    try {
      await this.loadCarts();

      const newCart = {
        id: generateUniqueId(), // Genera un ID único para el carrito
        userId: userId,
        products: []
      };

      this.carts.push(newCart);

      await this.saveCarts();

      console.log('Nuevo carrito creado:', newCart);
      
      return newCart;
    } catch (error) {
      console.error('Error al crear un nuevo carrito', error);
      throw error;
    }
  }
}

module.exports = CartManager;
