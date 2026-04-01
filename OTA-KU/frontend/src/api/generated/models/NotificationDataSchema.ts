/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationAction } from './NotificationAction';
export type NotificationDataSchema = {
  /**
   * Unique account ID
   */
  userId: string;
  /**
   * Title of the notification.
   */
  title: string;
  /**
   * Body content of the notification.
   */
  body: string;
  /**
   * Optional actions available for the notification.
   */
  actions?: Array<NotificationAction>;
};

