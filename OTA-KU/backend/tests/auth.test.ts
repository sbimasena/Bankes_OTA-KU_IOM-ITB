import { eq } from "drizzle-orm";
import { describe, expect, test, vi } from "vitest";

import app from "../src/app.js";
import { db } from "../src/db/drizzle.js";
import { accountTable } from "../src/db/schema.js";
import { otpDatas, testRegisterUsers, testUsers } from "./constants/user.js";
import { createTestRequest } from "./test-utils.js";

describe("Login", () => {
  test("POST 200 /api/auth/login", async () => {
    const params = new URLSearchParams();
    params.append("identifier", testUsers[0].email);
    params.append("password", testUsers[0].password);

    const res = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe("Login successful");
  });

  test("POST 400 /api/auth/login", async () => {
    const params = new URLSearchParams();
    params.append("identifier", "");
    params.append("password", "");

    const res = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors.fieldErrors.password[0]).toBe(
      "Password minimal 8 karakter",
    );
    expect(body.errors.fieldErrors.identifier[0]).toBe(
      "Format email tidak valid",
    );
  });

  test("POST 401 (Wrong Email) /api/auth/login", async () => {
    const params = new URLSearchParams();
    params.append("identifier", "user4@test.com");
    params.append("password", "Testuser123!");

    const res = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Invalid credentials");
  });

  test("POST 401 (Wrong Password) /api/auth/login", async () => {
    const params = new URLSearchParams();
    params.append("identifier", "user1@test.com");
    params.append("password", "Testuser123!4");

    const res = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Invalid credentials");
  });

  test("POST 500 /api/auth/login (Database Error)", async () => {
    vi.spyOn(db, "select").mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });

    const params = new URLSearchParams();
    params.append("identifier", testUsers[0].email);
    params.append("password", testUsers[0].password);

    const res = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Internal server error");
  });
});

describe("Register", () => {
  test("POST 200 /api/auth/register", async () => {
    const params = new URLSearchParams();
    params.append("type", testRegisterUsers[0].type);
    params.append("email", testRegisterUsers[0].email);
    params.append("phoneNumber", testRegisterUsers[0].phoneNumber);
    params.append("password", testRegisterUsers[0].password);
    params.append("confirmPassword", testRegisterUsers[0].confirmPassword);

    const res = await app.request(
      createTestRequest("/api/auth/register", {
        method: "POST",
        body: params,
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe("User registered successfully");
  });

  test("POST 400 (Invalid email for mahasiswa) /api/auth/register", async () => {
    const params = new URLSearchParams();
    params.append("type", testRegisterUsers[1].type);
    params.append("email", testRegisterUsers[1].email);
    params.append("phoneNumber", testRegisterUsers[1].phoneNumber);
    params.append("password", testRegisterUsers[1].password);
    params.append("confirmPassword", testRegisterUsers[1].confirmPassword);

    const res = await app.request(
      createTestRequest("/api/auth/register", {
        method: "POST",
        body: params,
      }),
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors.fieldErrors.email[0]).toBe(
      "Email harus sesuai format NIM@mahasiswa.itb.ac.id",
    );
  });

  test("POST 400 (Password mismatch) /api/auth/register", async () => {
    const params = new URLSearchParams();
    params.append("type", testRegisterUsers[0].type);
    params.append("email", testRegisterUsers[0].email);
    params.append("phoneNumber", testRegisterUsers[0].phoneNumber);
    params.append("password", testRegisterUsers[0].password);
    params.append("confirmPassword", "Testuser123!4");

    const res = await app.request(
      createTestRequest("/api/auth/register", {
        method: "POST",
        body: params,
      }),
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors.fieldErrors.confirmPassword[0]).toBe(
      "Konfirmasi password gagal",
    );
  });

  test("POST 500 /api/auth/register (Database Error)", async () => {
    vi.spyOn(db, "transaction").mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });

    const params = new URLSearchParams();
    params.append("type", testRegisterUsers[2].type);
    params.append("email", testRegisterUsers[2].email);
    params.append("phoneNumber", testRegisterUsers[2].phoneNumber);
    params.append("password", testRegisterUsers[2].password);
    params.append("confirmPassword", testRegisterUsers[2].confirmPassword);

    const res = await app.request(
      createTestRequest("/api/auth/register", {
        method: "POST",
        body: params,
      }),
    );

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Internal server error");
  });
});

describe("Verify", () => {
  test("GET 200 /api/auth/verify", async () => {
    const params = new URLSearchParams();
    params.append("identifier", testUsers[0].email);
    params.append("password", testUsers[0].password);

    const loginRes = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    const loginBody = await loginRes.json();
    expect(loginBody.success).toBe(true);
    expect(loginBody.message).toBe("Login successful");

    const token = loginBody.body.token;

    const verifyRes = await app.request(
      createTestRequest("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    expect(verifyRes.status).toBe(200);
    const verifyBody = await verifyRes.json();
    expect(verifyBody.success).toBe(true);
    expect(verifyBody.message).toBe("User is authenticated");
  });

  test("GET 401 /api/auth/verify", async () => {
    const verifyRes = await app.request(createTestRequest("/api/auth/verify"));

    expect(verifyRes.status).toBe(401);
    const verifyBody = await verifyRes.text();
    expect(verifyBody).toBe("Unauthorized");
  });
});

describe("Logout", () => {
  test("POST 200 /api/auth/logout", async () => {
    const params = new URLSearchParams();
    params.append("identifier", testUsers[0].email);
    params.append("password", testUsers[0].password);

    const loginRes = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    const loginBody = await loginRes.json();
    expect(loginBody.success).toBe(true);
    expect(loginBody.message).toBe("Login successful");

    const token = loginBody.body.token;

    const logoutRes = await app.request(
      createTestRequest("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );

    expect(logoutRes.status).toBe(200);
    const logoutBody = await logoutRes.json();
    expect(logoutBody.success).toBe(true);
    expect(logoutBody.message).toBe("Logout successful");
  });
});

describe("OTP", () => {
  test("POST 200 /api/auth/otp", async () => {
    // Login first
    const params = new URLSearchParams();
    params.append("identifier", testUsers[3].email);
    params.append("password", testUsers[3].password);

    const loginRes = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    const loginBody = await loginRes.json();
    expect(loginBody.success).toBe(true);
    expect(loginBody.message).toBe("Login successful");

    const token = loginBody.body.token;

    // Request OTP
    const otpParams = new URLSearchParams();
    otpParams.append("pin", otpDatas[3].code);

    const otpRes = await app.request(
      createTestRequest("/api/auth/otp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: otpParams,
      }),
    );

    expect(otpRes.status).toBe(200);
    const otpBody = await otpRes.json();
    expect(otpBody.success).toBe(true);
    expect(otpBody.message).toBe("OTP found");

    await db
      .update(accountTable)
      .set({ status: "unverified" })
      .where(eq(accountTable.email, testUsers[3].email));
  });

  test("POST 400 /api/auth/otp", async () => {
    // Login first
    const params = new URLSearchParams();
    params.append("identifier", testUsers[0].email);
    params.append("password", testUsers[0].password);

    const loginRes = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    const loginBody = await loginRes.json();
    expect(loginBody.success).toBe(true);
    expect(loginBody.message).toBe("Login successful");

    const token = loginBody.body.token;

    // Request OTP
    const otpParams = new URLSearchParams();
    otpParams.append("pin", "1234567");

    const otpRes = await app.request(
      createTestRequest("/api/auth/otp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: otpParams,
      }),
    );

    expect(otpRes.status).toBe(400);
    const otpBody = await otpRes.json();
    expect(otpBody.errors.fieldErrors.pin[0]).toBe(
      "Kode OTP harus terdiri dari 6 karakter.",
    );
  });

  test("POST 401 /api/auth/otp", async () => {
    // Login first
    const params = new URLSearchParams();
    params.append("identifier", testUsers[1].email);
    params.append("password", testUsers[1].password);

    const loginRes = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    const loginBody = await loginRes.json();
    expect(loginBody.success).toBe(true);
    expect(loginBody.message).toBe("Login successful");

    const token = loginBody.body.token;

    // Request OTP
    const otpParams = new URLSearchParams();
    otpParams.append("pin", otpDatas[1].code);

    const otpRes = await app.request(
      createTestRequest("/api/auth/otp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: otpParams,
      }),
    );

    expect(otpRes.status).toBe(401);
    const otpBody = await otpRes.json();
    expect(otpBody.success).toBe(false);
    expect(otpBody.message).toBe("Account is already verified");
  });

  test("POST 404 /api/auth/otp", async () => {
    // Login first
    const params = new URLSearchParams();
    params.append("identifier", testUsers[2].email);
    params.append("password", testUsers[2].password);

    const loginRes = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    const loginBody = await loginRes.json();
    expect(loginBody.success).toBe(true);
    expect(loginBody.message).toBe("Login successful");

    const token = loginBody.body.token;

    // Request OTP
    const otpParams = new URLSearchParams();
    otpParams.append("pin", otpDatas[2].code);

    const otpRes = await app.request(
      createTestRequest("/api/auth/otp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: otpParams,
      }),
    );

    expect(otpRes.status).toBe(404);
    const otpBody = await otpRes.json();
    expect(otpBody.success).toBe(false);
    expect(otpBody.message).toBe("No valid OTP not found");
  });

  test("POST 500 /api/auth/otp (Database Error)", async () => {
    vi.spyOn(db, "transaction").mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });

    // Login first
    const params = new URLSearchParams();
    params.append("identifier", testUsers[0].email);
    params.append("password", testUsers[0].password);

    const loginRes = await app.request(
      createTestRequest("/api/auth/login", {
        method: "POST",
        body: params,
      }),
    );

    const loginBody = await loginRes.json();
    expect(loginBody.success).toBe(true);
    expect(loginBody.message).toBe("Login successful");

    const token = loginBody.body.token;

    // Request OTP
    const otpParams = new URLSearchParams();
    otpParams.append("pin", otpDatas[0].code);

    const otpRes = await app.request(
      createTestRequest("/api/auth/otp", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: otpParams,
      }),
    );

    expect(otpRes.status).toBe(500);
    const otpBody = await otpRes.json();
    expect(otpBody.success).toBe(false);
    expect(otpBody.message).toBe("Internal server error");
  });
});
