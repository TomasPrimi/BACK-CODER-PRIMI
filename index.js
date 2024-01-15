const fs = require('fs');

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
}

const productManager = new ProductManager('products.json');

productManager.addProduct({
  title: 'Milanesa a la Napolitana',
  description: 'Description 1',
  price: 10.99,
  thumbnail: 'thumbnail1.jpg',
  code: 1,
  stock: 3
});

productManager.addProduct({
  title: 'Pastel De Papa',
  description: 'Description 2',
  price: 19.99,
  thumbnail: 'thumbnail2.jpg',
  code: 4,
  stock: 2
});

console.log('Todos los productos:', productManager.getProducts());
console.log('Producto con ID 1:', productManager.getProductById(1));

productManager.updateProduct(1, { price: 15.99 });

productManager.deleteProduct(4);

console.log('Todos los productos después de operaciones:', productManager.getProducts());