const express = require("express");
const connection = require("./Database");
const connection2 = require("./Database2");
const router = express.Router();

// Helper untuk menghitung umur dalam tahun dan bulan
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "0 tahun 0 bulan";

  const now = new Date();
  const dob = new Date(dateOfBirth);

  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} tahun ${months} bulan`;
}

// Route GET
router.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Halaman yang diminta
  const limit = 50000; // Jumlah data per halaman
  const offset = (page - 1) * limit; // Menghitung offset berdasarkan halaman

  // Query untuk mengambil data pasien terakhir berdasarkan no_rkm_medis
  const lastPatientQuery = `SELECT COUNT(*) AS total FROM pasien;`;

  // Query untuk mengambil data pasien
  const dataQuery = `
    SELECT * FROM pasien_memsys ORDER BY norm ASC LIMIT ? OFFSET ?;
  `;

  // Query untuk menghitung total data
  const countQuery = `SELECT COUNT(*) AS total FROM pasien_memsys;`;

  // Mengambil data terakhir pasien dan data pasien secara bersamaan
  connection2.query(
    lastPatientQuery,
    (lastPatientError, lastPatientResults) => {
      if (lastPatientError) {
        console.error("Error executing last patient query:", lastPatientError);
        return res
          .status(500)
          .json({ status: "Error", message: "Database error" });
      }

      // Mengambil nomor rekam medis terakhir untuk menentukan index awal
      const lastNoRkmMedis = 150000;
      const lastIndex = parseInt(lastNoRkmMedis) + 1; // Menambahkan 1 ke no_rkm_medis terakhir

      // Mengambil data pasien berdasarkan pagination
      connection.query(
        dataQuery,
        [limit, offset],
        (dataQueryError, results) => {
          if (dataQueryError) {
            console.error("Error executing data query:", dataQueryError);
            return res
              .status(500)
              .json({ status: "Error", message: "Database error" });
          }

          if (results.length === 0) {
            return res
              .status(404)
              .json({ status: "Not Found", message: "No data found" });
          }

          // Menjalankan query untuk menghitung total data
          connection.query(countQuery, (countError, countResults) => {
            if (countError) {
              console.error("Error executing count query:", countError);
              return res
                .status(500)
                .json({ status: "Error", message: "Database error" });
            }

            const totalData = countResults[0].total; // Total data di database
            const totalPages = Math.ceil(totalData / limit); // Total halaman

            // Menyiapkan data pagination
            const pagination = {
              currentPage: page,
              totalPages: totalPages,
              totalData: totalData,
              dataPerPage: limit,
            };

            // Transform data menjadi query INSERT
            const insertQueries = results.map((data, index) => {
              const gender = data.jk === "Pria" ? "L" : "P";
              const goldar = data.goldar || "-";
              const statusNikah = data.status_nikah || "";
              const createdAt = new Date(data.createdat)
                .toISOString()
                .split("T")[0]; // Format YYYY-MM-DD
              const age = calculateAge(data.tglahir);

              // Format index menjadi 4 digit dengan angka nol di depan, dimulai dari nilai index setelah no_rkm_medis terakhir
              const indexFormatted = (lastIndex + index)
                .toString()
                .padStart(4, "0");

              return `
            INSERT INTO pasien VALUES (
              '${indexFormatted}',
              '${removeSpecialCharacters(data.nama_pasien)}',
              '',
              '${gender}',
              '${removeSpecialCharacters(data.tplahir)}',
              '${data.tglahir ? data.tglahir.toISOString().split("T")[0] : ""}',
              '-',
              '${removeSpecialCharacters(data.alamat)}',
              '${goldar}',
              '-',
              '${removeSpecialCharacters(statusNikah)}',
              '${removeSpecialCharacters(data.agama)}',
              '${createdAt}',
              '${data.telp}',
              '${age}',
              '-',
              'DIRI SENDIRI',
              '-',
              '-',
              '-',
              '1',
              '1',
              '1',
              '-',
              '-',
              '-',
              '-',
              '- ',
              '-',
              '1',
              '5',
              '1',
              '-',
              '-',
              '359',
              'LAMPUNG'
            );
          `;
            });

            // Menjalankan setiap query INSERT satu per satu
            insertQueries.forEach((query, idx) => {
              connection2.query(query, (error, results) => {
                if (error) {
                  console.error(
                    `Error executing insert query at index ${idx}:`,
                    error
                  );
                } else {
                  console.log(`Query at index ${idx} executed successfully.`);
                }
              });
            });

            // Menyertakan informasi pagination dalam respons
            res.status(200).json({
              status: "Success",
              message: "Insert queries executed successfully",
              pagination: pagination,
              data: results, // Mengembalikan data hasil query SELECT
            });
          });
        }
      );
    }
  );
});
function removeSpecialCharacters(str) {
  // Menggunakan regular expression untuk menggantikan karakter yang tidak diinginkan dengan string kosong
  return str.replace(/[`'""]/g, "");
}
module.exports = router;
