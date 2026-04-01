/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AllAccountListElement = {
  id: string;
  email: string;
  type: 'mahasiswa' | 'admin' | 'ota' | 'bankes' | 'pengurus';
  phoneNumber: string;
  provider: 'credentials' | 'azure';
  /**
   * Verification status of account
   */
  status: 'verified' | 'unverified';
  applicationStatus: 'pending' | 'accepted' | 'rejected' | 'unregistered' | 'reapply' | 'outdated';
  ma_name: string;
  ota_name: string;
  admin_name: string;
  nim: string;
  mahasiswaStatus: 'active' | 'inactive';
  description: string;
  file: string;
  major: string;
  faculty: string;
  cityOfOrigin: string;
  highschoolAlumni: string;
  religion: 'Islam' | 'Kristen Protestan' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
  gender: 'M' | 'F';
  gpa: string;
  kk: string;
  ktm: string;
  waliRecommendationLetter: string;
  transcript: string;
  salaryReport: string;
  pbb: string;
  electricityBill: string;
  ditmawaRecommendationLetter: string;
  /**
   * The amount of the bill in IDR
   */
  bill: number;
  notes: string;
  adminOnlyNotes: string;
  job: string;
  address: string;
  linkage: 'otm' | 'dosen' | 'alumni' | 'lainnya' | 'none';
  funds: number;
  maxCapacity: number;
  startDate: string;
  maxSemester: number;
  transferDate: number;
  criteria: string;
  allowAdminSelection: boolean;
};

