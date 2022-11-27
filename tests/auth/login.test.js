const supertest = require("supertest"); // Memanggil Library Supertest untuk test API Internal
const app = require("../../app");

/*
 * # Studi Kasus Test Login
 *
 * 1. Login Berhasil
 * 2. Login Gagal - Email Salah/Email Tidak Terdaftar
 * 3. Login Gagal - Password Salah
 * 4. Login Gagal - Pengguna Tidak Aktif
 *
 * Documented by: Zakiy Fadhil Muhsin
 */

// 1. Test Saat Login Berhasil
test("POST /api/v1/auth/login - Saat Login Berhasil", async () => {
  const userDataLogin = {
    email: "noer@jaskipin.com",
    password: "dayat",
  };

  await supertest(app)
    .post("/api/v1/auth/login")
    .send(userDataLogin)
    .expect(200)
    .expect("Content-Type", /json/)
    .then((response) => {
      expect(typeof response.body).toBe("object");
      expect(response.body).toHaveProperty("token");
    });
});

// 2. Test Saat Login Gagal (Email Salah)
test("POST /api/v1/auth/login - Saat Login Gagal (Email Salah)", async () => {
  const userDataLogin = {
    email: "jaskipin2@gmail.com",
    password: "12345678",
  };

  await supertest(app)
    .post("/api/v1/auth/login")
    .send(userDataLogin)
    .expect(500)
    .expect("Content-Type", /json/)
    .then((response) => {
      console.log(response.body);
      expect(typeof response.body).toBe("object");
      expect(Object.keys(response.body).length).toBe(2);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("user tidak terdaftar!");
    });
});

// 3. Test Saat Login Gagal (Password Salah)
test("POST /api/v1/auth/login - Saat Login Gagal (Password Salah)", async () => {
  const userDataLogin = {
    email: "jaskipin@gmail.com",
    password: "123456789",
  };

  await supertest(app)
    .post("/api/v1/auth/login")
    .send(userDataLogin)
    .expect(500)
    .expect("Content-Type", /json/)
    .then((response) => {
      expect(typeof response.body).toBe("object");
      expect(Object.keys(response.body).length).toBe(2);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("password tidak sesuai!");
    });
});

// 4. Test Saat Login Gagal (User Tidak Aktif)
test("POST /api/v1/auth/login - Saat Login Gagal (User Tidak Aktif)", async () => {
  const userDataLogin = {
    email: "agen.buatufah1@gmail.com",
    password: "12345678",
  };

  await supertest(app)
    .post("/api/v1/auth/login")
    .send(userDataLogin)
    .expect(500)
    .expect("Content-Type", /json/)
    .then((response) => {
      expect(typeof response.body).toBe("object");
      expect(Object.keys(response.body).length).toBe(2);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("user tidak aktif!");
    });
});
