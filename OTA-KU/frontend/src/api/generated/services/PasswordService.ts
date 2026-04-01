/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PasswordService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Change password.
   * @returns any Successful change password.
   * @throws ApiError
   */
  public changePassword({
    id,
    formData,
  }: {
    /**
     * User ID
     */
    id: string,
    formData?: {
      /**
       * Password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.
       * Simbol yang diperbolehkan: ! @ # $ % ^ & * ( ) _ - + = [ ] { } ; ' : " \ | , . < > / ?
       */
      password: string;
      /**
       * Password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.
       * Simbol yang diperbolehkan: ! @ # $ % ^ & * ( ) _ - + = [ ] { } ; ' : " \ | , . < > / ?
       */
      confirmPassword: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/password/change/{id}',
      path: {
        'id': id,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Bad request - missing fields.`,
        401: `Bad request: authorization (not logged in) error`,
        500: `Internal server error`,
      },
    });
  }
}
