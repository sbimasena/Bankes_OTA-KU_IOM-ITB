/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ListTerminateForAdmin } from '../models/ListTerminateForAdmin';
import type { ListTerminateForOTA } from '../models/ListTerminateForOTA';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TerminateService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Mendapatkan daftar request terminate untuk Admin
   * @returns any Berhasil mendapatkan daftar request terminate untuk Admin
   * @throws ApiError
   */
  public listTerminateForAdmin({
    q,
    page,
  }: {
    q?: string,
    page?: number | null,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      data: Array<ListTerminateForAdmin>;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/terminate/admin/daftar-terminate',
      query: {
        'q': q,
        'page': page,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun Admin belum terverifikasi.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Mendapatkan daftar terminate untuk OTA
   * @returns any Berhasil mendapatkan daftar terminate untuk OTA
   * @throws ApiError
   */
  public listTerminateForOta({
    q,
    page,
  }: {
    q?: string,
    page?: number | null,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      data: Array<ListTerminateForOTA>;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/terminate/ota/daftar-terminate',
      query: {
        'q': q,
        'page': page,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun anda belum terverifikasi.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Mendapatkan status terminasi untuk MA
   * @returns any Status terminasi untuk MA berhasil diambil
   * @throws ApiError
   */
  public terminationStatusMa(): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * ID orang tua asuh
       */
      otaId: string;
      otaName: string;
      connectionStatus: string;
      requestTerminationNoteOTA: string;
      requestTerminationNoteMA: string;
      requestTerminateOTA: boolean;
      requestTerminateMA: boolean;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/terminate/ma/status-terminate',
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun anda belum terverifikasi.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Mengirimkan request terminate hubungan asuh dari akun MA
   * @returns any Berhasil mengirimkan request terminate hubungan asuh dari akun MA
   * @throws ApiError
   */
  public requestTerminateFromMa({
    formData,
  }: {
    formData?: {
      /**
       * ID orang tua asuh
       */
      otaId: string;
      /**
       * ID mahasiswa asuh
       */
      mahasiswaId: string;
      /**
       * Catatan request terminasi
       */
      requestTerminationNote: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * ID mahasiswa asuh
       */
      mahasiswaId: string;
      /**
       * ID orang tua asuh
       */
      otaId: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/terminate/ma',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Gagal mengirimkan request terminate hubungan asuh dari akun MA`,
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun MA belum terverifikasi.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Mengirimkan request terminate hubungan asuh dari akun OTA
   * @returns any Berhasil mengirimkan request terminate hubungan asuh dari akun OTA
   * @throws ApiError
   */
  public requestTerminateFromOta({
    formData,
  }: {
    formData?: {
      /**
       * ID orang tua asuh
       */
      otaId: string;
      /**
       * ID mahasiswa asuh
       */
      mahasiswaId: string;
      /**
       * Catatan request terminasi
       */
      requestTerminationNote: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * ID mahasiswa asuh
       */
      mahasiswaId: string;
      /**
       * ID orang tua asuh
       */
      otaId: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/terminate/ota',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Gagal mengirimkan request terminate hubungan asuh dari akun OTA`,
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun OTA belum terverifikasi.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Melakukan validasi terminate hubungan asuh
   * @returns any Berhasil memvalidasi terminasi hubungan
   * @throws ApiError
   */
  public validateTerminate({
    formData,
  }: {
    formData?: {
      /**
       * ID orang tua asuh
       */
      otaId: string;
      /**
       * ID mahasiswa asuh
       */
      mahasiswaId: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * ID mahasiswa asuh
       */
      mahasiswaId: string;
      /**
       * ID orang tua asuh
       */
      otaId: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/terminate/validate',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Gagal memvalidasi terminasi hubungan`,
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun admin belum terverifikasi.`,
        404: `Connection not found.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Melakukan penolakan request terminasi hubungan asuh
   * @returns any Berhasil menolak request terminasi hubungan asuh
   * @throws ApiError
   */
  public rejectTerminate({
    formData,
  }: {
    formData?: {
      /**
       * ID orang tua asuh
       */
      otaId: string;
      /**
       * ID mahasiswa asuh
       */
      mahasiswaId: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * ID mahasiswa asuh
       */
      mahasiswaId: string;
      /**
       * ID orang tua asuh
       */
      otaId: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/terminate/reject',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Gagal menolak request terminasi hubungan asuh`,
        401: `Bad request: authorization (not logged in) error`,
        403: `Akun admin belum terverifikasi.`,
        500: `Internal server error`,
      },
    });
  }
}
