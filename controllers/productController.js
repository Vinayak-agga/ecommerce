const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.addProduct = async (req, res) => {
  const { name, price, imageURL, description, stock } = req.body;
  try {
    const newProduct = new Product({ name, price, imageURL, description, stock });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).send('Server error');
  }
};
