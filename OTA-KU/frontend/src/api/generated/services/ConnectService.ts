/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConnectionListAllResponse } from '../models/ConnectionListAllResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ConnectService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Menghubungkan orang tua asuh dengan mahasiswa asuh via pilihan mandiri OTA
   * @returns any Berhasil menghubungkan orang tua asuh dengan mahasiswa asuh via pilihan mandiri OTA
   * @throws ApiError
   */
  public connectOtaMahasiswa({
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
      url: '/api/connect/by-ota',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Gagal menghubungkan orang tua asuh dengan mahasiswa asuh via pilihan mandiri OTA`,
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Menghubungkan orang tua asuh dengan mahasiswa asuh via Admin
   * @returns any Berhasil menghubungkan orang tua asuh dengan mahasiswa asuh via Admin
   * @throws ApiError
   */
  public connectOtaMahasiswaByAdmin({
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
      url: '/api/connect/by-admin',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Gagal menghubungkan orang tua asuh dengan mahasiswa asuh via Admin`,
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Melakukan penerimaan verifikasi connection oleh admin
   * @returns any Berhasil melakukan penerimaan verifikasi connection oleh admin
   * @throws ApiError
   */
  public verifyConnectionAccept({
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
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/connect/verify-connect-acc',
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
   * Melakukan penolakan verifikasi connection oleh admin
   * @returns any Berhasil melakukan penolakan verifikasi connection oleh admin
   * @throws ApiError
   */
  public verifyConnectionReject({
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
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/connect/verify-connect-reject',
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
   * List seluruh connection yang pending beserta detailnya
   * @returns any Daftar connection pending berhasil diambil
   * @throws ApiError
   */
  public listPendingConnection({
    q,
    page,
  }: {
    q?: string,
    page?: number | null,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      data: Array<{
        /**
         * ID mahasiswa asuh
         */
        mahasiswa_id: string;
        name_ma: string;
        nim_ma: string;
        /**
         * ID orang tua asuh
         */
        ota_id: string;
        name_ota: string;
        number_ota: string;
      }>;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/connect/list/pending',
      query: {
        'q': q,
        'page': page,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * List seluruh connection yang pending terminasi beserta detailnya
   * @returns any Daftar connection pending berhasil diambil
   * @throws ApiError
   */
  public listPendingTerminationConnection({
    q,
    page,
  }: {
    q?: string,
    page?: number | null,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      data: Array<{
        /**
         * ID mahasiswa asuh
         */
        mahasiswa_id: string;
        name_ma: string;
        nim_ma: string;
        /**
         * ID orang tua asuh
         */
        ota_id: string;
        name_ota: string;
        number_ota: string;
        request_term_ota: boolean;
        request_term_ma: boolean;
      }>;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/connect/list/pending-terminate',
      query: {
        'q': q,
        'page': page,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * List seluruh connection yang ada beserta detailnya
   * @returns any Daftar semua connection berhasil diambil
   * @throws ApiError
   */
  public listAllConnection({
    q,
    page,
    connectionStatus,
  }: {
    q?: string,
    page?: number | null,
    connectionStatus?: 'accepted' | 'pending' | 'rejected',
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      data: Array<ConnectionListAllResponse>;
      totalPagination: number;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/connect/list/all',
      query: {
        'q': q,
        'page': page,
        'connection_status': connectionStatus,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Memeriksa apakah OTA dan MA tertentu sudah memiliki hubungan asuh
   * @returns any Ditemukan hubungan asuh antara MA dan OTA
   * @throws ApiError
   */
  public isConnected({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    isConnected: boolean;
    message: string;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/connect/is-connected/{id}',
      path: {
        'id': id,
      },
      errors: {
        400: `Gagal menemukan hubungan asuh antara MA dan OTA`,
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Delete an account
   * @returns any Successfully deleted a connection
   * @throws ApiError
   */
  public deleteConnection({
    otaId,
    mahasiswaId,
  }: {
    otaId: string,
    mahasiswaId: string,
  }): CancelablePromise<{
    success: boolean;
    message: string;
  }> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/connect/delete',
      query: {
        'otaId': otaId,
        'mahasiswaId': mahasiswaId,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
}
