import { createRoute } from "@hono/zod-openapi";
import { AuthorizationErrorResponse } from "../types/response.js";
import { InternalServerErrorResponse, NotFoundResponse } from "../zod/response.js";
import { UnverifiedResponse } from "../zod/profile.js";
import { AdminUnverifiedResponse, listTerminateForAdminResponse, listTerminateForOTAResponse, listTerminateQuerySchema, requestTerminateMAFailedResponse, requestTerminateMASuccessResponse, requestTerminateOTAFailedResponse, requestTerminateOTASuccessResponse, TerminateRequestSchema, terminationStatusMA, validateTerminateFailedResponse, validateTerminateSuccessResponse, verifTerminateRequestSchema } from "../zod/terminate.js";
import { OrangTuaUnverifiedResponse } from "../zod/connect.js";

export const listTerminateForAdminRoute = createRoute({
    operationId: "listTerminateForAdmin",
    tags: ["Terminate"],
    method: "get",
    path: "/admin/daftar-terminate",
    description: "Mendapatkan daftar request terminate untuk Admin",
    request: {
        query: listTerminateQuerySchema
    },
    responses: {
        200: {
            description: "Berhasil mendapatkan daftar request terminate untuk Admin",
            content: {
                "application/json": { schema: listTerminateForAdminResponse }
            }
        },
        401: AuthorizationErrorResponse,
        403: {
            description: "Akun Admin belum terverifikasi.",
            content: {
                "application/json": { schema: AdminUnverifiedResponse },
            }
        },
        500: {
            description: "Internal server error",
            content: {
                "application/json": { schema: InternalServerErrorResponse }
            }
        },
    }
})

export const listTerminateForOTARoute = createRoute({
    operationId: "listTerminateForOTA",
    tags: ["Terminate"],
    method: "get",
    path: "/ota/daftar-terminate",
    description: "Mendapatkan daftar terminate untuk OTA",
    request: {
        query: listTerminateQuerySchema
    },
    responses: {
        200: {
            description: "Berhasil mendapatkan daftar terminate untuk OTA",
            content: {
                "application/json": { schema: listTerminateForOTAResponse }
            }
        },
        401: AuthorizationErrorResponse,
        403: {
            description: "Akun anda belum terverifikasi.",
            content: {
                "application/json": { schema: AdminUnverifiedResponse },
            }
        },
        500: {
            description: "Internal server error",
            content: {
                "application/json": { schema: InternalServerErrorResponse }
            }
        },
    }
})

export const terminationStatusMARoute = createRoute({
    operationId: "terminationStatusMA",
    tags: ["Terminate"],
    method: "get",
    path: "/ma/status-terminate",
    description: "Mendapatkan status terminasi untuk MA",
    responses: {
        200: {
            description: "Status terminasi untuk MA berhasil diambil",
            content: {
                "application/json": { schema: terminationStatusMA }
            }
        },
        401: AuthorizationErrorResponse,
        403: {
            description: "Akun anda belum terverifikasi.",
            content: {
                "application/json": { schema: AdminUnverifiedResponse },
            }
        },
        500: {
            description: "Internal server error",
            content: {
                "application/json": { schema: InternalServerErrorResponse }
            }
        },
    }
})

export const requestTerminateFromMARoute = createRoute({
    operationId: "requestTerminateFromMA",
    tags: ["Terminate"],
    method: "post",
    path: "/ma",
    description: "Mengirimkan request terminate hubungan asuh dari akun MA",
    request: {
        body:{
            content:{
                "multipart/form-data": { schema: TerminateRequestSchema }
            }
        }
    },
    responses:{
        200: {
            description: "Berhasil mengirimkan request terminate hubungan asuh dari akun MA",
            content: {
                "application/json": { schema: requestTerminateMASuccessResponse },
            }
        },
        400: {
            description: "Gagal mengirimkan request terminate hubungan asuh dari akun MA",
            content: {
                "application/json": { schema: requestTerminateMAFailedResponse },
            }
        },
        401: AuthorizationErrorResponse,
        403: {
            description: "Akun MA belum terverifikasi.",
            content: {
                "application/json": { schema: UnverifiedResponse },
            }
        },
        500: {
            description: "Internal server error",
            content: {
                "application/json": { schema: InternalServerErrorResponse },
            }
        },
    }
})

export const requestTerminateFromOTARoute = createRoute({
    operationId: "requestTerminateFromOTA",
    tags: ["Terminate"],
    method: "post",
    path: "/ota",
    description: "Mengirimkan request terminate hubungan asuh dari akun OTA",
    request: {
        body:{
            content:{
                "multipart/form-data": { schema: TerminateRequestSchema }
            }
        }
    },
    responses:{
        200: {
            description: "Berhasil mengirimkan request terminate hubungan asuh dari akun OTA",
            content: {
                "application/json": { schema: requestTerminateOTASuccessResponse },
            }
        },
        400: {
            description: "Gagal mengirimkan request terminate hubungan asuh dari akun OTA",
            content: {
                "application/json": { schema: requestTerminateOTAFailedResponse },
            }
        },
        401: AuthorizationErrorResponse,
        403: {
            description: "Akun OTA belum terverifikasi.",
            content: {
                "application/json": { schema: OrangTuaUnverifiedResponse },
            }
        },
        500: {
            description: "Internal server error",
            content: {
                "application/json": { schema: InternalServerErrorResponse },
            }
        },
    }
})

export const validateTerminateRoute = createRoute({
    operationId: "validateTerminate",
    tags: ["Terminate"],
    method: "post",
    path: "/validate",
    description: "Melakukan validasi terminate hubungan asuh",
    request: {
        body:{
            content:{
                "multipart/form-data": { schema: verifTerminateRequestSchema }
            }
        }
    },
    responses:{
        200: {
            description: "Berhasil memvalidasi terminasi hubungan",
            content:{
                "application/json": {schema: validateTerminateSuccessResponse }
            }
        },
        400: {
            description: "Gagal memvalidasi terminasi hubungan",
            content: {
                "application/json": { schema: validateTerminateFailedResponse },
            }
        },
        401: AuthorizationErrorResponse,
        403: {
            description: "Akun admin belum terverifikasi.",
            content: {
                "application/json": { schema: AdminUnverifiedResponse },
            }
        },
        404: {
            description: "Connection not found.",
            content: {
                "application/json": { schema: NotFoundResponse },
            }
        },
        500: {
            description: "Internal server error",
            content: {
                "application/json": { schema: InternalServerErrorResponse },
            }
        },
    }
})

export const rejectTerminateRoute = createRoute({
    operationId: "rejectTerminate",
    tags: ["Terminate"],
    method: "post",
    path: "/reject",
    description: "Melakukan penolakan request terminasi hubungan asuh",
    request: {
        body:{
            content:{
                "multipart/form-data": { schema: verifTerminateRequestSchema }
            }
        }
    },
    responses:{
        200: {
            description: "Berhasil menolak request terminasi hubungan asuh",
            content:{
                "application/json": {schema: validateTerminateSuccessResponse }
            }
        },
        400: {
            description: "Gagal menolak request terminasi hubungan asuh",
            content: {
                "application/json": { schema: validateTerminateFailedResponse },
            }
        },
        401: AuthorizationErrorResponse,
        403: {
            description: "Akun admin belum terverifikasi.",
            content: {
                "application/json": { schema: AdminUnverifiedResponse },
            }
        },
        500: {
            description: "Internal server error",
            content: {
                "application/json": { schema: InternalServerErrorResponse },
            }
        },
    }
})