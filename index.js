const fs = require('fs');

class ProductManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.products = this.loadProducts();
  }

  loadProducts() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data) || [];
    } catch (error) {
      return [];
    }pas
  }

  saveProducts() {
    const data = JSON.stringify(this.products, null, 2);
    fs.writeFileSync(this.filePath, data);
  }

  addProduct(title, description, price, thumbnail, code, stock) {
    if (!title || !description || !price || !thumbnail || !code || !stock) {
      console.error("Todos los campos son obligatorios.");
      return;
    }

    const isCodeUnique = !this.products.some(product => product.code === code);
    if (!isCodeUnique) {
      console.error("Hay un producto con el mismo código que ya existe.");
      return;
    }

    const newProduct = {
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
    };
    this.products.push(newProduct);
    this.saveProducts();
    console.log("Producto agregado:", newProduct);
  }

  getProducts() {
    return this.products;
  }

  getProductByCode(productCode) {
    const product = this.products.find(product => product.code === productCode);

    if (product) {
      return product;
    } else {
      console.log("Producto no encontrado");
      return undefined;
    }
  }

  updateProduct(productCode, updatedProduct) {
    this.products = this.products.map(product =>
      product.code === productCode ? { ...product, ...updatedProduct } : product
    );
    this.saveProducts();
    console.log("Producto actualizado:", this.getProductByCode(productCode));
  }

  deleteProduct(productCode) {
    // Encuentra el producto que coincida con el código
    const deletedProduct = this.products.find(product => product.code === productCode);

    // Filtra los productos y mantiene solo los código que no coincidan con productCode
    this.products = this.products.filter(product => product.code !== productCode);

    // Guarda la lista actualizada de productos, asumiendo que saveProducts() realiza esta tarea
    this.saveProducts();

    if (deletedProduct) {
        // Manda un mensaje indicando que el producto fue eliminado
        console.log("Producto eliminado:", deletedProduct.title);
    } else {
        console.log("No se encontró un producto con el código:", productCode);
    }
}

}


const productManager = new ProductManager('products.json');


productManager.addProduct('Milanesa a la Napolitana', 'Description 1', 10.99, 'thumbnail1.jpg', 1, 3);
productManager.addProduct('Pastel De Papa', 'Description 2', 19.99, 'thumbnail2.jpg', 4, 2);

console.log('Todos los productos:', productManager.getProducts());

console.log('Producto con código 1:', productManager.getProductByCode(1));

productManager.updateProduct(1, { price: 5.99 });

productManager.deleteProduct(1);
productManager.deleteProduct(5);




console.log('Todos los productos después de operaciones:', productManager.getProducts());