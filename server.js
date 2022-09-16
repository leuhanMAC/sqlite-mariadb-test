const express = require("express");
const { createServer } = require('http');
const { Server: IOServer } = require('socket.io');
const hbs = require("express-handlebars");
const Container = require("./contenedor");
const { optionsMariaDB, optionsSQLite3 } = require("./options/config");


const productFiles = new Container(optionsMariaDB, "products");
const chat = new Container(optionsSQLite3, "messages");

const PORT = process.env.PORT || 3000;

const app = express();
const router = express.Router();
const httpServer = new createServer(app);
const io = new IOServer(httpServer);

//Handlebars
app.set("views", "./views");
app.set("view engine", "hbs");

app.engine(
    "hbs",
    hbs.engine({
        extname: ".hbs",
    })
);




// JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Router
app.use("/productos", router);

//Middlewares
const postMiddleware = (req, res, next) => {
    const { title, price, thumbnail } = req.body;

    if (!title || !price || !thumbnail) {
        res.status(400).json({
            error: "Faltan datos",
        });
        res.end();
        return;
    }

    next();
};

const urlMiddleware = (req, res, next) => {
    const patternURL = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg|webp)/;
    const { thumbnail } = req.body;
    if (!thumbnail) {
        next();
        return;
    } else if (!patternURL.test(thumbnail)) {
        res.status(400).json({
            error: "La URL no está en un formato válido (Debe empezar con el protocolo HTTP y terminar en jpg/gif/png/jpeg/webp)",
        });
        res.end();
        return;
    }

    next();
};

const priceMiddleware = (req, res, next) => {
    const patternPrice = /^(?=.*[1-9])[0-9]*[.]?[0-9]{1,2}$/;
    if (req.body.price) {
        req.body.price = Number(req.body.price);

        if (!patternPrice.test(req.body.price)) {
            res.status(400).json({
                error: "El precio no está en un formato válido (Debe ser un número con máximo dos decimales)",
            });
            res.end();
            return;
        }
    } else if (!req.body.price) {
        next();
        return;
    }

    next();
};

//App
app.get("/", async (req, res) => {
    const products = await productFiles.getAll();
    const messages = await chat.getAll();


    res.render("homepage", {
        products,
        messages,
        emptyProducts: !Boolean(products.length),
    });
});

app.get("/chat", async (req, res) => {
    const messages = await chat.getAll();

    res.render("chat", {
        messages
    });
})

app.get("/api/productos", async (req, res) => {
    const products = await productFiles.getAll();
    res.json(products)
    res.end();
});

router.get("/", async (req, res) => {
    const products = await productFiles.getAll();

    res.render("productList", {
        products,
        emptyProducts: !Boolean(products.length)
    })
})



router.post(
    "/",
    postMiddleware,
    urlMiddleware,
    priceMiddleware,
    async (req, res) => {
        const { title, price, thumbnail } = req.body;


        await productFiles.save({
            title,
            price,
            thumbnail,
        });
        res.redirect("/");
    }
);

//SocketIO
io.on("connection", async (socket) => {

    socket.on("add-product-server", async (data) => {
        await productFiles.save(data);
        io.emit("add-product-client", data);
        console.log('Product added!')
    });

    socket.on("add-message-server", async (data) => {
        await chat.save(data);
        io.emit("add-message-client", data);
        console.log('Message added!');
    })
});




httpServer.listen(PORT, () => {
    console.log('SERVER ON');
});
