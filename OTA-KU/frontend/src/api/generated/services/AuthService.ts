/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserLoginRequestSchema } from '../models/UserLoginRequestSchema';
import type { UserRegisRequestSchema } from '../models/UserRegisRequestSchema';
import type { UserSchema } from '../models/UserSchema';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Authenticates a user and returns a JWT token.
   * @returns any Successful login.
   * @throws ApiError
   */
  public login({
    formData,
  }: {
    formData?: UserLoginRequestSchema,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * JWT token for authentication.
       */
      token: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/auth/login',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Bad request - missing fields.`,
        401: `Invalid credentials.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Registers a new user and returns a JWT token.
   * @returns any Successful registration
   * @throws ApiError
   */
  public regis({
    formData,
  }: {
    formData?: UserRegisRequestSchema,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * JWT token for authentication.
       */
      token: string;
      /**
       * Unique account ID
       */
      id: string;
      /**
       * The user's email.
       */
      email: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/auth/register',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Bad request (e.g., missing fields).`,
        401: `Invalid credentials.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Authenticates a user using Azure OAuth2.
   * @returns any Successful login.
   * @throws ApiError
   */
  public oauth({
    formData,
  }: {
    formData?: {
      /**
       * OAuth code for authentication.
       */
      code: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * JWT token for authentication.
       */
      token: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/auth/oauth',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Bad request - missing fields.`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Sends a password reset email to the user.
   * @returns any Password reset email sent.
   * @throws ApiError
   */
  public forgotPassword({
    formData,
  }: {
    formData?: {
      /**
       * The user's email.
       */
      email: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/auth/forgot-password',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        500: `Internal server error`,
      },
    });
  }
  /**
   * Verifies if the user is authenticated by checking the JWT.
   * @returns any Success
   * @throws ApiError
   */
  public verif(): CancelablePromise<{
    success: boolean;
    message: string;
    body: UserSchema;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/auth/verify',
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Logs out the user by clearing the JWT cookie.
   * @returns any Successful logout.
   * @throws ApiError
   */
  public logout(): CancelablePromise<{
    success: boolean;
    message: string;
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/auth/logout',
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        500: `Internal server error.`,
      },
    });
  }
  /**
   * Authenticates a user using OTP.
   * @returns any Valid OTP.
   * @throws ApiError
   */
  public otp({
    formData,
  }: {
    formData?: {
      pin: string;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      /**
       * JWT token for authentication.
       */
      token: string;
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/auth/otp',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Invalid OTP.`,
        401: `Account is already verified.`,
        404: `Invalid OTP.`,
        500: `Internal server error`,
      },
    });
  }
}
