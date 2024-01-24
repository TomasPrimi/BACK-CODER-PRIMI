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
  }
  
  module.exports = CartManager;