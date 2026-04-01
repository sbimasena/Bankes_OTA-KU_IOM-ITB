/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SendOtpRequestSchema } from '../models/SendOtpRequestSchema';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class OtpService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Send OTP to the user's email.
   * @returns any OTP sent successfully.
   * @throws ApiError
   */
  public sendOtp({
    formData,
  }: {
    formData?: SendOtpRequestSchema,
  }): CancelablePromise<{
    success: boolean;
    message: string;
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/otp/send',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Bad request - missing fields.`,
        401: `Bad request: authorization (not logged in) error`,
        404: `User not found.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Get OTP expiration date.
   * @returns any OTP expiration date retrieved successfully.
   * @throws ApiError
   */
  public getOtpExpiredDate(): CancelablePromise<{
    success: boolean;
    message: string;
    expiredAt: string;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/otp/expired-date',
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        404: `OTP not found.`,
        500: `Internal server error`,
      },
    });
  }
}
