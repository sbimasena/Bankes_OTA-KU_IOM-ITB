import { createRoute } from "@hono/zod-openapi";

import { AuthorizationErrorResponse } from "../types/response.js";
import {
  BadRequestResponse,
  ForbiddenResponse,
  InternalServerErrorResponse,
  NotFoundResponse,
} from "../zod/response.js";
import {
  GetMyTestimonialQuerySchema,
  ListModerationTestimonialQuerySchema,
  ListModerationTestimonialResponseSchema,
  PublicTestimonialQuerySchema,
  PublicTestimonialResponseSchema,
  ReviewTestimonialBodySchema,
  ReviewTestimonialParamsSchema,
  ReviewTestimonialResponseSchema,
  TestimonialMeResponseSchema,
  ToggleTestimonialActiveBodySchema,
  ToggleTestimonialActiveParamsSchema,
  ToggleTestimonialActiveResponseSchema,
  UpsertTestimonialResponseSchema,
  UpsertTestimonialSchema,
} from "../zod/testimonial.js";

export const getMyTestimonialRoute = createRoute({
  operationId: "getMyTestimonial",
  tags: ["Testimonial"],
  method: "get",
  path: "/mahasiswa/me",
  description: "Ambil testimoni milik mahasiswa login",
  request: {
    query: GetMyTestimonialQuerySchema,
  },
  responses: {
    200: {
      description: "Berhasil mengambil testimoni saya",
      content: {
        "application/json": {
          schema: TestimonialMeResponseSchema,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ForbiddenResponse,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const upsertMyTestimonialRoute = createRoute({
  operationId: "upsertMyTestimonial",
  tags: ["Testimonial"],
  method: "post",
  path: "/mahasiswa",
  description: "Buat atau perbarui testimoni mahasiswa",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: UpsertTestimonialSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil menyimpan testimoni",
      content: {
        "application/json": {
          schema: UpsertTestimonialResponseSchema,
        },
      },
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: BadRequestResponse,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ForbiddenResponse,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const listModerationTestimonialsRoute = createRoute({
  operationId: "listModerationTestimonials",
  tags: ["Testimonial"],
  method: "get",
  path: "/admin/list",
  description: "Daftar testimoni untuk moderasi admin/bankes/pengurus",
  request: {
    query: ListModerationTestimonialQuerySchema,
  },
  responses: {
    200: {
      description: "Berhasil mengambil daftar moderasi testimoni",
      content: {
        "application/json": {
          schema: ListModerationTestimonialResponseSchema,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ForbiddenResponse,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const reviewTestimonialRoute = createRoute({
  operationId: "reviewTestimonial",
  tags: ["Testimonial"],
  method: "patch",
  path: "/admin/{id}/review",
  description: "Konfirmasi testimoni sehingga bisa diatur visibilitas homepage",
  request: {
    params: ReviewTestimonialParamsSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: ReviewTestimonialBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil memoderasi testimoni",
      content: {
        "application/json": {
          schema: ReviewTestimonialResponseSchema,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ForbiddenResponse,
        },
      },
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: BadRequestResponse,
        },
      },
    },
    404: {
      description: "Testimoni tidak ditemukan",
      content: {
        "application/json": {
          schema: NotFoundResponse,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const toggleTestimonialActiveRoute = createRoute({
  operationId: "toggleTestimonialActive",
  tags: ["Testimonial"],
  method: "patch",
  path: "/admin/{id}/active",
  description: "Aktif/nonaktifkan testimoni di homepage",
  request: {
    params: ToggleTestimonialActiveParamsSchema,
    body: {
      content: {
        "multipart/form-data": {
          schema: ToggleTestimonialActiveBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Berhasil mengubah visibilitas testimoni",
      content: {
        "application/json": {
          schema: ToggleTestimonialActiveResponseSchema,
        },
      },
    },
    401: AuthorizationErrorResponse,
    403: {
      description: "Forbidden",
      content: {
        "application/json": {
          schema: ForbiddenResponse,
        },
      },
    },
    400: {
      description: "Bad request",
      content: {
        "application/json": {
          schema: BadRequestResponse,
        },
      },
    },
    404: {
      description: "Testimoni tidak ditemukan",
      content: {
        "application/json": {
          schema: NotFoundResponse,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});

export const listPublicTestimonialsRoute = createRoute({
  operationId: "listPublicTestimonials",
  tags: ["Testimonial"],
  method: "get",
  path: "/public",
  description: "Daftar testimoni terkonfirmasi dan aktif untuk homepage",
  request: {
    query: PublicTestimonialQuerySchema,
  },
  responses: {
    200: {
      description: "Berhasil mengambil testimoni publik",
      content: {
        "application/json": {
          schema: PublicTestimonialResponseSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": { schema: InternalServerErrorResponse },
      },
    },
  },
});
