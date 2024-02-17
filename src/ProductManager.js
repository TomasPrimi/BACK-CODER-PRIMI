const fs = require('fs').promises;

class ProductManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.loadProducts();
  }

  calculateNextId() {
    const maxId = this.products ? this.products.reduce((max, product) => (product.id > max ? product.id : max), 0) : 0;
    return maxId + 1;
  }

  
  async loadProducts() {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const parsedData = JSON.parse(data);

      this.products = Array.isArray(parsedData.products) ? parsedData.products : [];

      if (!Array.isArray(this.products)) {
        console.error('La informacion no es valida.');
        this.products = [];
      }
    } catch (error) {
      this.products = [];
      console.error('Error cargando los productos', error);
    }
  }

  async saveProducts() {
    const data = JSON.stringify({ products: this.products }, null, 2);
    try {
      await fs.writeFile(this.filePath, data);
    } catch (error) {
      console.error('Error guardando los productos', error);
      throw error;
    }
  }

  addProduct(product) {
    if (!product.title || !product.description || !product.price || !product.code || !product.stock) {
      console.error('All fields are mandatory.');
      return;
    }

    const isCodeUnique = this.products.some(existingProduct => existingProduct.code === product.code);
    if (isCodeUnique) {
      console.error('Ya existe un producto con el mismo codigo.');
      return;
    }

    product.id = this.calculateNextId();
    this.products.push(product);
    this.saveProducts().then(() => {
      console.log('Producto añadido correctamente:', product);
    });
  }

  async getProducts() {
    await this.loadProducts();
    return this.products;
  }

  async getProductById(productId) {
    try {
      await this.loadProducts();
      const product = this.products.find(product => product.id === productId);

      if (product) {
        return product;
      } else {
        console.log('Producto no encontrado');
        return undefined;
      }
    } catch (error) {
      console.error('Error obteniendo el producto mediante el id', error);
      throw error;
    }
  }

  async updateProduct(productId, updatedProduct) {
    try {
      await this.loadProducts();
  
      const productIndex = this.products.findIndex(product => product.id === productId);
  
      if (productIndex === -1) {
        throw new Error('Producto no encontrado');
      }
  
      this.products[productIndex] = { ...this.products[productIndex], ...updatedProduct };
  
      await this.saveProducts();
  
      console.log('Producto actualizado:', this.products[productIndex]);
      return this.products[productIndex];
    } catch (error) {
      console.error('Error al actualizar producto', error);
      throw error;
    }
  }
  
  
  async deleteProduct(productId) {
    try {
      await this.loadProducts();
  
      const index = this.products.findIndex(product => product.id === productId);
  
      if (index === -1) {
        throw new Error('Producto no encontrado');
      }
  
      const deletedProduct = this.products.splice(index, 1)[0];
  
      await this.saveProducts();
  
      console.log('Producto eliminado:', deletedProduct);
      return deletedProduct;
    } catch (error) {
      console.error('Error al eliminar producto', error);
      throw error;
    }
  }
  
}

module.exports = ProductManager;