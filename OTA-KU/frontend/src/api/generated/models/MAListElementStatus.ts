/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MAListElementStatus = {
  accountId: string;
  name: string;
  /**
   * Nomor Induk Mahasiswa
   */
  nim: string;
  faculty: string;
  major: string;
  cityOfOrigin: string;
  highschoolAlumni: string;
  gender: 'M' | 'F';
  religion: 'Islam' | 'Kristen Protestan' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  gpa: string;
  /**
   * Status mahasiswa
   */
  mahasiswaStatus: 'active' | 'inactive';
  request_term_ota: boolean;
  request_term_ma: boolean;
};

