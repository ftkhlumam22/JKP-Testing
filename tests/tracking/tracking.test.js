const supertest = require("supertest"); // Memanggil Library Supertest untuk test API Internal
const app = require("../../app");

/*
 * # Studi Kasus Test Tracking
 *
 * 1. Tracking Luar Negeri (Berhasil)
 * 2. Tracking Domestik (Berhasil)
 * 3. Tracking Gagal
 *
 * Documented by: Zakiy Fadhil Muhsin
 */

// 1. Tracking Order Luar Negeri
test("GET /api/v1/tracking/tracking/:shipment_number | Tracking Order Luar Negeri", async () => {
  const no_order = "JEX0000020134";

  await supertest(app)
    .get(`/api/v1/tracking/tracking/${no_order}`)
    .expect(200)
    .expect("Content-Type", /json/)
    .then((response) => {
      expect(typeof response.body).toBe("object");
    });
});

// 2. Tracking Order Domestik
// test("GET /api/v1/tracking/tracking/:shipment_number | Tracking Order Domestik", async () => {
//   const no_order = "JED0000000003";

//   await supertest(app)
//     .get(`/api/v1/tracking/tracking/${no_order}`)
//     .expect(200)
//     .expect("Content-Type", /json/)
//     .then((response) => {
//       expect(typeof response.body).toBe("object");
//     });
// });

// 3. Tracking Order Gagal
test("GET /api/v1/tracking/tracking/:shipment_number | Tracking Order Gagal", async () => {
  const no_order = "JED0000004503";

  await supertest(app)
    .get(`/api/v1/tracking/tracking/${no_order}`)
    .expect(500)
    .expect("Content-Type", /json/)
    .then((response) => {
      expect(typeof response.body).toBe("object");
    });
});
