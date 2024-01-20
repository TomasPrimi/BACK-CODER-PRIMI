const fs = require('fs').promises;

class ProductManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.loadProducts();
    this.id = this.calculateNextId();
  }

  calculateNextId() {
    const maxId = this.products.reduce((max, product) => (product.id > max ? product.id : max), 0);
    return maxId + 1;
  }

  loadProducts() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
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


  saveProducts() {
    const data = JSON.stringify({ products: this.products }, null, 2);
    fs.writeFileSync(this.filePath, data);
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
    this.saveProducts();
    console.log("Producto agregado:", product);
  }

  getProducts() {
    this.loadProducts();
    return this.products;
  }

  getProductById(productId) {
    this.loadProducts();
    const product = this.products.find(product => product.id === productId);

    if (product) {
      return product;
    } else {
      console.log("Producto no encontrado");
      return undefined;
    }
  }

  updateProduct(productId, updatedProduct) {
    this.products = this.products.map(product =>
      product.id === productId ? { ...product, ...updatedProduct } : product
    );
    this.saveProducts();
    console.log("Producto actualizado:", this.getProductById(productId));
  }

  deleteProduct(productId) {
    this.products = this.products.filter(product => product.id !== productId);
    this.saveProducts();
    console.log("Producto eliminado con ID:", productId);
  }

  async getProductById(productId) {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const parsedData = JSON.parse(data);

      this.products = Array.isArray(parsedData.products) ? parsedData.products : [];

      if (!Array.isArray(this.products)) {
        console.error("Los datos en el archivo no son un array válido.");
        this.products = [];
      }

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
}

module.exports = ProductManager;
