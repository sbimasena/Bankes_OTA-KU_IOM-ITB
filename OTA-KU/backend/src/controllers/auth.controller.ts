import { compare, hash } from "bcrypt";
import { and, desc, eq, gte, or } from "drizzle-orm";
import { deleteCookie, setCookie } from "hono/cookie";
import { decode, sign } from "hono/jwt";
import nodemailer from "nodemailer";

import { env } from "../config/env.config.js";
import { db } from "../db/drizzle.js";
import {
  accountAdminDetailTable,
  accountMahasiswaDetailTable,
  accountOtaDetailTable,
  accountTable,
  otpTable,
  temporaryPasswordTable,
} from "../db/schema.js";
import { kodeOTPEmail } from "../lib/email/kode-otp.js";
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

authRouter.openapi(loginRoute, async (c) => {
  const body = await c.req.formData();
  const data = Object.fromEntries(body.entries());

  const zodParseResult = UserLoginRequestSchema.parse(data);
  const { identifier, password } = zodParseResult;

  try {
    const account = await db
      .select()
      .from(accountTable)
      .where(
        or(
          eq(accountTable.email, identifier),
          eq(accountTable.phoneNumber, identifier),
        ),
      )
      .limit(1);

    if (!account || account.length === 0) {
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

    const foundAccount = account[0];

    const currentDateTime = new Date(Date.now());

    const temporaryPassword = await db
      .select()
      .from(temporaryPasswordTable)
      .where(
        and(
          eq(temporaryPasswordTable.accountId, foundAccount.id),
          gte(temporaryPasswordTable.expiredAt, currentDateTime),
          eq(temporaryPasswordTable.used, false),
        ),
      )
      .orderBy(desc(temporaryPasswordTable.expiredAt))
      .limit(1);

    if (
      foundAccount.provider === "credentials" &&
      temporaryPassword &&
      temporaryPassword.length > 0
    ) {
      const tempPass = temporaryPassword[0].password;
      const isTempPassValid = await compare(password, tempPass);

      if (isTempPassValid) {
        // Mark the temporary password as used
        await db
          .update(temporaryPasswordTable)
          .set({ used: true })
          .where(
            and(
              eq(
                temporaryPasswordTable.accountId,
                temporaryPassword[0].accountId,
              ),
              eq(temporaryPasswordTable.password, tempPass),
            ),
          );
      }
    } else {
      // Check the password hash
      const isPasswordValid = await compare(password, foundAccount.password);

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

    const accountId = account[0].id;

    let name = null;

    if (account[0].type === "mahasiswa") {
      const mahasiswaDetail = await db
        .select({ name: accountMahasiswaDetailTable.name })
        .from(accountMahasiswaDetailTable)
        .where(eq(accountMahasiswaDetailTable.accountId, accountId))
        .limit(1);

      if (mahasiswaDetail && mahasiswaDetail.length > 0) {
        name = mahasiswaDetail[0].name;
      }
    } else if (account[0].type === "ota") {
      const otaDetail = await db
        .select({ name: accountOtaDetailTable.name })
        .from(accountOtaDetailTable)
        .where(eq(accountOtaDetailTable.accountId, accountId))
        .limit(1);

      if (otaDetail && otaDetail.length > 0) {
        name = otaDetail[0].name;
      }
    } else {
      const adminDetail = await db
        .select({
          name: accountAdminDetailTable.name,
        })
        .from(accountAdminDetailTable)
        .where(eq(accountAdminDetailTable.accountId, accountId))
        .limit(1);

      if (adminDetail && adminDetail.length > 0) {
        name = adminDetail[0].name;
      }
    }

    const accessToken = await sign(
      {
        id: account[0].id,
        name,
        email: account[0].email,
        phoneNumber: account[0].phoneNumber,
        type: account[0].type,
        provider: account[0].provider,
        oid: account[0].oid,
        createdAt: account[0].createdAt,
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

  const account = await db
    .select()
    .from(accountTable)
    .where(
      or(
        eq(accountTable.email, email),
        eq(accountTable.phoneNumber, phoneNumber),
      ),
    )
    .limit(1);

  if (account.length > 0) {
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
    const [newUser, code] = await db.transaction(async (tx) => {
      const newUser = await tx
        .insert(accountTable)
        .values({
          email,
          phoneNumber,
          password: hashedPassword,
          type,
        })
        .returning();

      const code = generateOTP();

      await tx.insert(otpTable).values({
        accountId: newUser[0].id,
        code: code,
        expiredAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
      });

      return [newUser, code];
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
        to: env.NODE_ENV !== "production" ? env.TEST_EMAIL : newUser[0].email,
        subject: "Token OTP Bantuan Orang Tua Asuh",
        html: kodeOTPEmail(newUser[0].email, code),
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });

    const accessToken = await sign(
      {
        id: newUser[0].id,
        name: null,
        email: newUser[0].email,
        phoneNumber: newUser[0].phoneNumber,
        type: newUser[0].type,
        provider: newUser[0].provider,
        oid: newUser[0].oid,
        createdAt: newUser[0].createdAt,
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
          id: newUser[0].id,
          email: newUser[0].email,
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
    await db.transaction(async (tx) => {
      let accountData;

      const existingAccount = await tx
        .select()
        .from(accountTable)
        .where(eq(accountTable.email, email))
        .limit(1);

      const randomPassword = crypto
        .getRandomValues(new Uint16Array(16))
        .join("");

      if (existingAccount && existingAccount.length > 0) {
        // Account exists, update only if provider is azure
        if (existingAccount[0].provider === "azure") {
          accountData = await tx
            .update(accountTable)
            .set({
              updatedAt: new Date(Date.now()),
            })
            .where(eq(accountTable.id, existingAccount[0].id))
            .returning();
          accountData = accountData[0];
        } else {
          // Provider is not azure, don't update password
          accountData = existingAccount[0];
        }
      } else {
        const existingOid = await tx
          .select()
          .from(accountTable)
          .where(eq(accountTable.oid, oid))
          .limit(1);

        if (existingOid && existingOid.length > 0) {
          // Update the existing account with the new email and password, nim must be nim jurusan
          const updatedAccount = await tx
            .update(accountTable)
            .set({
              email,
              updatedAt: new Date(Date.now()),
            })
            .where(eq(accountTable.oid, oid))
            .returning();

          accountData = updatedAccount[0];

          // Update the mahasiswa details for the existing account
          await tx
            .update(accountMahasiswaDetailTable)
            .set({
              name,
              nim,
              major: getNimJurusanCodeMap()[nim.slice(0, 3)],
              faculty:
                getNimFakultasCodeMap()[
                  getNimFakultasFromNimJurusanMap()[nim.slice(0, 3)]
                ],
            })
            .where(eq(accountMahasiswaDetailTable.accountId, accountData.id));
          return;
        }

        // Account doesn't exist, create new one
        const newAccount = await tx
          .insert(accountTable)
          .values({
            email,
            password: await hash(randomPassword, 10),
            type: "mahasiswa",
            phoneNumber: null,
            provider: "azure",
            status: "verified",
            oid,
          })
          .returning();

        accountData = newAccount[0];

        // Insert the mahasiswa details for new account
        await tx.insert(accountMahasiswaDetailTable).values({
          accountId: accountData.id,
          name,
          nim,
          major: getNimJurusanCodeMap()[nim.slice(0, 3)] || "TPB",
          faculty:
            getNimFakultasCodeMap()[
              getNimFakultasFromNimJurusanMap()[nim.slice(0, 3)]
            ] || getNimFakultasCodeMap()[nim.slice(0, 3)],
        });
      }

      const accessToken = await sign(
        {
          id: accountData.id,
          name,
          email: accountData.email,
          phoneNumber: accountData.phoneNumber || null,
          type: accountData.type,
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

  const userAccount = await db
    .select()
    .from(accountTable)
    .where(eq(accountTable.id, user.id))
    .limit(1);

  if (userAccount[0].status === "verified") {
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

  const otp = await db
    .select()
    .from(otpTable)
    .where(
      and(
        eq(otpTable.accountId, user.id),
        eq(otpTable.code, pin),
        gte(otpTable.expiredAt, currentDateTime),
      ),
    )
    .limit(1);

  if (!otp || otp.length === 0) {
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
    await db.transaction(async (tx) => {
      const data = await tx
        .update(accountTable)
        .set({
          status: "verified",
        })
        .where(eq(accountTable.id, user.id))
        .returning();

      const type = data[0].type;

      if (type === "mahasiswa") {
        const nim = data[0].email.split("@")[0];
        await tx
          .update(accountMahasiswaDetailTable)
          .set({
            nim: nim,
            major: getNimJurusanCodeMap()[nim.slice(0, 3)],
            faculty:
              getNimFakultasCodeMap()[
                getNimFakultasFromNimJurusanMap()[nim.slice(0, 3)]
              ],
          })
          .where(eq(accountMahasiswaDetailTable.accountId, user.id));
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
    const account = await db
      .select()
      .from(accountTable)
      .where(
        and(
          eq(accountTable.email, email),
          eq(accountTable.provider, "credentials"),
        ),
      )
      .limit(1);

    if (!account || account.length === 0) {
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

    const foundAccount = account[0];

    const password = generateSecurePassword();

    await db.insert(temporaryPasswordTable).values({
      accountId: foundAccount.id,
      password: await hash(password, 10),
      expiredAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
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
