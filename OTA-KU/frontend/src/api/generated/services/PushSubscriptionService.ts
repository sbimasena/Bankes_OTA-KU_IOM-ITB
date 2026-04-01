/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePushSubscriptionSchema } from '../models/CreatePushSubscriptionSchema';
import type { NotificationDataSchema } from '../models/NotificationDataSchema';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PushSubscriptionService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get a push subscription.
   * @returns any Successful push subscription retrieval.
   * @throws ApiError
   */
  public getPushSubscription({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    /**
     * Indicates if the subscription was retrieved successfully.
     */
    success: boolean;
    /**
     * Message indicating the result of the operation.
     */
    message: string;
    body: {
      /**
       * Indicates if the user is subscribed to push notifications.
       */
      isSubscribed: boolean;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/push/get/{id}',
      path: {
        'id': id,
      },
      errors: {
        400: `Bad request - missing fields.`,
        401: `Bad request: authorization (not logged in) error`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Create a push subscription.
   * @returns any Successful push subscription creation.
   * @throws ApiError
   */
  public createPushSubscription({
    id,
    formData,
  }: {
    id: string,
    formData?: CreatePushSubscriptionSchema,
  }): CancelablePromise<{
    /**
     * Indicates if the subscription was created successfully.
     */
    success: boolean;
    /**
     * Message indicating the result of the operation.
     */
    message: string;
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/push/create/{id}',
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
  /**
   * Delete a push subscription.
   * @returns any Successful push subscription deletion.
   * @throws ApiError
   */
  public deletePushSubscription({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    /**
     * Indicates if the subscription was deleted successfully.
     */
    success: boolean;
    /**
     * Message indicating the result of the operation.
     */
    message: string;
  }> {
    return this.httpRequest.request({
      method: 'DELETE',
      url: '/api/push/delete/{id}',
      path: {
        'id': id,
      },
      errors: {
        400: `Bad request - missing fields.`,
        401: `Bad request: authorization (not logged in) error`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Send a push notification.
   * @returns any Successful push notification sent.
   * @throws ApiError
   */
  public sendPushNotification({
    id,
    formData,
  }: {
    id: string,
    formData?: NotificationDataSchema,
  }): CancelablePromise<{
    /**
     * Indicates if the notification was sent successfully.
     */
    success: boolean;
    /**
     * Message indicating the result of the operation.
     */
    message: string;
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/push/send/{id}',
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
