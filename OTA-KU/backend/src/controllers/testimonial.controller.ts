import { prisma } from "../db/prisma.js";
import { uploadFileToMinio } from "../lib/file-upload-minio.js";
import {
  getMyTestimonialRoute,
  listModerationTestimonialsRoute,
  listPublicTestimonialsRoute,
  reviewTestimonialRoute,
  toggleTestimonialActiveRoute,
  upsertMyTestimonialRoute,
} from "../routes/testimonial.route.js";
import {
  GetMyTestimonialQuerySchema,
  ListModerationTestimonialQuerySchema,
  PublicTestimonialQuerySchema,
  ReviewTestimonialBodySchema,
  ReviewTestimonialParamsSchema,
  ToggleTestimonialActiveBodySchema,
  ToggleTestimonialActiveParamsSchema,
  UpsertTestimonialSchema,
} from "../zod/testimonial.js";
import { createAuthRouter, createRouter } from "./router-factory.js";

export const testimonialRouter = createRouter();
export const testimonialProtectedRouter = createAuthRouter();

const LIST_PAGE_SIZE = 8;
const MAX_IMAGE_COUNT = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function sanitizeTestimonialText(text: string) {
  return text
    .replace(/<[^>]*>?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseImageFiles(formData: FormData) {
  const files = formData
    .getAll("images")
    .filter((item): item is File => item instanceof File)
    .filter((file) => file.size > 0);

  if (files.length > MAX_IMAGE_COUNT) {
    throw new Error("Maksimal upload 3 foto testimoni");
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
      throw new Error("Format foto harus JPEG, PNG, atau WEBP");
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error("Ukuran foto maksimal 5MB per file");
    }
  }

  return files;
}

function isModerator(type: string) {
  return type === "admin" || type === "bankes" || type === "pengurus";
}

async function getCurrentPeriod() {
  return prisma.period.findFirst({
    where: { isCurrent: true },
    select: { id: true, period: true },
    orderBy: { id: "desc" },
  });
}

function parseRemovedImages(formData: FormData) {
  const removed = formData
    .getAll("removedImages")
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set(removed));
}

testimonialProtectedRouter.openapi(getMyTestimonialRoute, async (c) => {
  const user = c.var.user;
  const query = GetMyTestimonialQuerySchema.parse(c.req.query());
  const { periodId, status } = query;

  if (user.type !== "mahasiswa") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya mahasiswa yang dapat mengakses testimoni pribadi",
        },
      },
      403,
    );
  }

  try {
    const [periods, testimonials] = await Promise.all([
      prisma.period.findMany({
        select: {
          id: true,
          period: true,
          isCurrent: true,
        },
        orderBy: { id: "desc" },
      }),
      prisma.testimonial.findMany({
        where: {
          mahasiswaId: user.id,
          ...(periodId ? { periodId } : {}),
          ...(status ? { status } : {}),
        },
        include: {
          Period: {
            select: {
              period: true,
            },
          },
        },
        orderBy: [{ periodId: "desc" }, { updatedAt: "desc" }],
      }),
    ]);

    const currentPeriod = periods.find((item) => item.isCurrent) ?? null;
    const selectedTestimonial =
      (periodId
        ? testimonials.find((item) => item.periodId === periodId)
        : undefined) ??
      (currentPeriod
        ? testimonials.find((item) => item.periodId === currentPeriod.id)
        : undefined) ??
      testimonials[0] ??
      null;

    return c.json(
      {
        success: true,
        message: "Berhasil mengambil testimoni saya",
        body: {
          currentPeriodId: currentPeriod?.id ?? null,
          periods,
          testimonial: selectedTestimonial
            ? {
                id: selectedTestimonial.id,
                periodId: selectedTestimonial.periodId,
                periodLabel: selectedTestimonial.Period.period,
                content: selectedTestimonial.content,
                images: selectedTestimonial.imageUrls,
                status: selectedTestimonial.status,
                isActive: selectedTestimonial.isActive,
                reviewedAt: selectedTestimonial.reviewedAt?.toISOString() ?? null,
                updatedAt: selectedTestimonial.updatedAt.toISOString(),
              }
            : null,
          history: testimonials.map((item) => ({
            id: item.id,
            periodId: item.periodId,
            periodLabel: item.Period.period,
            status: item.status,
            isActive: item.isActive,
            updatedAt: item.updatedAt.toISOString(),
          })),
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error fetching my testimonial:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error,
      },
      500,
    );
  }
});

testimonialProtectedRouter.openapi(upsertMyTestimonialRoute, async (c) => {
  const user = c.var.user;

  if (user.type !== "mahasiswa") {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message: "Hanya mahasiswa yang dapat submit testimoni",
        },
      },
      403,
    );
  }

  try {
    const currentPeriod = await getCurrentPeriod();
    if (!currentPeriod) {
      return c.json(
        {
          success: false,
          message: "Belum ada periode bantuan aktif",
          error: {
            code: "BAD_REQUEST",
            message: "Belum ada periode bantuan aktif",
          },
        },
        400,
      );
    }

    const hasAcceptedConnection = await prisma.connection.findFirst({
      where: {
        mahasiswaId: user.id,
        connectionStatus: "accepted",
      },
      select: { mahasiswaId: true },
    });

    if (!hasAcceptedConnection) {
      return c.json(
        {
          success: false,
          message: "Forbidden",
          error: {
            code: "Forbidden",
            message:
              "Mahasiswa harus memiliki hubungan asuh accepted untuk mengirim testimoni",
          },
        },
        403,
      );
    }

    const formData = await c.req.formData();
    const rawData = Object.fromEntries(formData.entries());
    const parsed = UpsertTestimonialSchema.parse(rawData);
    const files = parseImageFiles(formData);
    const removedImages = parseRemovedImages(formData);
    const sanitizedContent = sanitizeTestimonialText(parsed.content);

    const existing = await prisma.testimonial.findUnique({
      where: {
        mahasiswaId_periodId: {
          mahasiswaId: user.id,
          periodId: currentPeriod.id,
        },
      },
      select: { id: true, imageUrls: true },
    });

    const remainingImages = (existing?.imageUrls ?? []).filter(
      (imageUrl) => !removedImages.includes(imageUrl),
    );
    let imageUrls = remainingImages;

    if (files.length > 0) {
      const uploaded = await Promise.all(files.map((file) => uploadFileToMinio(file)));
      const uploadedUrls = uploaded
        .map((item) => item?.secure_url)
        .filter((url): url is string => Boolean(url));
      imageUrls = [...remainingImages, ...uploadedUrls];
    }

    if (imageUrls.length > MAX_IMAGE_COUNT) {
      throw new Error("Maksimal upload 3 foto testimoni");
    }

    const result = await prisma.testimonial.upsert({
      where: {
        mahasiswaId_periodId: {
          mahasiswaId: user.id,
          periodId: currentPeriod.id,
        },
      },
      create: {
        mahasiswaId: user.id,
        periodId: currentPeriod.id,
        content: sanitizedContent,
        imageUrls,
        status: "not_shown",
        isActive: false,
        approvedById: null,
        approvedAt: null,
        reviewedAt: null,
        rejectedReason: null,
      },
      update: {
        content: sanitizedContent,
        imageUrls,
        status: "not_shown",
        isActive: false,
        approvedById: null,
        approvedAt: null,
        reviewedAt: null,
        rejectedReason: null,
      },
      select: {
        id: true,
        periodId: true,
        status: true,
      },
    });

    return c.json(
      {
        success: true,
        message: "Berhasil menyimpan testimoni",
        body: result,
      },
      200,
    );
  } catch (error) {
    console.error("Error upserting testimonial:", error);
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        error,
      },
      500,
    );
  }
});

testimonialProtectedRouter.openapi(listModerationTestimonialsRoute, async (c) => {
  const user = c.var.user;
  const query = ListModerationTestimonialQuerySchema.parse(c.req.query());
  const { q, status, periodId, page = 1 } = query;

  if (!isModerator(user.type)) {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message:
            "Hanya admin, bankes, atau pengurus yang dapat mengakses moderasi testimoni",
        },
      },
      403,
    );
  }

  try {
    const where = {
      ...(status ? { status } : {}),
      ...(periodId ? { periodId } : {}),
      ...(q
        ? {
            OR: [
              { MahasiswaProfile: { name: { contains: q, mode: "insensitive" as const } } },
              { MahasiswaProfile: { nim: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [rows, totalData, periods] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        include: {
          Period: {
            select: {
              period: true,
            },
          },
          MahasiswaProfile: true,
          Approver: {
            include: {
              AdminProfile: true,
              OtaProfile: true,
              MahasiswaProfile: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: LIST_PAGE_SIZE,
        skip: (page - 1) * LIST_PAGE_SIZE,
      }),
      prisma.testimonial.count({ where }),
      prisma.period.findMany({
        select: {
          id: true,
          period: true,
          isCurrent: true,
        },
        orderBy: { id: "desc" },
      }),
    ]);

    return c.json(
      {
        success: true,
        message: "Berhasil mengambil daftar moderasi testimoni",
        body: {
          totalData,
          periods,
          data: rows.map((item) => ({
            id: item.id,
            mahasiswaId: item.mahasiswaId,
            periodId: item.periodId,
            periodLabel: item.Period.period,
            name: item.MahasiswaProfile.name ?? "-",
            nim: item.MahasiswaProfile.nim,
            major: item.MahasiswaProfile.major,
            content: item.content,
            images: item.imageUrls,
            status: item.status,
            isActive: item.isActive,
            approvedByName:
              item.Approver?.name ??
              item.Approver?.AdminProfile?.name ??
              item.Approver?.OtaProfile?.name ??
              item.Approver?.MahasiswaProfile?.name ??
              null,
            reviewedAt: item.reviewedAt?.toISOString() ?? null,
            updatedAt: item.updatedAt.toISOString(),
          })),
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error listing moderation testimonial:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error,
      },
      500,
    );
  }
});

testimonialProtectedRouter.openapi(reviewTestimonialRoute, async (c) => {
  const user = c.var.user;
  const { id } = ReviewTestimonialParamsSchema.parse(c.req.param());

  if (!isModerator(user.type)) {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message:
            "Hanya admin, bankes, atau pengurus yang dapat memoderasi testimoni",
        },
      },
      403,
    );
  }

  try {
    const formData = await c.req.formData();
    const data = Object.fromEntries(formData.entries());
    const parsed = ReviewTestimonialBodySchema.parse(data);

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!testimonial) {
      return c.json(
        {
          success: false,
          message: "Testimoni tidak ditemukan",
          error: {
            code: "NOT_FOUND",
            message: "Testimoni tidak ditemukan",
          },
        },
        404,
      );
    }

    const now = new Date();
    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        status: parsed.status,
        isActive: parsed.status === "shown",
        approvedById: user.id,
        approvedAt: now,
        rejectedReason: null,
        reviewedAt: now,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return c.json(
      {
        success: true,
        message: "Berhasil mengubah status testimoni",
        body: updated,
      },
      200,
    );
  } catch (error) {
    console.error("Error reviewing testimonial:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error,
      },
      500,
    );
  }
});

testimonialProtectedRouter.openapi(toggleTestimonialActiveRoute, async (c) => {
  const user = c.var.user;
  const { id } = ToggleTestimonialActiveParamsSchema.parse(c.req.param());

  if (!isModerator(user.type)) {
    return c.json(
      {
        success: false,
        message: "Forbidden",
        error: {
          code: "Forbidden",
          message:
            "Hanya admin, bankes, atau pengurus yang dapat mengubah visibilitas testimoni",
        },
      },
      403,
    );
  }

  try {
    const formData = await c.req.formData();
    const data = Object.fromEntries(formData.entries());
    const parsed = ToggleTestimonialActiveBodySchema.parse(data);

    const existing = await prisma.testimonial.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return c.json(
        {
          success: false,
          message: "Testimoni tidak ditemukan",
          error: {
            code: "NOT_FOUND",
            message: "Testimoni tidak ditemukan",
          },
        },
        404,
      );
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        isActive: parsed.isActive,
        status: parsed.isActive ? "shown" : "not_shown",
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    return c.json(
      {
        success: true,
        message: "Berhasil mengubah visibilitas testimoni",
        body: updated,
      },
      200,
    );
  } catch (error) {
    console.error("Error toggling testimonial active:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error,
      },
      500,
    );
  }
});

testimonialRouter.openapi(listPublicTestimonialsRoute, async (c) => {
  const { limit = 10 } = PublicTestimonialQuerySchema.parse(c.req.query());

  try {
    const rows = await prisma.testimonial.findMany({
      where: {
        status: "shown",
      },
      include: {
        MahasiswaProfile: true,
      },
      orderBy: [{ reviewedAt: "desc" }, { updatedAt: "desc" }],
      take: limit,
    });

    return c.json(
      {
        success: true,
        message: "Berhasil mengambil testimoni publik",
        body: {
          data: rows.map((row) => ({
            id: row.id,
            major: row.MahasiswaProfile.major,
            faculty: row.MahasiswaProfile.faculty,
            content: row.content,
            images: row.imageUrls,
            reviewedAt: row.reviewedAt?.toISOString() ?? null,
          })),
        },
      },
      200,
    );
  } catch (error) {
    console.error("Error listing public testimonials:", error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error,
      },
      500,
    );
  }
});
