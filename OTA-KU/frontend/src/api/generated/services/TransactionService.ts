/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TransactionDetailSchema } from '../models/TransactionDetailSchema';
import type { TransactionListAdminSchema } from '../models/TransactionListAdminSchema';
import type { TransactionListVerificationAdminData } from '../models/TransactionListVerificationAdminData';
import type { TransactionOTA } from '../models/TransactionOTA';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class TransactionService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Daftar tagihan seluruh mahasiswa asuh saya
   * @returns any Berhasil mendapatkan daftar tagihan seluruh mahasiswa asuh saya.
   * @throws ApiError
   */
  public listTransactionOta({
    year,
    month,
  }: {
    year?: number | null,
    month?: number | null,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      data: Array<TransactionOTA>;
      /**
       * Tahun yang tersedia
       */
      years: Array<number>;
      /**
       * Total tagihan
       */
      totalBill: number;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/transaction/orang-tua/transactions',
      query: {
        'year': year,
        'month': month,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Daftar seluruh tagihan yang ada
   * @returns any Berhasil mendapatkan daftar tagihan.
   * @throws ApiError
   */
  public listTransactionAdmin({
    month,
    year,
    page,
    status,
  }: {
    month?: 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December',
    year?: number,
    page?: number | null,
    status?: 'unpaid' | 'pending' | 'paid',
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: TransactionListAdminSchema;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/transaction/admin/transactions',
      query: {
        'month': month,
        'year': year,
        'page': page,
        'status': status,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Daftar seluruh tagihan yang belum diverifikasi
   * @returns any Berhasil mendapatkan daftar tagihan yang belum diverifikasi.
   * @throws ApiError
   */
  public listTransactionVerificationAdmin({
    q,
    page,
    year,
    month,
  }: {
    q?: string,
    page?: number | null,
    year?: number | null,
    month?: number | null,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      data: Array<TransactionListVerificationAdminData>;
      /**
       * Tahun yang tersedia
       */
      years: Array<number>;
      totalData: number;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/transaction/admin/transactions/verification',
      query: {
        'q': q,
        'page': page,
        'year': year,
        'month': month,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Detail tagihan mahasiswa asuh saya
   * @returns any Berhasil mendapatkan detail tagihan mahasiswa asuh.
   * @throws ApiError
   */
  public detailTransaction({
    id,
    page,
  }: {
    id: string,
    page?: number | null,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: TransactionDetailSchema;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/transaction/transaction-detail/{id}',
      path: {
        'id': id,
        'page': page,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        404: `Mahasiswa tidak ditemukan`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Upload bukti pembayaran dari OTA
   * @returns any Berhasil melakukan upload bukti pembayaran dari OTA.
   * @throws ApiError
   */
  public uploadReceipt({
    formData,
  }: {
    formData?: {
      /**
       * ID transaksi
       */
      ids: string;
      receipt: Blob;
      /**
       * Pembayaran untuk berapa bulan
       */
      paidFor: number | null;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      bukti_bayar: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/transaction/upload-receipt',
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
   * Melakukan penerimaan verifikasi pembayaran oleh admin
   * @returns any Berhasil melakukan penerimaan verifikasi pembayaran
   * @throws ApiError
   */
  public verifyTransactionAcc({
    formData,
  }: {
    formData?: {
      /**
       * ID transaksi
       */
      ids: string;
      /**
       * ID orang tua asuh
       */
      otaId: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * ID transaksi
       */
      ids: string;
      /**
       * ID orang tua asuh
       */
      otaId: string;
      /**
       * Nominal yang telah dibayarkan
       */
      amountPaid: number;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/transaction/verify-acc',
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
   * Melakukan penolakan verifikasi pembayaran oleh admin
   * @returns any Berhasil melakukan penolakan verifikasi pembayaran
   * @throws ApiError
   */
  public verifyTransactionReject({
    formData,
  }: {
    formData?: {
      /**
       * ID transaksi
       */
      ids: string;
      /**
       * ID orang tua asuh
       */
      otaId: string;
      /**
       * Notes untuk menjelaskan alasan penolakan verifikasi transaction
       */
      rejectionNote: string;
      /**
       * Nominal yang telah dibayarkan
       */
      amountPaid: number | null;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * ID transaksi
       */
      ids: string;
      /**
       * ID orang tua asuh
       */
      otaId: string;
      /**
       * Notes untuk menjelaskan alasan penolakan verifikasi transaction
       */
      rejectionNote: string;
      /**
       * Nominal yang telah dibayarkan
       */
      amountPaid: number;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/transaction/verify-reject',
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
   * Mengubah status transfer menjadi paid
   * @returns any Berhasil mengubah status transfer menjadi paid
   * @throws ApiError
   */
  public acceptTransferStatus({
    formData,
  }: {
    formData?: {
      /**
       * ID transaksi
       */
      id: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * ID transaksi
       */
      id: string;
      status: 'unpaid' | 'paid';
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/transaction/accept-transfer-status',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
}
