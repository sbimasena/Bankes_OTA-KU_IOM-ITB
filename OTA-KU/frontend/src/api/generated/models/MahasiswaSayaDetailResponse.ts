/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MahasiswaSayaDetailResponse = {
  id: string;
  email: string;
  phoneNumber: string;
  name: string;
  nim: string;
  major: string;
  faculty: string;
  cityOfOrigin: string;
  highschoolAlumni: string;
  religion: 'Islam' | 'Kristen Protestan' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  gender: 'M' | 'F';
  gpa: string;
  notes: string;
  /**
   * Timestamp when the mahasiswa was created
   */
  createdAt: string;
  /**
   * Isi testimoni mahasiswa untuk OTA. Null jika testimoni belum dibuat
   */
  testimonial: string | null;
  /**
   * Daftar URL foto testimoni mahasiswa untuk OTA
   */
  testimonialImages: Array<string>;
};

