/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserSchema = {
  id: string;
  name: string | null;
  email: string;
  phoneNumber: string | null;
  type: 'mahasiswa' | 'ota' | 'admin' | 'bankes' | 'pengurus';
  provider: 'credentials' | 'azure';
  oid: string | null;
  createdAt: string;
  iat: number;
  exp: number;
};

