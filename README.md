# Much-Tugas2 - AWS S3 File Upload with Database Integration

Aplikasi web sederhana untuk upload file ke AWS S3 dengan integrasi database MySQL RDS untuk menyimpan metadata file dan informasi mahasiswa.

Aplikasi ini menerapkan separation of concerns dimana:

- AWS S3 Bucket berperan sebagai object storage untuk menyimpan file
- MySQL RDS berperan sebagai metadata repository untuk menyimpan informasi lokasi file pada S3 bucket

## 🚀 Fitur

- Upload file ke AWS S3 bucket
- Integrasi dengan AWS RDS MySQL untuk menyimpan metadata
- File listing dengan filter dan search
- Download file langsung dari S3 bucket

## 📋 Prerequisites

Sebelum memulai, pastikan Anda sudah menginstall:

- **Node.js** (versi 14.x atau lebih tinggi)
- **npm** (biasanya sudah terinstall bersamaan dengan Node.js)
- **Git** (untuk clone repository)
- **AWS Account** dengan akses ke S3 dan RDS

## 🛠️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/MuchTrie/Cloud-Computing_Tugas2.git
cd Cloud-Computing_Tugas2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env` di root directory:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket_name

# Database Configuration
DB_HOST=your_rds_endpoint
DB_PORT=3306
DB_NAME=your_database_name
DB_USER=your_db_username
DB_PASSWORD=your_db_password

# Application Configuration
PORT=3000
```


### 4. Setup Database Schema

Jalankan script SQL berikut untuk membuat tabel yang diperlukan:

```sql
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    nrp VARCHAR(10) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    s3_filename VARCHAR(255) NOT NULL,
    s3_url TEXT NOT NULL,
    file_size INT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Create Database User

Sebelum menjalankan aplikasi, buat user database terlebih dahulu:

1. Atur konfigurasi pada script `create-user.js`
2. Jalankan script:

```bash
node create-user.js
```

Script ini akan:
- Membuat user baru di database MySQL
- Memberikan permission yang diperlukan untuk aplikasi
- Memastikan koneksi database berhasil

## 🚀 Menjalankan Aplikasi

### Development Mode

```bash
npm start
# atau
node index.js
```

Server akan berjalan di: `http://localhost:3000`

