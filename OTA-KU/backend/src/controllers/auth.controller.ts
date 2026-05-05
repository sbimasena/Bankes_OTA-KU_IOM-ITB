import { compare, hash } from "bcrypt";
import { deleteCookie, setCookie } from "hono/cookie";
import { decode, sign } from "hono/jwt";
import nodemailer from "nodemailer";
import { sendWhatsApp } from "../lib/whatsapp.js";

import { env } from "../config/env.config.js";
import { prisma } from "../db/prisma.js";
import { forgotPasswordEmail } from "../lib/email/lupa-password.js";
import {
  getNimFakultasCodeMap,
  getNimFakultasFromNimJurusanMap,
  getNimJurusanCodeMap,
} from "../lib/nim.js";
import { generateOTP } from "../lib/otp.js";
import { generateSecurePassword } from "../lib/password.js";
import {
  forgotPasswordRoute,
  loginRoute,
  logoutRoute,
  oauthRoute,
  otpRoute,
  regisRoute,
  verifRoute,
} from "../routes/auth.route.js";
import {
  ForgotPasswordSchema,
  OTPVerificationRequestSchema,
  UserLoginRequestSchema,
  UserOAuthLoginRequestSchema,
  UserRegisRequestSchema,
} from "../zod/auth.js";
import { createAuthRouter, createRouter } from "./router-factory.js";

export const authRouter = createRouter();
export const authProtectedRouter = createAuthRouter();

function roleToJwtType(role: string): "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus" {
  const map: Record<string, "mahasiswa" | "ota" | "admin" | "bankes" | "pengurus"> = {
    Mahasiswa: "mahasiswa",
    OrangTuaAsuh: "ota",
    Admin: "admin",
    Bankes: "bankes",
    Pengurus_IOM: "pengurus",
  };
  return map[role] ?? "mahasiswa";
}

authRouter.openapi(loginRoute, async (c) => {
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = UserLoginRequestSchema.parse(data);
  const { identifier, password } = zodParseResult;

  try {
    const foundAccount = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phoneNumber: identifier },
        ],
      },
    });

    if (!foundAccount) {
      console.error("Invalid email");
      return c.json(
        {
          success: false,
          message: "Invalid credentials",
          error: "Invalid email or password",
        },
        401,
      );
    }

    const currentDateTime = new Date(Date.now());

    const temporaryPassword = await prisma.temporaryPassword.findFirst({
      where: {
        userId: foundAccount.id,
        expiredAt: { gte: currentDateTime },
        used: false,
      },
      orderBy: { expiredAt: "desc" },
    });

    if (
      foundAccount.provider === "credentials" &&
      temporaryPassword
    ) {
      const tempPass = temporaryPassword.password;
      const isTempPassValid = await compare(password, tempPass);

      if (isTempPassValid) {
        // Mark the temporary password as used
        await prisma.temporaryPassword.updateMany({
          where: {
            userId: temporaryPassword.userId,
            password: tempPass,
          },
          data: { used: true },
        });
      }
    } else {
      // Check the password hash
      const isPasswordValid = await compare(password, foundAccount.password!);

      if (!isPasswordValid) {
        console.error("Invalid password");
        return c.json(
          {
            success: false,
            message: "Invalid credentials",
            error: "Invalid email or password",
          },
          401,
        );
      }
    }

    const accountId = foundAccount.id;

    let name = null;

    if (foundAccount.role === "Mahasiswa") {
      const mahasiswaDetail = await prisma.mahasiswaProfile.findFirst({
        where: { userId: accountId },
        select: { name: true },
      });

      if (mahasiswaDetail) {
        name = mahasiswaDetail.name;
      }
    } else if (foundAccount.role === "OrangTuaAsuh") {
      const otaDetail = await prisma.otaProfile.findFirst({
        where: { userId: accountId },
        select: { name: true },
      });

      if (otaDetail) {
        name = otaDetail.name;
      }
    } else {
      const adminDetail = await prisma.adminProfile.findFirst({
        where: { userId: accountId },
        select: { name: true },
      });

      if (adminDetail) {
        name = adminDetail.name;
      }
    }

    const accessToken = await sign(
      {
        id: foundAccount.id,
        name,
        email: foundAccount.email,
        phoneNumber: foundAccount.phoneNumber,
        type: roleToJwtType(foundAccount.role),
        provider: foundAccount.provider,
        oid: foundAccount.oid,
        createdAt: foundAccount.createdAt,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      env.JWT_SECRET,
    );

    setCookie(c, "ota-ku.access-cookie", accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return c.json(
      {
        success: true,
        message: "Login successful",
        body: {
          token: accessToken,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

authRouter.openapi(regisRoute, async (c) => {
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = UserRegisRequestSchema.parse(data);
  const { email, phoneNumber, password, type } = zodParseResult;

  const existingAccount = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { phoneNumber },
      ],
    },
  });

  if (existingAccount) {
    console.error("Invalid email");
    return c.json(
      {
        success: false,
        message: "Invalid credentials",
        error: "Invalid email or phone number",
      },
      401,
    );
  }

  const hashedPassword = await hash(password, 10);

  try {
    const [newUser, code] = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          phoneNumber,
          password: hashedPassword,
          role: (type === "mahasiswa" ? "Mahasiswa" : "OrangTuaAsuh") as "Mahasiswa" | "OrangTuaAsuh",
        },
      });

      const code = generateOTP();

      await tx.oTP.create({
        data: {
          userId: newUser.id,
          code,
          expiredAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
        },
      });

      return [newUser, code];
    });

    const message =
      `Berikut adalah kode OTP Anda\n` +
      `${code}\n` +
      `Gunakan kode OTP ini untuk melakukan registrasi akun Anda. ` +
      `Kode OTP ini akan kadaluwarsa dalam 15 menit.\n\n` +
      `Jika Anda merasa tidak melakukan permintaan registrasi akun, ` +
      `silakan abaikan pesan ini atau hubungi administrator.\n\n` +
      `Terima kasih.`;

    try {
      await sendWhatsApp({
        to: phoneNumber,
        message,
        clientReference: `otp-register-${newUser.id}`,
        idempotencyKey: `otp-register-${newUser.id}-${code}`,
      });
    } catch (err) {
      console.error(`[whatsapp] Failed to send WA to ${phoneNumber}:`, err);
    }

    const accessToken = await sign(
      {
        id: newUser.id,
        name: null,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        type: roleToJwtType(newUser.role),
        provider: newUser.provider,
        oid: newUser.oid,
        createdAt: newUser.createdAt,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      env.JWT_SECRET,
    );

    setCookie(c, "ota-ku.access-cookie", accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return c.json(
      {
        success: true,
        message: "User registered successfully",
        body: {
          token: accessToken,
          id: newUser.id,
          email: newUser.email,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

authRouter.openapi(oauthRoute, async (c) => {
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = UserOAuthLoginRequestSchema.parse(data);
  const { code } = zodParseResult;

  const res = await fetch(
    "https://login.microsoftonline.com/db6e1183-4c65-405c-82ce-7cd53fa6e9dc/oauth2/v2.0/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        scope: "https://vault.azure.net/.default openid offline_access",
        client_id: env.AZURE_CLIENT_ID,
        client_secret: env.AZURE_CLIENT_SECRET,
        redirect_uri: `${env.VITE_PUBLIC_URL}/integrations/azure-key-vault/oauth2/callback`,
      }),
    },
  );
  if (!res.ok) {
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: {},
      },
      500,
    );
  }
  const resData = await res.json();
  const azureToken = resData.access_token as string;
  const { payload } = decode(azureToken);
  const email = payload.upn as string;
  const name = payload.name as string;
  const oid = payload.oid as string;
  const nim = email.split("@")[0];

  try {
    await prisma.$transaction(async (tx) => {
      let accountData;

      const existingAccount = await tx.user.findFirst({
        where: { email },
      });

      const randomPassword = crypto
        .getRandomValues(new Uint16Array(16))
        .join("");

      if (existingAccount) {
        // Account exists, update only if provider is azure
        if (existingAccount.provider === "azure") {
          accountData = await tx.user.update({
            where: { id: existingAccount.id },
            data: { updatedAt: new Date(Date.now()) },
          });
        } else {
          // Provider is not azure, don't update password
          accountData = existingAccount;
        }
      } else {
        const existingOid = await tx.user.findFirst({
          where: { oid },
        });

        if (existingOid) {
          // Update the existing account with the new email, nim must be nim jurusan
          accountData = await tx.user.update({
            where: { id: existingOid!.id },
            data: {
              email,
              updatedAt: new Date(Date.now()),
            },
          });

          // Update the mahasiswa details for the existing account
          await tx.mahasiswaProfile.update({
            where: { userId: accountData.id },
            data: {
              name,
              nim,
              major: getNimJurusanCodeMap()[nim.slice(0, 3)],
              faculty:
                getNimFakultasCodeMap()[
                  getNimFakultasFromNimJurusanMap()[nim.slice(0, 3)]
                ],
            },
          });
          return;
        }

        // Account doesn't exist, create new one
        accountData = await tx.user.create({
          data: {
            email,
            password: await hash(randomPassword, 10),
            role: "Mahasiswa",
            phoneNumber: null,
            provider: "azure",
            verificationStatus: "verified",
            oid,
          },
        });

        // Insert the mahasiswa details for new account
        await tx.mahasiswaProfile.create({
          data: {
            userId: accountData.id,
            name,
            nim,
            major: getNimJurusanCodeMap()[nim.slice(0, 3)] || "TPB",
            faculty:
              getNimFakultasCodeMap()[
                getNimFakultasFromNimJurusanMap()[nim.slice(0, 3)]
              ] || getNimFakultasCodeMap()[nim.slice(0, 3)],
          },
        });
      }

      const accessToken = await sign(
        {
          id: accountData.id,
          name,
          email: accountData.email,
          phoneNumber: accountData.phoneNumber || null,
          type: roleToJwtType(accountData.role),
          provider: accountData.provider,
          oid: accountData.oid,
          createdAt: accountData.createdAt,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        },
        env.JWT_SECRET,
      );

      setCookie(c, "ota-ku.access-cookie", accessToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    });

    return c.json(
      {
        success: true,
        message: "Login successful",
        body: {
          token: azureToken,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

authProtectedRouter.openapi(verifRoute, async (c) => {
  const user = c.var.user;
  // TODO: Update user session
  return c.json(
    {
      success: true,
      message: "User is authenticated",
      body: user,
    },
    200,
  );
});

authProtectedRouter.openapi(logoutRoute, async (c) => {
  deleteCookie(c, "ota-ku.access-cookie");
  return c.json(
    {
      success: true,
      message: "Logout successful",
    },
    200,
  );
});

authProtectedRouter.openapi(otpRoute, async (c) => {
  const user = c.var.user;
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = OTPVerificationRequestSchema.parse(data);
  const { pin } = zodParseResult;

  const userAccount = await prisma.user.findFirst({
    where: { id: user.id },
  });

  if (userAccount?.verificationStatus === "verified") {
    return c.json(
      {
        success: false,
        message: "Account is already verified",
        error: "Account is already verified",
      },
      401,
    );
  }

  const currentDateTime = new Date(Date.now());

  const otp = await prisma.oTP.findFirst({
    where: {
      userId: user.id,
      code: pin,
      expiredAt: { gte: currentDateTime },
    },
  });

  if (!otp) {
    return c.json(
      {
        success: false,
        message: "No valid OTP not found",
        error: "No valid OTP not found",
      },
      404,
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { verificationStatus: "verified" },
      });

      if (updatedUser.role === "Mahasiswa") {
        const nim = updatedUser.email.split("@")[0];
        await tx.mahasiswaProfile.upsert({
          where: { userId: user.id },
          update: {
            nim,
            major: getNimJurusanCodeMap()[nim.slice(0, 3)],
            faculty:
              getNimFakultasCodeMap()[
                getNimFakultasFromNimJurusanMap()[nim.slice(0, 3)]
              ],
          },
          create: {
            userId: user.id,
            nim,
            major: getNimJurusanCodeMap()[nim.slice(0, 3)],
            faculty:
              getNimFakultasCodeMap()[
                getNimFakultasFromNimJurusanMap()[nim.slice(0, 3)]
              ],
          },
        });
      }
    });

    const accessToken = await sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        type: user.type,
        provider: user.provider,
        oid: user.oid,
        createdAt: user.createdAt,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
      env.JWT_SECRET,
    );

    setCookie(c, "ota-ku.access-cookie", accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return c.json(
      {
        success: true,
        message: "OTP found",
        body: {
          token: accessToken,
        },
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});

authRouter.openapi(forgotPasswordRoute, async (c) => {
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = ForgotPasswordSchema.parse(data);
  const { email } = zodParseResult;

  try {
    const foundAccount = await prisma.user.findFirst({
      where: {
        email,
        provider: "credentials",
      },
    });

    if (!foundAccount) {
      console.error("Invalid email");
      return c.json(
        {
          success: true,
          message:
            "Kata sandi sementara akan dikirim ke email Anda jika akun terdaftar",
        },
        200,
      );
    }

    const password = generateSecurePassword();

    await prisma.temporaryPassword.create({
      data: {
        userId: foundAccount.id,
        password: await hash(password, 10),
        expiredAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
      },
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      port: 465,
      auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASSWORD,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP Server verification failed:", error);
      } else {
        console.log("SMTP Server is ready:", success);
      }
    });

    await transporter
      .sendMail({
        from: env.EMAIL_FROM,
        to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : foundAccount.email,
        subject: "Kata Sandi Sementara Bantuan Orang Tua Asuh",
        html: forgotPasswordEmail(foundAccount.email, password),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    return c.json(
      {
        success: true,
        message:
          "Kata sandi sementara akan dikirim ke email Anda jika akun terdaftar",
      },
      200,
    );
  } catch (error) {
    console.error(error);
    return c.json(
      {
        success: false,
        message: "Internal server error",
        error: error,
      },
      500,
    );
  }
});
