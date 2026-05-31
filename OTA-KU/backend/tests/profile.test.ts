import FormData from "form-data";
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, test, vi } from "vitest";

import app from "../src/app.js";
import { db } from "../src/db/drizzle.js";
import cloudinary from "../src/lib/cloudinary.js";
import { testUsers } from "./constants/user.js";
import { createTestRequest } from "./test-utils.js";

describe("Pendaftaran Mahasiswa", () => {
  test("POST 200 /api/profile/mahasiswa", async () => {
    const params = new URLSearchParams();
    params.append("identifier", testUsers[4].email);
    params.append("password", testUsers[4].password);

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

    const filePath = join(__dirname, "./constants/sample.pdf");
    const fileData = readFileSync(filePath);

    const formData = new FormData();
    formData.append("name", "John Doe");
    formData.append("nim", "13599008");
    formData.append("phoneNumber", testUsers[4].phoneNumber);
    formData.append("major", "Teknik Informatika");
    formData.append("faculty", "STEI-R");
    formData.append("cityOfOrigin", "Bandung");
    formData.append("highschoolAlumni", "SMA Negeri 1 Bandung");
    formData.append("description", "Test description");
    formData.append("religion", "Islam");
    formData.append("gender", "M");
    formData.append("gpa", 3.5);

    const fileFields = [
      "file",
      "kk",
      "ktm",
      "waliRecommendationLetter",
      "transcript",
      "salaryReport",
      "pbb",
      "electricityBill",
      "ditmawaRecommendationLetter",
    ];

    for (const field of fileFields) {
      formData.append(field, fileData, {
        filename: `${field}.pdf`,
        contentType: "application/pdf",
      });
    }

    const headers = formData.getHeaders();
    headers["Authorization"] = `Bearer ${token}`;

    vi.spyOn(cloudinary.uploader, "upload").mockResolvedValue({
      public_id: "sample",
      version: 1,
      signature: "sample_signature",
      width: 100,
      height: 100,
      format: "pdf",
      resource_type: "raw",
      created_at: new Date().toISOString(),
      tags: [],
      bytes: 12345,
      type: "upload",
      etag: "sample_etag",
      placeholder: false,
      url: "http://res.cloudinary.com/sample.pdf",
      secure_url: "https://cloudinary.com/sample.pdf",
      access_mode: "public",
      original_filename: "sample",
      pages: 1,
      moderation: [],
      access_control: [],
      context: {},
      metadata: {},
    });

    const res = await app.request(
      createTestRequest("/api/profile/mahasiswa", {
        method: "POST",
        headers,
        body: formData.getBuffer(),
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe("Berhasil mendaftar.");
    expect(body.body.name).toBe("John Doe");
    expect(body.body.nim).toBe("13599008");
    expect(body.body.file).toBe("https://cloudinary.com/sample.pdf");
  });

  test("POST 400 /api/profile/mahasiswa", async () => {
    const params = new URLSearchParams();
    params.append("identifier", testUsers[4].email);
    params.append("password", testUsers[4].password);

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

    const filePath = join(__dirname, "./constants/sample.pdf");
    const fileData = readFileSync(filePath);

    const formData = new FormData();
    formData.append("name", "John Doe");
    formData.append("nim", "13599008");
    formData.append("description", "Test description");
    formData.append("file", fileData, {
      filename: "sample.pdf",
      contentType: "application/pdf",
    });

    const headers = formData.getHeaders();
    headers["Authorization"] = `Bearer ${token}`;

    const res = await app.request(
      createTestRequest("/api/profile/mahasiswa", {
        method: "POST",
        headers: headers,
        body: formData.getBuffer(),
      }),
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors.fieldErrors.phoneNumber[0]).toBe(
      "Nomor telepon harus diisi",
    );
  });

  test("POST 403 /api/profile/mahasiswa", async () => {
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

    const filePath = join(__dirname, "./constants/sample.pdf");
    const fileData = readFileSync(filePath);

    const formData = new FormData();
    formData.append("name", "John Doe");
    formData.append("nim", "13599008");
    formData.append("phoneNumber", testUsers[0].phoneNumber);
    formData.append("major", "Teknik Informatika");
    formData.append("faculty", "STEI-R");
    formData.append("cityOfOrigin", "Bandung");
    formData.append("highschoolAlumni", "SMA Negeri 1 Bandung");
    formData.append("description", "Test description");
    formData.append("religion", "Islam");
    formData.append("gender", "M");
    formData.append("gpa", 3.5);

    const fileFields = [
      "file",
      "kk",
      "ktm",
      "waliRecommendationLetter",
      "transcript",
      "salaryReport",
      "pbb",
      "electricityBill",
      "ditmawaRecommendationLetter",
    ];

    for (const field of fileFields) {
      formData.append(field, fileData, {
        filename: `${field}.pdf`,
        contentType: "application/pdf",
      });
    }

    const headers = formData.getHeaders();
    headers["Authorization"] = `Bearer ${token}`;

    const res = await app.request(
      createTestRequest("/api/profile/mahasiswa", {
        method: "POST",
        headers,
        body: formData.getBuffer(),
      }),
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Akun anda belum diverifikasi.");
  });

  test("POST 500 /api/profile/mahasiswa (Database Error)", async () => {
    vi.spyOn(db, "transaction").mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });

    const params = new URLSearchParams();
    params.append("identifier", testUsers[4].email);
    params.append("password", testUsers[4].password);

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

    const filePath = join(__dirname, "./constants/sample.pdf");
    const fileData = readFileSync(filePath);

    const formData = new FormData();
    formData.append("name", "John Doe");
    formData.append("nim", "13599006");
    formData.append("phoneNumber", testUsers[4].phoneNumber);
    formData.append("major", "Teknik Informatika");
    formData.append("faculty", "STEI-R");
    formData.append("cityOfOrigin", "Bandung");
    formData.append("highschoolAlumni", "SMA Negeri 1 Bandung");
    formData.append("description", "Test description");
    formData.append("religion", "Islam");
    formData.append("gender", "M");
    formData.append("gpa", 3.5);

    const fileFields = [
      "file",
      "kk",
      "ktm",
      "waliRecommendationLetter",
      "transcript",
      "salaryReport",
      "pbb",
      "electricityBill",
      "ditmawaRecommendationLetter",
    ];

    for (const field of fileFields) {
      formData.append(field, fileData, {
        filename: `${field}.pdf`,
        contentType: "application/pdf",
      });
    }

    const headers = formData.getHeaders();
    headers["Authorization"] = `Bearer ${token}`;

    vi.spyOn(cloudinary.uploader, "upload").mockResolvedValue({
      public_id: "sample",
      version: 1,
      signature: "sample_signature",
      width: 100,
      height: 100,
      format: "pdf",
      resource_type: "raw",
      created_at: new Date().toISOString(),
      tags: [],
      bytes: 12345,
      type: "upload",
      etag: "sample_etag",
      placeholder: false,
      url: "http://res.cloudinary.com/sample.pdf",
      secure_url: "https://cloudinary.com/sample.pdf",
      access_mode: "public",
      original_filename: "sample",
      pages: 1,
      moderation: [],
      access_control: [],
      context: {},
      metadata: {},
    });

    const res = await app.request(
      createTestRequest("/api/profile/mahasiswa", {
        method: "POST",
        headers,
        body: formData.getBuffer(),
      }),
    );

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Internal server error");
  });
});

describe("Pendaftaran Orang Tua Asuh", () => {
  test("POST 200 /api/profile/orang-tua", async () => {
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

    const formData = new FormData();
    formData.append("name", "John Doe");
    formData.append("address", "Test address");
    formData.append("criteria", "Test criteria");
    formData.append("funds", 300000);
    formData.append("job", "Test job");
    formData.append("linkage", "otm");
    formData.append("maxCapacity", 5);
    formData.append("maxSemester", 8);
    formData.append("startDate", new Date().toISOString());
    formData.append("transferDate", 25);
    formData.append("isDetailVisible", "true");
    formData.append("allowAdminSelection", "true");

    const headers = formData.getHeaders();
    headers["Authorization"] = `Bearer ${token}`;

    const res = await app.request(
      createTestRequest("/api/profile/orang-tua", {
        method: "POST",
        headers: headers,
        body: formData.getBuffer(),
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toBe("Berhasil mendaftar.");
    expect(body.body.name).toBe("John Doe");
  });

  test("POST 400 /api/profile/orang-tua", async () => {
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

    const formData = new FormData();
    formData.append("name", "John Doe");
    formData.append("address", "Test address");
    formData.append("criteria", "Test criteria");
    formData.append("funds", 300000);
    formData.append("job", "Test job");
    formData.append("linkage", "otm");
    formData.append("maxCapacity", 5);
    formData.append("maxSemester", 8);
    formData.append("startDate", new Date().toISOString());

    const headers = formData.getHeaders();
    headers["Authorization"] = `Bearer ${token}`;

    const res = await app.request(
      createTestRequest("/api/profile/orang-tua", {
        method: "POST",
        headers: headers,
        body: formData.getBuffer(),
      }),
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.errors.fieldErrors.transferDate[0]).toBe(
      "Tanggal transfer harus berupa angka",
    );
  });

  test("POST 403 /api/profile/orang-tua", async () => {
    const params = new URLSearchParams();
    params.append("identifier", testUsers[5].email);
    params.append("password", testUsers[5].password);

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

    const formData = new FormData();
    formData.append("name", "John Doe");
    formData.append("address", "Test address");
    formData.append("criteria", "Test criteria");
    formData.append("funds", 300000);
    formData.append("job", "Test job");
    formData.append("linkage", "otm");
    formData.append("maxCapacity", 5);
    formData.append("maxSemester", 8);
    formData.append("startDate", new Date().toISOString());
    formData.append("transferDate", 25);
    formData.append("allowAdminSelection", "true");

    const headers = formData.getHeaders();
    headers["Authorization"] = `Bearer ${token}`;

    const res = await app.request(
      createTestRequest("/api/profile/orang-tua", {
        method: "POST",
        headers: headers,
        body: formData.getBuffer(),
      }),
    );

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Akun anda belum diverifikasi.");
  });

  test("POST 500 /api/profile/orang-tua (Database Error)", async () => {
    vi.spyOn(db, "insert").mockImplementationOnce(() => {
      throw new Error("Database connection failed");
    });

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

    // Prepare form data
    const formData = new FormData();
    formData.append("name", "John Doe");
    formData.append("address", "Test address");
    formData.append("criteria", "Test criteria");
    formData.append("funds", 300000);
    formData.append("job", "Test job");
    formData.append("linkage", "otm");
    formData.append("maxCapacity", 5);
    formData.append("maxSemester", 8);
    formData.append("startDate", new Date().toISOString());
    formData.append("transferDate", 25);
    formData.append("allowAdminSelection", "true");

    const headers = formData.getHeaders();
    headers["Authorization"] = `Bearer ${token}`;

    // Send request
    const res = await app.request(
      createTestRequest("/api/profile/orang-tua", {
        method: "POST",
        headers: headers,
        body: formData.getBuffer(),
      }),
    );

    // Check response
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toBe("Internal server error");
  });
});
