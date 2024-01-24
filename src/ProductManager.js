const fs = require('fs').promises;

class ProductManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.loadProducts();
    this.id = this.calculateNextId();
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
        console.error("Los datos en el archivo no son un array válido.");
        this.products = [];
      }
    } catch (error) {
      this.products = [];
    }
  }

  async saveProducts() {
    const data = JSON.stringify({ products: this.products }, null, 2);
    try {
      await fs.writeFile(this.filePath, data);
    } catch (error) {
      console.error("Error al guardar productos", error);
      throw error;
    }
  }

  addProduct(product) {
    if (!product.title || !product.description || !product.price || !product.thumbnail || !product.code || !product.stock) {
      console.error("Todos los campos son obligatorios.");
      return;
    }

    const isCodeUnique = this.products.some(existingProduct => existingProduct.code === product.code);
    if (!isCodeUnique) {
      console.error("Hay un producto con el mismo código que ya existe.");
      return;
    }

    product.id = this.id++;
    this.products.push(product);
    this.saveProducts().then(() => {
      console.log("Producto agregado:", product);
    });
  }

  getProducts() {
    return this.loadProducts().then(() => this.products);
  }

  async getProductById(productId) {
    try {
      await this.loadProducts();
      const product = this.products.find(product => product.id === productId);

      if (product) {
        return product;
      } else {
        console.log("Producto no encontrado");
        return undefined;
      }
    } catch (error) {
      console.error("Error al obtener el producto por ID", error);
      throw error;
    }
  }

  updateProduct(productId, updatedProduct) {
    this.products = this.products.map(product =>
      product.id === productId ? { ...product, ...updatedProduct } : product
    );
    this.saveProducts().then(() => {
      console.log("Producto actualizado:", this.getProductById(productId));
    });
  }

  deleteProduct(productId) {
    this.products = this.products.filter(product => product.id !== productId);
    this.saveProducts().then(() => {
      console.log("Producto eliminado con ID:", productId);
    });
  }
}

module.exports = ProductManager;
