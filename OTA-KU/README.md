# IF3250_K01_G04_IOM-02

## Deskripsi

OTA-KU adalah sistem berbasis web yang dirancang untuk mengelola program Orang Tua Asuh (OTA) di Institut Teknologi Bandung (ITB), yang merupakan salah satu bentuk bantuan dari Ikatan Orang Tua Mahasiswa ITB (IOM-ITB). Sistem ini memfasilitasi proses pencocokan antara Orang Tua Mahasiswa (OTM) yang ingin menjadi donatur dengan mahasiswa ITB yang membutuhkan dukungan finansial. Mahasiswa yang membutuhkan bantuan dapat mendaftar dengan mengisi formulir pengajuan, sementara OTM yang ingin menjadi Orang Tua Asuh dapat mendaftar melalui formulir khusus dan mendapatkan akses ke dashboard untuk memilih mahasiswa yang akan diasuh. Sistem ini memiliki tiga jenis pengguna utama, yaitu Mahasiswa, Orang Tua Asuh, dan Pengurus. Aplikasi ini bekerja secara online sehingga pengguna perlu melakukan login untuk melakukan autentikasi terlebih dahulu untuk menjalankan website.

## Instalasi dan Cara Menjalankan Program
1. Tambahkan file `.env` dan `.env.local` pada folder backend dengan isi seperti pada `.env.example`. Tambahkan juga file `.env` pada folder frontend dengan isi seperti pada `.env.example`.

2. Jalankan command berikut pada terminal:

    ```bash
    docker compose build
    docker compose up -d
    ```

3. Agar website dapat berjalan sesuai dengan yang diharapkan, maka perlu dilakukan konfigurasi pada database.

    ```bash
    cd backend
    npm install
    npm run drizzle-kit:migrate:local # Pastikan port di .env.local sesuai dengan port yang digunakan pada docker-compose.yml
    ```

    Selain itu, akun admin harus ditambahkan ke database secara manual.

    ```sql
    INSERT INTO account (email, phoneNumber, password, type, provider, status, application_status) VALUES ('admin@example.com', '081234567890', 'password', 'type', 'credentials', 'verified', 'accepted');

    INSERT INTO account_admin_detail (account_id, name) VALUES ('admin_id', 'Admin');
    ```

4. Website dapat diakses melalui `http://localhost:5173`.

## Deployment

### Deployment Menggunakan Coolify

1. Siapkan server Coolify

2. Buat project baru di Coolify

    - Login ke dashboard Coolify.
    - Pilih "Create New Project" dan hubungkan repository.
    - Pilih branch yang ingin dideploy.

3. Konfigurasi environment variable

    - Tambahkan seluruh environment variable yang dibutuhkan oleh aplikasi.

4. Pilih file Docker Compose production

    - Pada pengaturan deployment di Coolify, pastikan memilih file `docker-compose.production.yml` sebagai konfigurasi utama.

5. Deploy aplikasi

    - Klik "Deploy" pada project
    - Coolify akan otomatis membangun dan menjalankan container sesuai konfigurasi Docker Compose.

6. Konfigurasi Database & Admin

    - Lakukan migrasi database.
    - Tambahkan akun admin ke database.

7. Akses website melalui `https://<domain>`

### Deployment Menggunakan Docker

1. Clone repository ke server.

    ```bash
    git clone git@gitlab.informatika.org:Sandwicheese/if3250_k01_g04_iom-02.git
    ```

2. Tambahkan file `.env` dan `.env.local` pada folder backend dengan isi seperti pada `.env.example`. Tambahkan juga file `.env` pada folder frontend dengan isi seperti pada `.env.example`.

3. Untuk migration awal, expose sementara port 54342 pada docker-compose.production.yaml

4. Jalankan command berikut pada terminal:

    ```bash
    docker compose -f docker-compose.production.yml build
    docker compose -f docker-compose.production.yml up -d
    ```

5. Konfigurasi Database & Admin

    - Lakukan migrasi database.

     ```bash
    cd backend
    npm install
    npm run drizzle-kit:migrate:local # Pastikan port di .env.local sesuai dengan port yang digunakan pada docker-compose.production.yml
    ```

    - Tambahkan akun admin ke database.

    ```sql
    INSERT INTO account (email, phone_number, password, type, provider, status, application_status) VALUES ('admin@example.com', '081234567890', 'password', 'type', 'credentials', 'verified', 'accepted');

    INSERT INTO account_admin_detail (account_id, name) VALUES ('admin_id', 'Admin');
    ```

6. Tutup kembali port 54342 pada docker-compose.production.yaml

7. Akses website melalui `https://<domain>`

### Catatan
Login menggunakan Microsoft Azure untuk saat ini masih mengalami kendala 401 (unauthorized) karena domain ota.iom-itb.id masih belum diizinkan untuk mengakses SSO oleh authenticator ITB

## Anggota

| Nama                             | NIM      |
|----------------------------------|----------|
| Shafiq Irvansyah                 | 13522003 |
| Ahmad Naufal Ramadan             | 13522005 |
| Yusuf Ardian Sandi               | 13522015 |
| Randy Verdian                    | 13522067 |
| Ellijah Darrellshane Suryanegara | 13522097 |
