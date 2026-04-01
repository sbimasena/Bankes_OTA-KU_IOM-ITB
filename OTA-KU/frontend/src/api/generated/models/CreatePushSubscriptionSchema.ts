/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreatePushSubscriptionSchema = {
  /**
   * The endpoint URL to send push notifications to.
   */
  endpoint: string;
  /**
   * The user's public key for the push subscription.
   */
  p256dh: string;
  /**
   * Authentication secret for the push subscription.
   */
  auth: string;
};

