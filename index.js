const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Konfigurasi AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-access-key-here',    
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-key-here', 
  region: process.env.AWS_REGION || 'ap-southeast-2' 
});

const s3 = new AWS.S3();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('views'));

// Route untuk halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route untuk halaman files (halaman baru)
app.get('/files', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'list-files.html'));
});

// Route untuk halaman files lama (jika masih dibutuhkan)
app.get('/files-old', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'files.html'));
});

// API endpoint untuk mendapatkan list files dari S3
app.get('/api/files', async (req, res) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME || 'much-bucket'
    };
    
    const data = await s3.listObjectsV2(params).promise();
    const files = data.Contents.map(file => ({
      name: file.Key,
      size: formatFileSize(file.Size),
      uploadDate: formatDate(file.LastModified),
      url: `https://much-bucket.s3.ap-southeast-2.amazonaws.com/${file.Key}`
    }));
    
    res.json(files);
  } catch (err) {
    console.error('Error listing files:', err);
    res.status(500).json({ error: 'Error retrieving files' });
  }
});

// Helper function untuk format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Helper function untuk format date
function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded"
    });
  }

  const { nama, nrp } = req.body;
  
  if (!nama || !nrp) {
    return res.status(400).json({
      success: false,
      message: "Nama dan NRP harus diisi"
    });
  }

  const fileContent = fs.readFileSync(req.file.path);
  
  // Format nama file: [NRP]_[Nama]_[OriginalFileName]
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedNama = nama.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${nrp}_${sanitizedNama}_${timestamp}_${req.file.originalname}`;
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME || 'much-bucket', 
    Key: fileName,
    Body: fileContent
  };

  s3.upload(params, function(err, data) {
    fs.unlinkSync(req.file.path); // Hapus file lokal setelah diunggah
    if (err) {
      console.error('S3 Upload Error:', err);
      return res.status(500).json({
        success: false,
        message: "Error saat mengunggah file ke S3"
      });
    }
    
    res.json({
      success: true,
      message: "Tugas berhasil diupload!",
      data: {
        nama: nama,
        nrp: nrp,
        fileName: req.file.originalname,
        location: data.Location
      }
    });
  });
});

app.listen(port, () => {
  console.log('Server berjalan di http://localhost:3000');
});