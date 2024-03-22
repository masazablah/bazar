const express = require('express');
const app = express();
const fs = require('fs');
const csv = require('csv-parser');
const PORT = process.env.PORT || 4000;
const catalog = [];
const soldBooks = [];
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Use Express's built-in middleware to parse JSON bodies
app.use(express.json());

fs.createReadStream('catalog.csv')
    .pipe(csv())
    .on('data', (data) => catalog.push(data))
    .on('end', () => {
        console.log('CSV file processing completed.');
        console.log(catalog); // This will show the content of catalog
    })
    .on('error', (error) => {
        console.error('Error reading CSV file:', error);
    });


app.get('/CATALOG_WEBSERVICE_IP/:topic', (req, res) => {
    const topic = req.params.topic;
    let result = [];
    let j = 0;
    for (var i in catalog) {
        if (catalog[i].topic === topic) {
            result[j] = catalog[i];
            j++;
        }
    }
    res.send(result);
})

app.get('/CATALOG_WEBSERVICE_IP/find/:itemName', (req, res) => {
    res.send("masa");
    const name = req.params.itemName;
    
    let result = [];
    let j = 0;
    for (var i in catalog) {
        if (catalog[i].title === name) {

            result[j] = catalog[i];
        }
    }
    res.send(result);
})

app.get('/CATALOG_WEBSERVICE_IP/getInfo/:itemNum', (req, res) => {
    const num = req.params.itemNum;
    let result = [];
    let j = 0;
    for (var i in catalog) {
        if (catalog[i].id === num) {
            result[j] = catalog[i];
        }
    }
    res.send(result);
})

 


app.get('/CATALOG_WEBSERVICE_IP/put/dec/:itemNum', (req, res) => {
    const num = req.params.itemNum;
   
    let result = [];
    let j = 0;
    for (var i in catalog) {
        if (catalog[i].id === num) {
            if (catalog[i].quantity > 0) {
                catalog[i].quantity = `${(parseInt(catalog[i].quantity) - 1)}`;
                const csvWriter = createCsvWriter({
                    path: 'catalog.csv',
                    header: [
                        { id: 'id', title: 'id' },
                        { id: 'price', title: 'price' },
                        { id: 'title', title: 'title' },
                        { id: 'quantity', title: 'quantity' },
                        { id: 'topic', title: 'topic' }
                    ]
                });
                csvWriter
                    .writeRecords(catalog)
                    .then(() => console.log(''));
            }
            result[j] = catalog[i];
        }
    }
    res.send(result);
})

app.get('/CATALOG_WEBSERVICE_IP/put/inc/:itemNum', (req, res) => {
    const num = req.params.itemNum;

    let result = [];
    let j = 0;
    for (var i in catalog) {
        if (catalog[i].id === num) {
            if (catalog[i].quantity > 0) {
                catalog[i].quantity = `${(parseInt(catalog[i].quantity) + 1)}`;
                const csvWriter = createCsvWriter({
                    path: 'catalog.csv',
                    header: [
                        { id: 'id', title: 'id' },
                        { id: 'price', title: 'price' },
                        { id: 'title', title: 'title' },
                        { id: 'quantity', title: 'quantity' },
                        { id: 'topic', title: 'topic' }
                    ]
                });
                csvWriter
                    .writeRecords(catalog)
                    .then(() => console.log(''));
            }
            result[j] = catalog[i];
        }
    }
    res.send(result);
})

app.get('/CATALOG_WEBSERVICE_IP/updatePrice/:itemNum/:newPrice', (req, res) => {
    const itemNum = req.params.itemNum;
    const newPrice = req.params.newPrice;

    let result = [];
    let j = 0;
    for (var i in catalog) {
        if (catalog[i].id === itemNum) {
            catalog[i].price = newPrice;
            const csvWriter = createCsvWriter({
                path: 'catalog.csv',
                header: [
                    { id: 'id', title: 'id' },
                    { id: 'price', title: 'price' },
                    { id: 'title', title: 'title' },
                    { id: 'quantity', title: 'quantity' },
                    { id: 'topic', title: 'topic' }
                ]
            });
            csvWriter
                .writeRecords(catalog)
                .then(() => console.log(''));

            result[j] = catalog[i];
        }
    }
    res.send(result);
})
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});

// add book 
app.post('/CATALOG_WEBSERVICE_IP/addBook', (req, res) => {
    const { title, price, quantity, topic } = req.body;

    // Generate the next ID
    let maxId = 0;
    catalog.forEach(book => {
        if (book.id && Number(book.id) > maxId) {
            maxId = Number(book.id);
        }
    });
    const newId = maxId + 1; // Auto-incremented ID

    // Add the new book to the catalog array
    const newBook = { id: newId.toString(), title, price, quantity, topic };
    catalog.push(newBook);

    // Update the catalog.csv file
    const csvWriter = createCsvWriter({
        path: 'catalog.csv',
        header: [
            { id: 'id', title: 'id' },
            { id: 'price', title: 'price' },
            { id: 'title', title: 'title' },
            { id: 'quantity', title: 'quantity' },
            { id: 'topic', title: 'topic' }
        ]
    });

    csvWriter.writeRecords(catalog) // Writing the entire updated catalog to ensure consistency
        .then(() => {
            console.log('Book added to catalog.');
            res.send({ message: 'Book successfully added to the catalog.', book: newBook });
        })
        .catch(error => {
            console.error('Failed to add book to catalog:', error);
            res.status(500).send({ message: 'Failed to add book to catalog.' });
        });
});

app.get('/CATALOG_WEBSERVICE_IP/books', (req, res) => {
    console.log('Fetching all books:', catalog);
    res.json(catalog);
});


