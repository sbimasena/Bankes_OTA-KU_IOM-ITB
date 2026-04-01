/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ProfileService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Pendaftaran mahasiswa asuh.
   * @returns any Berhasil mendaftar.
   * @throws ApiError
   */
  public pendaftaranMahasiswa({
    formData,
  }: {
    formData?: {
      /**
       * Nama mahasiswa
       */
      name: string;
      /**
       * Nomor telepon pengguna yang dimulai dengan 62.
       */
      phoneNumber: string;
      /**
       * Nomor Induk Mahasiswa
       */
      nim: string;
      /**
       * Jurusan mahasiswa
       */
      major: 'Matematika' | 'Fisika' | 'Astronomi' | 'Mikrobiologi' | 'Kimia' | 'Biologi' | 'Sains dan Teknologi Farmasi' | 'Aktuaria' | 'Rekayasa Hayati' | 'Rekayasa Pertanian' | 'Rekayasa Kehutanan' | 'Farmasi Klinik dan Komunitas' | 'Teknologi Pasca Panen' | 'Teknik Geologi' | 'Teknik Pertambangan' | 'Teknik Perminyakan' | 'Teknik Geofisika' | 'Teknik Metalurgi' | 'Meteorologi' | 'Oseanografi' | 'Teknik Kimia' | 'Teknik Mesin' | 'Teknik Elektro' | 'Teknik Fisika' | 'Teknik Industri' | 'Teknik Informatika' | 'Aeronotika dan Astronotika' | 'Teknik Material' | 'Teknik Pangan' | 'Manajemen Rekayasa Industri' | 'Teknik Bioenergi dan Kemurgi' | 'Teknik Sipil' | 'Teknik Geodesi dan Geomatika' | 'Arsitektur' | 'Teknik Lingkungan' | 'Perencanaan Wilayah dan Kota' | 'Teknik Kelautan' | 'Rekayasa Infrastruktur Lingkungan' | 'Teknik dan Pengelolaan Sumber Daya Air' | 'Seni Rupa' | 'Desain' | 'Kriya' | 'Desain Interior' | 'Desain Komunikasi Visual' | 'Desain Produk' | 'Teknik Tenaga Listrik' | 'Teknik Telekomunikasi' | 'Sistem Teknologi dan Informasi' | 'Teknik Biomedis' | 'Manajemen' | 'Kewirausahaan' | 'TPB';
      /**
       * Fakultas mahasiswa
       */
      faculty: 'FMIPA' | 'SITH-S' | 'SF' | 'FITB' | 'FTTM' | 'STEI-R' | 'FTSL' | 'FTI' | 'FSRD' | 'FTMD' | 'STEI-K' | 'SBM' | 'SITH-R' | 'SAPPK';
      /**
       * Kota asal mahasiswa
       */
      cityOfOrigin: string;
      /**
       * Asal SMA
       */
      highschoolAlumni: string;
      religion: 'Islam' | 'Kristen Protestan' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
      gender: 'M' | 'F';
      /**
       * IPK mahasiswa
       */
      gpa: number | null;
      /**
       * Deskripsi mahasiswa
       */
      description: string;
      /**
       * File Essay Mahasiswa
       */
      file: any;
      /**
       * Kartu Keluarga
       */
      kk: any;
      /**
       * Kartu Tanda Mahasiswa
       */
      ktm: any;
      /**
       * Surat Rekomendasi Wali
       */
      waliRecommendationLetter: any;
      /**
       * Transkrip Nilai
       */
      transcript: any;
      /**
       * Slip Gaji Orang Tua
       */
      salaryReport: any;
      /**
       * Bukti Pembayaran PBB
       */
      pbb: any;
      /**
       * Tagihan Listrik
       */
      electricityBill: any;
      /**
       * Surat Rekomendasi Ditmawa
       */
      ditmawaRecommendationLetter?: any;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * Nama mahasiswa
       */
      name: string;
      /**
       * Nomor Induk Mahasiswa
       */
      nim: string;
      /**
       * Jurusan mahasiswa
       */
      major: 'Matematika' | 'Fisika' | 'Astronomi' | 'Mikrobiologi' | 'Kimia' | 'Biologi' | 'Sains dan Teknologi Farmasi' | 'Aktuaria' | 'Rekayasa Hayati' | 'Rekayasa Pertanian' | 'Rekayasa Kehutanan' | 'Farmasi Klinik dan Komunitas' | 'Teknologi Pasca Panen' | 'Teknik Geologi' | 'Teknik Pertambangan' | 'Teknik Perminyakan' | 'Teknik Geofisika' | 'Teknik Metalurgi' | 'Meteorologi' | 'Oseanografi' | 'Teknik Kimia' | 'Teknik Mesin' | 'Teknik Elektro' | 'Teknik Fisika' | 'Teknik Industri' | 'Teknik Informatika' | 'Aeronotika dan Astronotika' | 'Teknik Material' | 'Teknik Pangan' | 'Manajemen Rekayasa Industri' | 'Teknik Bioenergi dan Kemurgi' | 'Teknik Sipil' | 'Teknik Geodesi dan Geomatika' | 'Arsitektur' | 'Teknik Lingkungan' | 'Perencanaan Wilayah dan Kota' | 'Teknik Kelautan' | 'Rekayasa Infrastruktur Lingkungan' | 'Teknik dan Pengelolaan Sumber Daya Air' | 'Seni Rupa' | 'Desain' | 'Kriya' | 'Desain Interior' | 'Desain Komunikasi Visual' | 'Desain Produk' | 'Teknik Tenaga Listrik' | 'Teknik Telekomunikasi' | 'Sistem Teknologi dan Informasi' | 'Teknik Biomedis' | 'Manajemen' | 'Kewirausahaan' | 'TPB';
      /**
       * Fakultas mahasiswa
       */
      faculty: 'FMIPA' | 'SITH-S' | 'SF' | 'FITB' | 'FTTM' | 'STEI-R' | 'FTSL' | 'FTI' | 'FSRD' | 'FTMD' | 'STEI-K' | 'SBM' | 'SITH-R' | 'SAPPK';
      /**
       * Kota asal mahasiswa
       */
      cityOfOrigin: string;
      /**
       * Asal SMA
       */
      highschoolAlumni: string;
      religion: 'Islam' | 'Kristen Protestan' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
      gender: 'M' | 'F';
      /**
       * IPK mahasiswa
       */
      gpa: number | null;
      /**
       * Deskripsi mahasiswa
       */
      description: string;
      /**
       * File Essay Mahasiswa
       */
      file: string;
      /**
       * Kartu Keluarga
       */
      kk: string;
      /**
       * Kartu Tanda Mahasiswa
       */
      ktm: string;
      /**
       * Surat Rekomendasi Wali
       */
      waliRecommendationLetter: string;
      /**
       * Transkrip Nilai
       */
      transcript: string;
      /**
       * Slip Gaji Orang Tua
       */
      salaryReport: string;
      /**
       * Bukti Pembayaran PBB
       */
      pbb: string;
      /**
       * Tagihan Listrik
       */
      electricityBill: string;
      /**
       * Surat Rekomendasi Ditmawa
       */
      ditmawaRecommendationLetter: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/profile/mahasiswa',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Gagal mendaftar.`,
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun belum terverifikasi.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Pendaftaran orang tua.
   * @returns any Berhasil mendaftar.
   * @throws ApiError
   */
  public pendaftaranOrangTua({
    formData,
  }: {
    formData?: {
      /**
       * Nama orang tua
       */
      name: string;
      /**
       * Pekerjaan orang tua
       */
      job: string;
      /**
       * Alamat orang tua
       */
      address: string;
      /**
       * Hubungan dengan mahasiswa
       */
      linkage: 'otm' | 'dosen' | 'alumni' | 'lainnya' | 'none';
      /**
       * Dana yang disediakan
       */
      funds: number;
      /**
       * Kapasitas maksimal
       */
      maxCapacity: number | null;
      /**
       * Tanggal mulai
       */
      startDate: string;
      /**
       * Semester maksimal
       */
      maxSemester: number | null;
      /**
       * Tanggal transfer
       */
      transferDate: number | null;
      criteria?: string;
      isDetailVisible?: 'true' | 'false';
      allowAdminSelection?: 'true' | 'false';
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * Nama orang tua
       */
      name: string;
      /**
       * Pekerjaan orang tua
       */
      job: string;
      /**
       * Alamat orang tua
       */
      address: string;
      /**
       * Hubungan dengan mahasiswa
       */
      linkage: 'otm' | 'dosen' | 'alumni' | 'lainnya' | 'none';
      /**
       * Dana yang disediakan
       */
      funds: number;
      /**
       * Kapasitas maksimal
       */
      maxCapacity: number | null;
      /**
       * Tanggal mulai
       */
      startDate: string;
      /**
       * Semester maksimal
       */
      maxSemester: number | null;
      /**
       * Tanggal transfer
       */
      transferDate: number | null;
      criteria?: string;
      isDetailVisible?: 'true' | 'false';
      allowAdminSelection?: 'true' | 'false';
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/profile/orang-tua',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Gagal mendaftar.`,
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun belum terverifikasi.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Pembuatan akun bankes dan pengurus oleh admin
   * @returns any Berhasil mendaftar.
   * @throws ApiError
   */
  public pembuatanAkunBankesPengurus({
    formData,
  }: {
    formData?: {
      /**
       * Nama dari bankes atau pengurus
       */
      name: string;
      /**
       * The user's email.
       */
      email: string;
      /**
       * Password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.
       * Simbol yang diperbolehkan: ! @ # $ % ^ & * ( ) _ - + = [ ] { } ; ' : " \ | , . < > / ?
       */
      password: string;
      /**
       * Jenis akun
       */
      type: 'bankes' | 'pengurus';
      /**
       * Nomor telepon pengguna yang dimulai dengan 62.
       */
      phoneNumber: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * ID akun
       */
      id: string;
      /**
       * Nama dari bankes atau pengurus
       */
      name: string;
      /**
       * The user's email.
       */
      email: string;
      /**
       * Jenis akun
       */
      type: 'mahasiswa' | 'ota' | 'admin' | 'bankes' | 'pengurus';
      /**
       * Nomor telepon pengguna yang dimulai dengan 62.
       */
      phoneNumber: string;
      provider: 'credentials' | 'azure';
      status: 'verified' | 'unverified';
      application_status: 'accepted' | 'rejected' | 'pending' | 'unregistered' | 'reapply' | 'outdated';
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/profile/bankes-pengurus',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Edit profile OTA
   * @returns any Berhasil edit profile OTA.
   * @throws ApiError
   */
  public editProfileOta({
    id,
    formData,
  }: {
    id: string,
    formData?: {
      /**
       * Nama orang tua
       */
      name: string;
      /**
       * Pekerjaan orang tua
       */
      job: string;
      /**
       * Alamat orang tua
       */
      address: string;
      /**
       * Hubungan dengan mahasiswa
       */
      linkage: 'otm' | 'dosen' | 'alumni' | 'lainnya' | 'none';
      /**
       * Dana yang disediakan
       */
      funds: number;
      /**
       * Kapasitas maksimal
       */
      maxCapacity: number | null;
      /**
       * Tanggal mulai
       */
      startDate: string;
      /**
       * Semester maksimal
       */
      maxSemester: number | null;
      /**
       * Tanggal transfer
       */
      transferDate: number | null;
      criteria?: string;
      isDetailVisible?: 'true' | 'false';
      allowAdminSelection?: 'true' | 'false';
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * Nama orang tua
       */
      name: string;
      /**
       * Pekerjaan orang tua
       */
      job: string;
      /**
       * Alamat orang tua
       */
      address: string;
      /**
       * Hubungan dengan mahasiswa
       */
      linkage: 'otm' | 'dosen' | 'alumni' | 'lainnya' | 'none';
      /**
       * Dana yang disediakan
       */
      funds: number;
      /**
       * Kapasitas maksimal
       */
      maxCapacity: number | null;
      /**
       * Tanggal mulai
       */
      startDate: string;
      /**
       * Semester maksimal
       */
      maxSemester: number | null;
      /**
       * Tanggal transfer
       */
      transferDate: number | null;
      criteria?: string;
      isDetailVisible?: 'true' | 'false';
      allowAdminSelection?: 'true' | 'false';
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/profile/orang-tua/{id}',
      path: {
        'id': id,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Gagal edit profile OTA.`,
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun belum terverifikasi.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Profile orang tua.
   * @returns any Success
   * @throws ApiError
   */
  public profileOrangTua({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      name: string;
      /**
       * The user's email.
       */
      email: string;
      /**
       * Nomor telepon pengguna yang dimulai dengan 62.
       */
      phone_number: string;
      join_date: string;
      job?: string;
      address?: string;
      linkage?: string;
      funds?: number;
      maxCapacity?: number;
      startDate?: string;
      maxSemester?: number;
      transferDate?: number;
      criteria?: string;
      isDetailVisible?: boolean;
      allowAdminSelection?: boolean;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/profile/orang-tua/{id}',
      path: {
        'id': id,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun belum terverifikasi.`,
        404: `Data tidak ditemukan.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Edit profile MA
   * @returns any Berhasil edit profile MA.
   * @throws ApiError
   */
  public editProfileMa({
    formData,
  }: {
    formData?: {
      /**
       * Nama mahasiswa
       */
      name: string;
      /**
       * Nomor telepon pengguna yang dimulai dengan 62.
       */
      phoneNumber: string;
      /**
       * Nomor Induk Mahasiswa
       */
      nim: string;
      /**
       * Jurusan mahasiswa
       */
      major: 'Matematika' | 'Fisika' | 'Astronomi' | 'Mikrobiologi' | 'Kimia' | 'Biologi' | 'Sains dan Teknologi Farmasi' | 'Aktuaria' | 'Rekayasa Hayati' | 'Rekayasa Pertanian' | 'Rekayasa Kehutanan' | 'Farmasi Klinik dan Komunitas' | 'Teknologi Pasca Panen' | 'Teknik Geologi' | 'Teknik Pertambangan' | 'Teknik Perminyakan' | 'Teknik Geofisika' | 'Teknik Metalurgi' | 'Meteorologi' | 'Oseanografi' | 'Teknik Kimia' | 'Teknik Mesin' | 'Teknik Elektro' | 'Teknik Fisika' | 'Teknik Industri' | 'Teknik Informatika' | 'Aeronotika dan Astronotika' | 'Teknik Material' | 'Teknik Pangan' | 'Manajemen Rekayasa Industri' | 'Teknik Bioenergi dan Kemurgi' | 'Teknik Sipil' | 'Teknik Geodesi dan Geomatika' | 'Arsitektur' | 'Teknik Lingkungan' | 'Perencanaan Wilayah dan Kota' | 'Teknik Kelautan' | 'Rekayasa Infrastruktur Lingkungan' | 'Teknik dan Pengelolaan Sumber Daya Air' | 'Seni Rupa' | 'Desain' | 'Kriya' | 'Desain Interior' | 'Desain Komunikasi Visual' | 'Desain Produk' | 'Teknik Tenaga Listrik' | 'Teknik Telekomunikasi' | 'Sistem Teknologi dan Informasi' | 'Teknik Biomedis' | 'Manajemen' | 'Kewirausahaan' | 'TPB';
      /**
       * Fakultas mahasiswa
       */
      faculty: 'FMIPA' | 'SITH-S' | 'SF' | 'FITB' | 'FTTM' | 'STEI-R' | 'FTSL' | 'FTI' | 'FSRD' | 'FTMD' | 'STEI-K' | 'SBM' | 'SITH-R' | 'SAPPK';
      /**
       * Kota asal mahasiswa
       */
      cityOfOrigin: string;
      /**
       * Asal SMA
       */
      highschoolAlumni: string;
      religion: 'Islam' | 'Kristen Protestan' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
      gender: 'M' | 'F';
      /**
       * IPK mahasiswa
       */
      gpa: number | null;
      /**
       * Deskripsi mahasiswa
       */
      description: string;
      /**
       * File Essay Mahasiswa
       */
      file?: string;
      /**
       * Kartu Keluarga
       */
      kk?: string;
      /**
       * Kartu Tanda Mahasiswa
       */
      ktm?: string;
      /**
       * Surat Rekomendasi Wali
       */
      waliRecommendationLetter?: string;
      /**
       * Transkrip Nilai
       */
      transcript?: string;
      /**
       * Slip Gaji Orang Tua
       */
      salaryReport?: string;
      /**
       * Bukti Pembayaran PBB
       */
      pbb?: string;
      /**
       * Tagihan Listrik
       */
      electricityBill?: string;
      /**
       * Surat Rekomendasi Ditmawa
       */
      ditmawaRecommendationLetter?: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * Nama mahasiswa
       */
      name: string;
      /**
       * Nomor Induk Mahasiswa
       */
      nim: string;
      /**
       * Jurusan mahasiswa
       */
      major: 'Matematika' | 'Fisika' | 'Astronomi' | 'Mikrobiologi' | 'Kimia' | 'Biologi' | 'Sains dan Teknologi Farmasi' | 'Aktuaria' | 'Rekayasa Hayati' | 'Rekayasa Pertanian' | 'Rekayasa Kehutanan' | 'Farmasi Klinik dan Komunitas' | 'Teknologi Pasca Panen' | 'Teknik Geologi' | 'Teknik Pertambangan' | 'Teknik Perminyakan' | 'Teknik Geofisika' | 'Teknik Metalurgi' | 'Meteorologi' | 'Oseanografi' | 'Teknik Kimia' | 'Teknik Mesin' | 'Teknik Elektro' | 'Teknik Fisika' | 'Teknik Industri' | 'Teknik Informatika' | 'Aeronotika dan Astronotika' | 'Teknik Material' | 'Teknik Pangan' | 'Manajemen Rekayasa Industri' | 'Teknik Bioenergi dan Kemurgi' | 'Teknik Sipil' | 'Teknik Geodesi dan Geomatika' | 'Arsitektur' | 'Teknik Lingkungan' | 'Perencanaan Wilayah dan Kota' | 'Teknik Kelautan' | 'Rekayasa Infrastruktur Lingkungan' | 'Teknik dan Pengelolaan Sumber Daya Air' | 'Seni Rupa' | 'Desain' | 'Kriya' | 'Desain Interior' | 'Desain Komunikasi Visual' | 'Desain Produk' | 'Teknik Tenaga Listrik' | 'Teknik Telekomunikasi' | 'Sistem Teknologi dan Informasi' | 'Teknik Biomedis' | 'Manajemen' | 'Kewirausahaan' | 'TPB';
      /**
       * Fakultas mahasiswa
       */
      faculty: 'FMIPA' | 'SITH-S' | 'SF' | 'FITB' | 'FTTM' | 'STEI-R' | 'FTSL' | 'FTI' | 'FSRD' | 'FTMD' | 'STEI-K' | 'SBM' | 'SITH-R' | 'SAPPK';
      /**
       * Kota asal mahasiswa
       */
      cityOfOrigin: string;
      /**
       * Asal SMA
       */
      highschoolAlumni: string;
      religion: 'Islam' | 'Kristen Protestan' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
      gender: 'M' | 'F';
      /**
       * IPK mahasiswa
       */
      gpa: number | null;
      /**
       * Deskripsi mahasiswa
       */
      description: string;
      /**
       * File Essay Mahasiswa
       */
      file: string;
      /**
       * Kartu Keluarga
       */
      kk: string;
      /**
       * Kartu Tanda Mahasiswa
       */
      ktm: string;
      /**
       * Surat Rekomendasi Wali
       */
      waliRecommendationLetter: string;
      /**
       * Transkrip Nilai
       */
      transcript: string;
      /**
       * Slip Gaji Orang Tua
       */
      salaryReport: string;
      /**
       * Bukti Pembayaran PBB
       */
      pbb: string;
      /**
       * Tagihan Listrik
       */
      electricityBill: string;
      /**
       * Surat Rekomendasi Ditmawa
       */
      ditmawaRecommendationLetter: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/profile/mahasiswa/{id}',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Gagal edit profile MA.`,
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun belum terverifikasi.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Profile mahasiswa.
   * @returns any Success
   * @throws ApiError
   */
  public profileMahasiswa({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      name: string;
      /**
       * The user's email.
       */
      email: string;
      /**
       * Nomor telepon pengguna yang dimulai dengan 62.
       */
      phone_number: string;
      nim?: string;
      major?: string;
      faculty?: string;
      cityOfOrigin?: string;
      highschoolAlumni?: string;
      religion: 'Islam' | 'Kristen Protestan' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
      gender: 'M' | 'F';
      gpa: number;
      description?: string;
      file?: string;
      kk?: string;
      ktm?: string;
      waliRecommendationLetter?: string;
      transcript?: string;
      salaryReport?: string;
      pbb?: string;
      electricityBill?: string;
      ditmawaRecommendationLetter?: string;
      createdAt?: string;
      updatedAt?: string;
      dueNextUpdateAt?: string;
      /**
       * Status aplikasi mahasiswa
       */
      applicationStatus: 'accepted' | 'rejected' | 'pending' | 'unregistered' | 'reapply' | 'outdated';
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/profile/mahasiswa/{id}',
      path: {
        'id': id,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun belum terverifikasi.`,
        404: `Data tidak ditemukan.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Delete an account
   * @returns any Successfully deleted an account
   * @throws ApiError
   */
  public deleteAccount({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * Unique account ID
       */
      id: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/profile/delete/{id}',
      path: {
        'id': id,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        500: `Internal server error`,
      },
    });
  }
}
