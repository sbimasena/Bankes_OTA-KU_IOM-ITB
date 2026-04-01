/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MahasiswaSayaDetailResponse } from '../models/MahasiswaSayaDetailResponse';
import type { MyOtaDetailResponse } from '../models/MyOtaDetailResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DetailService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get detailed information of a specific mahasiswa.
   * @returns any Berhasil mendapatkan detail mahasiswa.
   * @throws ApiError
   */
  public getMahasiswaDetail({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      id: string;
      email: string;
      type: 'mahasiswa' | 'admin' | 'ota' | 'bankes' | 'pengurus';
      phoneNumber: string;
      provider: 'credentials' | 'azure';
      applicationStatus: 'pending' | 'accepted' | 'rejected' | 'unregistered' | 'reapply' | 'outdated';
      name: string;
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
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/detail/mahasiswa/{id}',
      path: {
        'id': id,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        404: `Mahasiswa tidak ditemukan`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Get detailed information of my current mahasiswa.
   * @returns any Berhasil mendapatkan detail mahasiswa.
   * @throws ApiError
   */
  public getMahasiswaSayaDetail({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: MahasiswaSayaDetailResponse;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/detail/mahasiswa-saya/{id}',
      path: {
        'id': id,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Anda tidak memiliki akses ke mahasiswa ini`,
        404: `Mahasiswa tidak ditemukan`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Get detailed information of a specific mahasiswa asuh for orang tua asuh.
   * @returns any Berhasil mendapatkan detail mahasiswa asuh.
   * @throws ApiError
   */
  public getMahasiswaDetailForOta({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: MahasiswaSayaDetailResponse;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/detail/mahasiswa-asuh/{id}',
      path: {
        'id': id,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        404: `Mahasiswa asuh tidak ditemukan`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Get detailed information of a specific orang tua asuh.
   * @returns any Berhasil mendapatkan detail orang tua asuh.
   * @throws ApiError
   */
  public getOtaDetail({
    id,
  }: {
    id: string,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      id: string;
      email: string;
      type: 'mahasiswa' | 'admin' | 'ota' | 'bankes' | 'pengurus';
      phoneNumber: string;
      provider: 'credentials' | 'azure';
      applicationStatus: 'pending' | 'accepted' | 'rejected' | 'unregistered' | 'reapply' | 'outdated';
      name: string;
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
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/detail/orang-tua/{id}',
      path: {
        'id': id,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        404: `Orang tua asuh tidak ditemukan`,
        500: `Internal server error`,
      },
    });
  }
  /**
   * Get detailed information of my current orang tua asuh.
   * @returns any Berhasil mendapatkan detail orang tua asuh saya.
   * @throws ApiError
   */
  public getMyOtaDetail(): CancelablePromise<{
    success: boolean;
    message: string;
    body: MyOtaDetailResponse;
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/detail/orang-tua-saya',
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Anda tidak memiliki akses ke orang tua asuh ini`,
        404: `Orang tua asuh saya tidak ditemukan`,
        500: `Internal server error`,
      },
    });
  }
}
