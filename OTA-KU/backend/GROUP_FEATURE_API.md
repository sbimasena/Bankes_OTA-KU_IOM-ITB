# Group Feature — Backend API Reference

> **Base URL:** `https://<host>/api`  
> **Auth:** semua endpoint memerlukan `Authorization: Bearer <token>` (JWT dari login)  
> **Content-Type request:** `multipart/form-data` untuk POST/DELETE dengan body; query string untuk GET  
> **Content-Type response:** `application/json`

---

## Daftar Isi

1. [Konsep & Aturan Bisnis](#konsep--aturan-bisnis)
2. [Role & Akses](#role--akses)
3. [Manajemen Grup](#manajemen-grup)
4. [Undangan Anggota](#undangan-anggota)
5. [Pemilihan Mahasiswa (Proposal & Voting)](#pemilihan-mahasiswa-proposal--voting)
6. [Koneksi Grup ↔ Mahasiswa](#koneksi-grup--mahasiswa)
7. [Transaksi Grup](#transaksi-grup)
8. [Terminasi Hubungan Asuh](#terminasi-hubungan-asuh)
9. [Status & Enum Reference](#status--enum-reference)

---

## Konsep & Aturan Bisnis

- Satu **OtaGroup** = kumpulan OTA yang bertindak sebagai sponsor bersama untuk mahasiswa
- Satu mahasiswa hanya bisa disponsori oleh **satu** grup ATAU **satu** OTA individu pada satu waktu
- Satu OTA bisa masuk **banyak** grup sekaligus
- **Alur grup:**  
  `forming` → (anggota diundang) → `active` → (propose mahasiswa) → (voting) → (admin verify) → koneksi diterima
- **Voting:** semua anggota harus setuju (unanimous); jika ada yang tidak setuju, proposal langsung `failed`
- **Minimum pledge:** total pledge semua anggota harus ≥ Rp800.000 agar proposal lolos ke admin
- Tidak ada grup leader; tidak ada dissolve grup

---

## Role & Akses

| Role | Kode di token |
|------|---------------|
| OTA (Orang Tua Asuh) | `ota` |
| Admin | `admin` |
| Bankes | `bankes` |
| Pengurus | `pengurus` |

**"Admin"** di dokumen ini berarti role `admin`, `bankes`, atau `pengurus`.

---

## Manajemen Grup

### `GET /api/group/my`
> OTA melihat daftar grup yang dia ikuti

**Role:** `ota`

**Response 200:**
```json
{
  "success": true,
  "message": "Daftar grup berhasil diambil",
  "body": {
    "data": [
      {
        "groupId": "uuid",
        "groupName": "Grup Alumni Teknik 2000",
        "groupStatus": "forming | active",
        "memberCount": 3,
        "activeConnectionCount": 1,
        "joinedAt": "2025-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

---

### `GET /api/group/list`
> Daftar semua grup (untuk halaman admin)

**Role:** admin

**Query params:**

| Param | Tipe | Keterangan |
|-------|------|------------|
| `q` | string (opsional) | Cari berdasarkan nama grup |
| `page` | number (opsional) | Pagination, default 1 |

**Response 200:**
```json
{
  "success": true,
  "message": "Daftar grup berhasil diambil",
  "body": {
    "data": [
      {
        "id": "uuid",
        "name": "Grup Alumni Teknik 2000",
        "status": "forming | active",
        "memberCount": 3,
        "activeConnectionCount": 1,
        "createdAt": "2025-01-15T00:00:00.000Z"
      }
    ],
    "totalData": 10
  }
}
```

---

### `POST /api/group/create`
> Membuat grup baru — OTA otomatis menjadi anggota pertama

**Role:** `ota` atau admin

**Form fields:**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `name` | string | ✅ | Nama grup (max 255 karakter) |
| `description` | string | ❌ | Deskripsi grup |
| `criteria` | string | ❌ | Kriteria mahasiswa yang ingin dibantu |
| `transferDate` | number (1–31) | ❌ | Tanggal transfer bulanan |

**Response 200:**
```json
{
  "success": true,
  "message": "Grup berhasil dibuat",
  "body": { "groupId": "uuid" }
}
```

---

### `GET /api/group/:id`
> Detail grup termasuk anggota dan undangan pending

**Role:** OTA (harus anggota grup) atau admin

**Response 200:**
```json
{
  "success": true,
  "message": "Detail grup berhasil diambil",
  "body": {
    "id": "uuid",
    "name": "Grup Alumni",
    "description": "...",
    "status": "forming | active",
    "criteria": "...",
    "transferDate": 15,
    "createdAt": "2025-01-15T00:00:00.000Z",
    "members": [
      { "otaId": "uuid", "name": "Budi", "joinedAt": "2025-01-15T00:00:00.000Z" }
    ],
    "pendingInvitations": [
      { "invitationId": "uuid", "invitedOtaId": "uuid", "invitedOtaName": "Siti" }
    ],
    "activeConnectionCount": 2
  }
}
```

---

### `POST /api/group/:id/activate`
> Mengaktifkan grup dari status `forming` → `active`

**Role:** admin  
**Syarat:** grup harus punya minimal 1 anggota

**Response 200:** `{ "success": true, "message": "Grup berhasil diaktifkan" }`

---

### `DELETE /api/group/:id/member/:otaId`
> Mengeluarkan anggota dari grup

**Role:** admin

**Response 200:** `{ "success": true, "message": "Anggota berhasil dikeluarkan dari grup" }`

---

## Undangan Anggota

### `GET /api/group/invitations/my`
> OTA melihat undangan grup yang belum direspons

**Role:** `ota`

**Response 200:**
```json
{
  "success": true,
  "message": "Daftar undangan berhasil diambil",
  "body": {
    "data": [
      {
        "invitationId": "uuid",
        "groupId": "uuid",
        "groupName": "Grup Alumni",
        "groupStatus": "forming | active",
        "invitedByName": "Budi" ,
        "createdAt": "2025-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

> `invitedByName` bisa `null` jika undangan dibuat oleh admin.

---

### `POST /api/group/:id/invite`
> Mengundang OTA lain ke grup

**Role:** `ota` (harus anggota grup) atau admin

**Form fields:**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| `invitedOtaId` | UUID | ✅ | ID OTA yang diundang |

**Error 400:** OTA sudah anggota atau sudah ada undangan pending  
**Response 200:** `{ "success": true, "message": "Undangan berhasil dikirim" }`

---

### `POST /api/group/invitation/:id/respond`
> OTA menerima atau menolak undangan

**Role:** `ota` (hanya penerima undangan)

**Form fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `response` | `"accepted"` \| `"rejected"` | Respons undangan |

**Response 200:** `{ "success": true, "message": "..." }`

---

## Pemilihan Mahasiswa (Proposal & Voting)

### `POST /api/group/:id/propose-student`
> Mengusulkan mahasiswa untuk disponsori grup

**Role:** `ota` (harus anggota grup) atau admin  
**Syarat:** grup harus `active`; mahasiswa harus `inactive` + `applicationStatus = accepted`

**Form fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `mahasiswaId` | UUID | ID mahasiswa yang diusulkan |

**Response 200:** `{ "success": true, "message": "Proposal berhasil dibuat" }`

---

### `GET /api/group/:id/proposals`
> Daftar proposal mahasiswa untuk sebuah grup beserta status voting

**Role:** `ota` (harus anggota grup) atau admin

**Response 200:**
```json
{
  "success": true,
  "message": "Daftar proposal berhasil diambil",
  "body": {
    "data": [
      {
        "id": "uuid",
        "mahasiswaId": "uuid",
        "mahasiswaName": "Andi",
        "mahasiswaNim": "13521001",
        "proposedById": "uuid | null",
        "proposedByName": "Budi | null",
        "status": "open | failed | passed | approved | rejected",
        "votes": [
          { "otaId": "uuid", "otaName": "Budi", "approve": true, "pledgeAmount": 400000 }
        ],
        "totalPledge": 400000,
        "memberCount": 2,
        "createdAt": "2025-01-15T00:00:00.000Z"
      }
    ]
  }
}
```

**Status proposal:**

| Status | Artinya |
|--------|---------|
| `open` | Masih menunggu vote semua anggota |
| `failed` | Ada anggota yang vote tidak setuju |
| `passed` | Semua vote setuju & total pledge ≥ 800rb → menunggu admin |
| `approved` | Admin menyetujui koneksi |
| `rejected` | Admin menolak koneksi |

---

### `POST /api/group/proposal/:id/vote`
> Anggota grup vote setuju/tidak pada proposal

**Role:** `ota` (harus anggota grup)

**Form fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `approve` | `"true"` \| `"false"` | Setuju atau tidak (dikirim sebagai string) |
| `pledgeAmount` | number | Nominal kontribusi bulanan (IDR). Wajib > 0 jika `approve = "true"` |

> **Catatan:** Jika ada anggota vote `"false"`, proposal langsung `failed`.  
> Jika semua setuju tapi total pledge < 800rb, proposal tetap `open` (anggota bisa update vote).  
> Jika semua setuju dan total pledge ≥ 800rb → proposal `passed`, `GroupConnection` pending dibuat, mahasiswaStatus = `active`.

**Response 200:** `{ "success": true, "message": "..." }` (pesan menjelaskan hasilnya)

---

## Koneksi Grup ↔ Mahasiswa

### `GET /api/group/connect/list/pending`
> Daftar GroupConnection yang menunggu persetujuan admin

**Role:** admin

**Query params:** `q` (cari nama mahasiswa/NIM/grup), `page`

**Response 200:**
```json
{
  "success": true,
  "message": "...",
  "body": {
    "data": [
      {
        "id": "uuid",
        "mahasiswaId": "uuid",
        "mahasiswaName": "Andi",
        "mahasiswaNim": "13521001",
        "groupId": "uuid",
        "groupName": "Grup Alumni",
        "connectionStatus": "pending",
        "paidFor": 0,
        "requestTerminateGroup": false,
        "requestTerminateMahasiswa": false,
        "createdAt": "2025-01-15T00:00:00.000Z"
      }
    ],
    "totalData": 5
  }
}
```

---

### `GET /api/group/connect/list/all`
> Daftar semua GroupConnection (semua status)

**Role:** admin  
**Query params:** sama seperti `/connect/list/pending`  
**Response:** sama dengan di atas

---

### `POST /api/group/connect/verify-accept`
> Admin menyetujui koneksi grup–mahasiswa dari proposal yang lolos voting

**Role:** admin

**Form fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `groupConnectionId` | UUID | ID GroupConnection yang disetujui |

> Otomatis membuat `GroupMemberContribution` per anggota (dari vote pledge) dan `GroupTransaction` pertama.

**Response 200:** `{ "success": true, "message": "Group connection berhasil disetujui" }`

---

### `POST /api/group/connect/verify-reject`
> Admin menolak koneksi — mahasiswa kembali ke `inactive`

**Role:** admin

**Form fields:** sama dengan `verify-accept`

**Response 200:** `{ "success": true, "message": "Group connection berhasil ditolak" }`

---

### `POST /api/group/connect/by-admin`
> Admin langsung menghubungkan grup dengan mahasiswa (bypass proposal & voting)

**Role:** admin  
**Syarat:** grup harus `active`; mahasiswa harus `inactive + accepted`; total `funds` semua anggota ≥ 800rb

**Form fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `groupId` | UUID | ID grup |
| `mahasiswaId` | UUID | ID mahasiswa |

**Response 200:** `{ "success": true, "message": "Grup berhasil dihubungkan dengan mahasiswa" }`

---

## Transaksi Grup

> Setiap bulan, sistem otomatis membuat **GroupTransaction** (tagihan total grup) dan **GroupMemberTransaction** (tagihan per anggota) untuk setiap koneksi aktif.

**Alur pembayaran per bulan:**

```
[OTA upload receipt]
  → GroupMemberTransaction.paymentStatus = "pending"
  → jika semua anggota upload → GroupTransaction.transactionStatus = "pending"

[Admin verify accept per anggota]
  → GroupMemberTransaction.paymentStatus = "paid"
  → jika semua anggota paid → GroupTransaction.transactionStatus = "paid"

[Admin accept transfer]
  → GroupTransaction.transferStatus = "paid"
```

---

### `GET /api/group/transaction/list/ota`
> OTA melihat daftar tagihan bulanan grup miliknya (per GroupMemberTransaction)

**Role:** `ota`

**Query params:**

| Param | Tipe | Keterangan |
|-------|------|------------|
| `year` | number (opsional) | Filter tahun |
| `month` | number 1–12 (opsional) | Filter bulan |
| `page` | number (opsional) | Pagination |

**Response 200:**
```json
{
  "success": true,
  "message": "Daftar transaksi grup berhasil diambil",
  "body": {
    "data": [
      {
        "id": "uuid",
        "groupTransactionId": "uuid",
        "groupId": "uuid",
        "groupName": "Grup Alumni",
        "mahasiswaId": "uuid",
        "mahasiswaName": "Andi",
        "mahasiswaNim": "13521001",
        "expectedAmount": 400000,
        "amountPaid": 0,
        "paymentStatus": "unpaid | pending | paid",
        "transactionReceipt": "https://... | null",
        "rejectionNote": "... | null",
        "dueDate": "2025-02-15T00:00:00.000Z",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "years": [2025, 2024],
    "totalData": 12
  }
}
```

---

### `GET /api/group/transaction/list/admin`
> Admin melihat semua GroupTransaction beserta detail pembayaran per anggota

**Role:** admin

**Query params:**

| Param | Tipe | Keterangan |
|-------|------|------------|
| `q` | string (opsional) | Cari nama mahasiswa, NIM, atau nama grup |
| `status` | `"unpaid"` \| `"pending"` \| `"paid"` (opsional) | Filter status |
| `year` | number (opsional) | Filter tahun |
| `month` | number 1–12 (opsional) | Filter bulan |
| `page` | number (opsional) | Pagination |

**Response 200:**
```json
{
  "success": true,
  "message": "Daftar transaksi grup berhasil diambil",
  "body": {
    "data": [
      {
        "id": "uuid",
        "groupId": "uuid",
        "groupName": "Grup Alumni",
        "mahasiswaId": "uuid",
        "mahasiswaName": "Andi",
        "mahasiswaNim": "13521001",
        "bill": 800000,
        "transactionStatus": "unpaid | pending | paid",
        "transferStatus": "unpaid | paid",
        "dueDate": "2025-02-15T00:00:00.000Z",
        "memberPayments": [
          {
            "id": "uuid",
            "otaId": "uuid",
            "otaName": "Budi",
            "expectedAmount": 400000,
            "amountPaid": 400000,
            "paymentStatus": "unpaid | pending | paid",
            "transactionReceipt": "https://... | null",
            "rejectionNote": "... | null",
            "paidAt": "2025-02-10T00:00:00.000Z | null"
          }
        ],
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "totalData": 5
  }
}
```

---

### `POST /api/group/transaction/upload-receipt`
> OTA mengunggah bukti pembayaran untuk tagihan bulannya

**Role:** `ota`  
**Syarat:** `GroupMemberTransaction.paymentStatus` harus `"unpaid"`

**Form fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `groupMemberTransactionId` | UUID | ID tagihan anggota yang dibayar |
| `receipt` | File (gambar) | Bukti transfer |

> Setelah upload, jika **semua anggota** sudah upload (paymentStatus ≠ `unpaid`), `GroupTransaction.transactionStatus` otomatis berubah ke `"pending"`.

**Response 200:** `{ "success": true, "message": "Bukti pembayaran berhasil diunggah" }`

---

### `POST /api/group/transaction/verify`
> Admin menerima atau menolak bukti pembayaran satu anggota

**Role:** admin  
**Syarat:** `GroupMemberTransaction.paymentStatus` harus `"pending"`

**Form fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `groupMemberTransactionId` | UUID | ID tagihan anggota yang diverifikasi |
| `action` | `"accept"` \| `"reject"` | Terima atau tolak |
| `rejectionNote` | string (opsional) | Catatan jika ditolak |

> Jika **accept** dan **semua anggota** sudah paid → `GroupTransaction.transactionStatus = "paid"`.  
> Jika **reject** → paymentStatus kembali ke `unpaid`, `GroupTransaction.transactionStatus` kembali ke `unpaid` jika tadi `pending`.

**Response 200:** `{ "success": true, "message": "..." }`

---

### `POST /api/group/transaction/accept-transfer-status`
> Admin mengkonfirmasi bahwa IOM sudah mentransfer dana ke mahasiswa

**Role:** admin  
**Syarat:** `GroupTransaction.transactionStatus` harus `"paid"`

**Form fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `groupTransactionId` | UUID | ID GroupTransaction yang sudah ditransfer |

**Response 200:** `{ "success": true, "message": "Transfer status grup berhasil dikonfirmasi" }`

---

## Terminasi Hubungan Asuh

> Terminasi adalah penghentian hubungan asuh antara grup dan mahasiswa. Grup (anggota) mengajukan → admin menyetujui/menolak.

---

### `POST /api/group/terminate/request`
> Anggota grup mengajukan permintaan terminasi

**Role:** `ota` (harus anggota grup) atau admin

**Form fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `groupConnectionId` | UUID | ID koneksi yang ingin diterminasi |
| `requestTerminationNote` | string (opsional) | Alasan terminasi |

**Response 200:** `{ "success": true, "message": "Permintaan terminasi berhasil diajukan" }`

---

### `GET /api/group/terminate/list`
> Admin melihat daftar koneksi dengan request terminasi aktif

**Role:** admin

**Query params:** `q` (cari nama/NIM/grup), `page`

**Response 200:**
```json
{
  "success": true,
  "message": "Daftar request terminasi berhasil diambil",
  "body": {
    "data": [
      {
        "groupConnectionId": "uuid",
        "groupId": "uuid",
        "groupName": "Grup Alumni",
        "mahasiswaId": "uuid",
        "mahasiswaName": "Andi",
        "mahasiswaNim": "13521001",
        "requestTerminateGroup": true,
        "requestTerminationNoteGroup": "Anggota tidak mampu melanjutkan",
        "requestTerminateMahasiswa": false,
        "requestTerminationNoteMa": null,
        "createdAt": "2025-01-15T00:00:00.000Z"
      }
    ],
    "totalData": 2
  }
}
```

---

### `POST /api/group/terminate/validate`
> Admin menyetujui terminasi

**Role:** admin

**Form fields:**

| Field | Tipe | Keterangan |
|-------|------|------------|
| `groupConnectionId` | UUID | ID koneksi yang diterminasi |

> Efek: mahasiswaStatus kembali ke `inactive`, transaksi terbuka ditutup, koneksi dihapus.

**Response 200:** `{ "success": true, "message": "Terminasi hubungan asuh grup berhasil disetujui" }`

---

### `POST /api/group/terminate/reject`
> Admin menolak request terminasi — koneksi kembali normal

**Role:** admin

**Form fields:** sama dengan `validate`

**Response 200:** `{ "success": true, "message": "Request terminasi berhasil ditolak" }`

---

## Status & Enum Reference

### Group Status (`OtaGroupStatus`)
| Value | Artinya |
|-------|---------|
| `forming` | Grup baru dibuat, belum aktif |
| `active` | Grup aktif, bisa mengajukan proposal mahasiswa |

### Invitation Status
| Value | Artinya |
|-------|---------|
| `pending` | Belum direspons |
| `accepted` | Diterima |
| `rejected` | Ditolak |
| `cancelled` | Dibatalkan |

### Proposal Status
| Value | Artinya |
|-------|---------|
| `open` | Voting sedang berjalan |
| `failed` | Ada yang vote tidak setuju |
| `passed` | Semua setuju + total pledge ≥ 800rb → menunggu admin |
| `approved` | Admin setujui koneksi |
| `rejected` | Admin tolak koneksi |

### Connection Status
| Value | Artinya |
|-------|---------|
| `pending` | Menunggu persetujuan admin |
| `accepted` | Koneksi aktif |
| `rejected` | Ditolak admin |

### Transaction Status (payment per anggota)
| Value | Artinya |
|-------|---------|
| `unpaid` | Belum upload bukti |
| `pending` | Bukti sudah diupload, menunggu verifikasi admin |
| `paid` | Admin sudah verifikasi pembayaran |

### Transfer Status (IOM → mahasiswa)
| Value | Artinya |
|-------|---------|
| `unpaid` | Dana belum ditransfer ke mahasiswa |
| `paid` | Dana sudah ditransfer ke mahasiswa |

---

## Error Response Format

Semua error mengikuti format:

```json
{
  "success": false,
  "message": "Pesan error",
  "error": { "code": "ERROR_CODE" }
}
```

| HTTP Status | Artinya |
|-------------|---------|
| 400 | Bad request / validasi gagal |
| 401 | Token tidak valid atau tidak ada |
| 403 | Tidak punya akses (role salah / bukan anggota) |
| 404 | Data tidak ditemukan |
| 500 | Internal server error |

---

*Dokumen ini mencakup semua endpoint grup yang sudah diimplementasi di backend. Gunakan `/swagger` atau `/doc` di backend untuk OpenAPI spec interaktif.*
