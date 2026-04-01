export const testUsers = [
  // Default login user
  {
    id: "da7a126a-4c35-43e3-b2fd-3531c26c88ad",
    email: "13599006@mahasiswa.itb.ac.id",
    phoneNumber: "6281234567890",
    password: "Testuser123!",
    type: "mahasiswa" as const,
    provider: "credentials" as const,
    status: "unverified" as const,
  },
  {
    id: "cd22db2d-fe89-45e2-b6fe-76fc23bbd8d1",
    email: "user2@test.com",
    phoneNumber: "6281234567891",
    password: "Testuser123!",
    type: "ota" as const,
    provider: "credentials" as const,
    status: "verified" as const,
  },
  {
    id: "9c4dde84-b662-4066-8048-c7beac56d22d",
    email: "user3@test.com",
    phoneNumber: "6281234567892",
    password: "Testuser123!",
    type: "admin" as const,
    provider: "credentials" as const,
    status: "unverified" as const,
  },
  // OTP login user (will change from unverified to verified after otp)
  {
    id: "00ee5a79-2779-4eef-a18e-94781e525832",
    email: "13599007@mahasiswa.itb.ac.id",
    phoneNumber: "6281234167890",
    password: "Testuser123!",
    type: "mahasiswa" as const,
    provider: "credentials" as const,
    status: "unverified" as const,
  },
  // Verified mahasiswa user
  {
    id: "1f18242c-cd92-401e-ac82-6343bb1d7145",
    email: "13599008@mahasiswa.itb.ac.id",
    phoneNumber: "6281234166890",
    password: "Testuser123!",
    type: "mahasiswa" as const,
    provider: "credentials" as const,
    status: "verified" as const,
  },
  // Unverified ota user
  {
    id: "2f18242c-cd92-401e-ac82-6343bb1d7145",
    email: "user6@test.com",
    phoneNumber: "6284234167890",
    password: "Testuser123!",
    type: "ota" as const,
    provider: "credentials" as const,
    status: "unverified" as const,
  },
];

export const testRegisterUsers = [
  // Valid
  {
    type: "ota",
    email: "user4@test.com",
    phoneNumber: "6281234567893",
    password: "Testuser123!",
    confirmPassword: "Testuser123!",
  },
  // Invalid
  {
    type: "mahasiswa",
    email: "user5@test.com",
    phoneNumber: "6281234567894",
    password: "Testuser123!",
    confirmPassword: "Testuser123!",
  },
  // Valid
  {
    type: "ota",
    email: "user7@test.com",
    phoneNumber: "6281234567895",
    password: "Testuser123!",
    confirmPassword: "Testuser123!",
  }
];

// Add otp data for testUsers
export const otpDatas = [
  {
    accountId: testUsers[0].id,
    code: "123456",
    expiredAt: new Date(Date.now() + 1000 * 60 * 15),
  },
  {
    accountId: testUsers[1].id,
    code: "654321",
    expiredAt: new Date(),
  },
  {
    accountId: testUsers[2].id,
    code: "654321",
    expiredAt: new Date(),
  },
  {
    accountId: testUsers[3].id,
    code: "123456",
    expiredAt: new Date(Date.now() + 1000 * 60 * 15),
  },
];
