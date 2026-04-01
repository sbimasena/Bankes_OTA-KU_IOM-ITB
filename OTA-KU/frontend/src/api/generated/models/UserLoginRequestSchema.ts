/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserLoginRequestSchema = {
  identifier: string;
  /**
   * Password minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan simbol.
   * Simbol yang diperbolehkan: ! @ # $ % ^ & * ( ) _ - + = [ ] { } ; ' : " \ | , . < > / ?
   */
  password: string;
};

