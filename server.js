const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

// Serve static files from the 'public' directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

// Function to recursively get directories
function getDirectories(dir) {
    const dirs = fs.readdirSync(dir).filter(file => {
        const fullPath = path.join(dir, file);
        return fs.statSync(fullPath).isDirectory();
    });
    return dirs;
}

// Function to get all images in a directory
function getAllImages(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllImages(fullPath));
        } else if (stat && (file.endsWith('.jpg') || file.endsWith('.png'))) {
            const category = path.relative('public/images', path.dirname(fullPath)).replace(/\\/g, '/');
            results.push({
                file,
                category
            });
        }
    });
    return results;
}

// Endpoint to get all images
app.get('/api/images', (req, res) => {
    const imagesDir = path.join(__dirname, 'public/images');
    const images = getAllImages(imagesDir);
    res.json(images);
});

// Endpoint to get categories
app.get('/api/categories', (req, res) => {
    const imagesDir = path.join(__dirname, 'public/images');
    const categories = getDirectories(imagesDir);
    res.json(categories.map(cat => ({ name: cat })));
});

app.get('/', (req, res) => {
    res.render('index');
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
