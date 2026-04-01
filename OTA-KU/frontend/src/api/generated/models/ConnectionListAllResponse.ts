/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ConnectionListAllResponse = {
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
  /**
   * Connection status of a given connection
   */
  connection_status: 'accepted' | 'pending' | 'rejected';
  request_term_ota: boolean;
  request_term_ma: boolean;
  paidFor: number;
};

