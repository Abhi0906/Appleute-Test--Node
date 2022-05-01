const express = require("express");
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const cors = require('cors')
const Customer = require('./models/customer')
const Order = require('./models/order')
const Product = require('./models/product')

mongoose.connect('mongodb://localhost:27017/appleuteTest');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('/views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// app.use(function (req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
//     next();
// });

app.get("/", (req, res) => {
    res.render("home");
})

app.post('/seedCustomer', async (req, res) => {      //add customer to Database
    const customer = new Customer({
        c_name: req.body.c_name,
        c_state: req.body.c_state,
        c_country: req.body.c_country,
        c_city: req.body.c_city,
        c_email: req.body.c_email,
        orders: []
    })
    await customer.save();
    res.send("Added Customer")
})

app.post('/deleteCustomers', async (req, res) => {
    await Customer.deleteMany({})
    res.send('Deleted Successfully')
})


app.post('/seedOrder', async (req, res) => {         //add order to database
    const order = new Order({
        orderId: req.body.orderId,
        orderDate: Date.now(),
        orderStatus: req.body.status
    })
    await order.save();
    res.send("Added Order")
})

app.post('/deleteOrders', async (req, res) => {
    await Order.deleteMany({})
    res.send('Deleted Successfully')
})

app.post('/seedProduct', async (req, res) => {       //add product to database
    const product = new Product({
        p_name: req.body.name,
        p_quantity: req.body.quantity,
        p_id: req.body.skuid,
    })
    await product.save();
    res.send("Added Product")
})

app.post("/deleteProducts", async (req, res) => {
    await Product.deleteMany({});
    res.send('Deleted Successfully')
})

app.get("/customers", async (req, res) => {         //get all customers
    const customer = await Customer.find({});
    res.send(customer);
})

app.get("/orders", async (req, res) => {            //get all orders
    const order = await Order.find({});
    res.send(order);
})

app.get("/products", async (req, res) => {          //get all products
    const product = await Product.find({});
    res.send(product);
})

app.get("/customer/:cid/orders", async (req, res) => {      //get customer orders based on customer id
    const cust_id = req.params.cid;
    const customer = await Customer.findById(cust_id).populate({
        path: 'orders',
        populate: {
            path: 'products'
        }
    });
    res.send(customer.orders);
})

app.get("/order/:oid/products", async (req, res) => {       //get products in orders based on order id
    const or_id = req.params.oid;
    const order = await Order.findById(or_id).populate('products');
    res.send(order.products);
})

app.get("/customer/:cid", async (req, res) => {
    const cid = req.params.cid;
    const customer = await Customer.find({ _id: cid }).populate('orders');
    res.send(customer);
})

app.get("/order/:or_id", async (req, res) => {
    const or_id = req.params.or_id;
    const order = await Order.find({ _id: or_id }).populate('products');
    res.send(order);
})

app.get("/product/:skuid", async (req, res) => {
    const pr_id = req.params.skuid;
    const product = await Product.find({ p_id: pr_id });
    res.send(product);
})

app.get("/customer/:cid/order/:oid", async (req, res) => {      //linking an order to customer
    const cust_id = req.params.cid;
    const or_id = req.params.oid;
    const customer = await Customer.findById(cust_id);
    customer.orders.push(or_id)
    await customer.save();
    res.redirect(`/customer/${cust_id}/orders`)
})

app.get("/order/:oid/product/:pid", async (req, res) => {       //linking a product to order
    const or_id = req.params.oid;
    const pr_id = req.params.pid;
    const order = await Order.findById(or_id);
    order.products.push(pr_id)
    await order.save();
    res.redirect(`/order/${or_id}/products`)
})

app.post('/product/:skuid', async (req, res) => {               //update product
    const sku_id = req.params.skuid;
    const qty = req.body.quantity;
    const name = req.body.name;
    const id = req.body.id;
    qty && await Product.findOneAndUpdate({ p_id: sku_id }, { p_quantity: qty });
    name && await Product.findOneAndUpdate({ p_id: sku_id }, { p_name: name });
    id && await Product.findOneAndUpdate({ p_id: sku_id }, { p_id: id });
    res.send("Updated")
})

app.post('/order/:oid', async (req, res) => {
    const or_id = req.params.oid;
    const status = req.body.orderStatus;
    const id = req.body.id;
    status && await Order.findOneAndUpdate({ _id: or_id }, { orderStatus: status });
    id && await Order.findOneAndUpdate({ _id: or_id }, { orderId: id });
    res.redirect('/')
})


const port = 3001;
app.listen(port, () => {
    console.log(`Connected to Port: ${port}`)
});