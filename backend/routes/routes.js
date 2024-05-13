const express = require('express');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const router = express.Router();

const multer = require('multer')

const fileUpload = multer().single('image');
  
  // Handle POST request to upload images
  router.post('/images/post', fileUpload, (req, res) => {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
  
    const file = req.file;
  
    // Check file size
    if (file.size > 6000000) { // 6MB in bytes
      // Compress the image
      sharp(req.file.buffer)
        .resize({ width: 800 }) // Adjust the dimensions as needed
        .toBuffer()
        .then(compressedData => {
          // Upload the compressed image to MySQL
          req.getConnection((err, conn) => {
            if (err) {
              console.error('Error connecting to MySQL:', err);
              res.status(500).send('Server Error');
              return;
            }
            conn.query('INSERT INTO image (type, name, data) VALUES (?, ?, ?)', [file.mimetype, file.originalname, compressedData], (err, results) => {
              if (err) {
                console.error('Error uploading compressed image to MySQL:', err);
                res.status(500).send('Server Error');
                return;
              }
              console.log('Compressed image uploaded to MySQL');
              res.send('Compressed image uploaded successfully!');
            });
          });
        })
        .catch(err => {
          console.error(err);
          res.status(500).send('Compression error.');
        });
    } else {
      // Upload the original image to MySQL
      req.getConnection((err, conn) => {
        if (err) {
          console.error('Error connecting to MySQL:', err);
          res.status(500).send('Server Error');
          return;
        }
        conn.query('INSERT INTO image (type, name, data) VALUES (?, ?, ?)', [file.mimetype, file.originalname, file.buffer], (err, results) => {
          if (err) {
            console.error('Error uploading image to MySQL:', err);
            res.status(500).send('Server Error');
            return;
          }
          console.log('Image uploaded to MySQL');
          res.send('Image uploaded successfully!');
        });
      });
    }
  });
// Handle GET request to retrieve images
router.get('/images/get', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error connecting to Mysql');

        conn.query('SELECT id, data FROM image', (err, rows) => {
            if (err) return res.status(500).send('Error selecting id,data from image');

            // Convert the binary data to base64 and send as JSON response
            const imageData = rows.map(img => {
                return {
                    id: img.id,
                    data: Buffer.from(img.data, 'binary').toString('base64')
                };
            });

            res.json(imageData);
        });
    });
});

// Handle DELETE request to delete an image
router.delete('/images/delete/:id', (req, res) => {
    req.getConnection((err, conn) => {
        if (err) return res.status(500).send('Error connecting to Mysql');

        conn.query('DELETE FROM image WHERE id = ?', [req.params.id], (err, rows) => {
            if (err) return res.status(500).send('Error while doing query for deleting the image');

            res.send('Image deleted');
        });
    });
});

module.exports = router;
