const products = []

let id = 0

const addProduct = (title,description,price,thumbnail,code,stock) =>{

    if (!title || !description || !price || !thumbnail || !code || !stock) {
        console.error("Todos los campos son obligatorios.");
        return;
    }

    const isCodeUnique = !products.some(product => product.code === code);
    if (!isCodeUnique) {
        console.error("Hay un producto con el mismo codigo que ya existe");
        return;
    }

    const newProduct = {
        title,
        description,
        price,
        thumbnail,
        code: ++id,
        stock,
    }
    products.push(newProduct)
    console.log(newProduct)
}


const getProducts = () =>{
    return products;
}

const getProductById = (productCode) => {
    const product = products.find(product => product.code === productCode);

    if(product) {
       return product 
    } else {
        console.log ("Producto no encontrado");
        return undefined;
    }
  };
  

addProduct('Milanesa a la Napolitana', 'Description 1', 10.99, 'thumbnail1.jpg', 1, 3);
addProduct('Pastel De Papa', 'Description 2', 19.99, 'thumbnail2.jpg', 4, 2);

console.log(getProducts());
console.log(getProductById(1)); 
console.log(getProductById(4)); 
