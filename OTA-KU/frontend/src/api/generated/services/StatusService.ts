/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class StatusService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Mengubah status pendaftaran.
   * @returns any Berhasil mengubah status pendaftaran
   * @throws ApiError
   */
  public applicationStatus({
    id,
    formData,
  }: {
    id: string,
    formData?: {
      /**
       * Status aplikasi
       */
      status: 'accepted' | 'rejected' | 'pending' | 'unregistered' | 'reapply' | 'outdated';
      bill?: number | null;
      notes?: string;
      adminOnlyNotes?: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * Status aplikasi
       */
      status: 'accepted' | 'rejected' | 'pending' | 'unregistered' | 'reapply' | 'outdated';
    };
  }> {
    return this.httpRequest.request({
      method: 'PUT',
      url: '/api/status/status/application/{id}',
      path: {
        'id': id,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Mengambil status pendaftaran.
   * @returns any Berhasil mengambil status pendaftaran
   * @throws ApiError
   */
  public getApplicationStatus({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * Status aplikasi
       */
      status: 'accepted' | 'rejected' | 'pending' | 'unregistered' | 'reapply' | 'outdated';
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/status/status/application/{id}',
      path: {
        'id': id,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Mengambil status verifikasi.
   * @returns any Berhasil mengambil status verifikasi
   * @throws ApiError
   */
  public getVerificationStatus({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * Status verifikasi
       */
      status: 'verified' | 'unverified';
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/status/status/verification/{id}',
      path: {
        'id': id,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Mengambil status pendaftaran ulang.
   * @returns any Berhasil mengambil status pendaftaran ulang
   * @throws ApiError
   */
  public getReapplicationStatus({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * Status pendaftaran ulang
       */
      status: boolean;
      /**
       * Sisa hari hingga batas pendaftaran ulang
       */
      daysRemaining: number;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/status/status/reapplication/{id}',
      path: {
        'id': id,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }
}
