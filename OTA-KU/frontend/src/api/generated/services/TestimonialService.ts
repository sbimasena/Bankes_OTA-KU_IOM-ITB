/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class TestimonialService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}

  public getMyTestimonial({
    status,
  }: {
    status?: 'shown' | 'not_shown',
  } = {}): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      testimonial: {
        id: string;
        otaId: string;
        content: string;
        images: Array<string>;
        status: 'shown' | 'not_shown';
        isActive: boolean;
        updatedAt: string;
      } | null;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/testimonial/mahasiswa/me',
      query: {
        'status': status,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }

  public upsertMyTestimonial({
    formData,
  }: {
    formData?: {
      content: string;
      images?: Array<Blob>;
      removedImages?: Array<string>;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      id: string;
      otaId: string;
      status: 'shown' | 'not_shown';
    };
  }> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/api/testimonial/mahasiswa',
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }

  public listModerationTestimonials({
    q,
    page,
    status,
  }: {
    q?: string,
    page?: number,
    status?: 'shown' | 'not_shown',
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      totalData: number;
      data: Array<{
        id: string;
        mahasiswaId: string;
        otaId: string;
        otaName: string | null;
        name: string;
        nim: string;
        major: string | null;
        content: string;
        images: Array<string>;
        status: 'shown' | 'not_shown';
        isActive: boolean;
        updatedAt: string;
      }>;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/testimonial/admin/list',
      query: {
        'q': q,
        'page': page,
        'status': status,
      },
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        500: `Internal server error`,
      },
    });
  }

  public reviewTestimonial({
    id,
    formData,
  }: {
    id: string,
    formData?: {
      status: 'shown';
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      id: string;
      status: 'shown' | 'not_shown';
    };
  }> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/testimonial/admin/{id}/review',
      path: {
        'id': id,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        404: `Testimoni tidak ditemukan`,
        500: `Internal server error`,
      },
    });
  }

  public toggleTestimonialActive({
    id,
    formData,
  }: {
    id: string,
    formData?: {
      isActive: boolean;
    },
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      id: string;
      isActive: boolean;
    };
  }> {
    return this.httpRequest.request({
      method: 'PATCH',
      url: '/api/testimonial/admin/{id}/active',
      path: {
        'id': id,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        401: `Bad request: authorization (not logged in) error`,
        403: `Forbidden`,
        404: `Testimoni tidak ditemukan`,
        500: `Internal server error`,
      },
    });
  }

  public listPublicTestimonials({
    limit,
  }: {
    limit?: number,
  }): CancelablePromise<{
    success: boolean;
    message: string;
    body: {
      data: Array<{
        id: string;
        major: string | null;
        faculty: string | null;
        content: string;
        images: Array<string>;
      }>;
    };
  }> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/api/testimonial/public',
      query: {
        'limit': limit,
      },
      errors: {
        500: `Internal server error`,
      },
    });
  }
}
