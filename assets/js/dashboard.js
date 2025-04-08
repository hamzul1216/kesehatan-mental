// dashboard.js
import { db } from "./firebase-config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

let dataMBTI = [];
let dataHipertensi = [];

let currentTest = "hipertensi";
const tableBody = document.querySelector("#dataTable tbody");
const tableHead = document.querySelector("#dataTable thead");

// Ambil elemen tombol
document.getElementById("filterBtn").addEventListener("click", filterData);
document.getElementById("downloadBtn").addEventListener("click", downloadExcel);

// Expose fungsi ke global scope
window.switchTest = switchTest;

fetchData();

function fetchData() {
  // Ambil data MBTI
  const mbtiRef = ref(db, "results/mbti");
  get(mbtiRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        dataMBTI = Object.values(snapshot.val());
        console.log("Data MBTI berhasil diambil:", dataMBTI);
        renderTable(getCurrentData());
      } else {
        console.log("Tidak ada data MBTI.");
      }
    })
    .catch((error) => console.error("Error mengambil data MBTI: ", error));

  // Ambil data HIPERTENSI
  const hipertensiRef = ref(db, "results/hipertensi");
  get(hipertensiRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        dataHipertensi = Object.values(snapshot.val());
        console.log("Data Hipertensi berhasil diambil:", dataHipertensi);
        renderTable(getCurrentData());
      } else {
        console.log("Tidak ada data Hipertensi.");
      }
    })
    .catch((error) =>
      console.error("Error mengambil data Hipertensi: ", error)
    );
}

function switchTest(test, event) {
  currentTest = test;

  document
    .querySelectorAll(".sidebar li")
    .forEach((li) => li.classList.remove("active"));
  event.target.classList.add("active");

  document.getElementById(
    "testTitle"
  ).innerText = `Dashboard ${test.toUpperCase()}`;
  renderTable(getCurrentData());
}

function getCurrentData() {
  return currentTest === "mbti" ? dataMBTI : dataHipertensi;
}

function renderTable(data) {
  tableBody.innerHTML = "";
  tableHead.innerHTML = "";
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="100%" style="text-align:center; padding: 1rem; font-style: italic; color: gray;">Data kosong</td></tr>`;
    tableHead.innerHTML = "";
    return;
  }

  let allKeys = [];

  if (currentTest === "mbti") {
    allKeys = [
      "id",
      "tanggal",
      "hasil",
      ...Object.keys(data[0].jawaban || {}),
      ...Object.keys(data[0].totalSkor || {}),
    ];
  } else {
    const baseKeys = Object.keys(data[0]).filter((key) => key !== "totalSkor");
    baseKeys.forEach((key) => {
      if (key === "jawaban") {
        const soalKeys = Object.keys(data[0][key] || {});
        allKeys.push(...soalKeys);
      } else {
        allKeys.push(key);
      }
    });
  }

  // Render thead (tambah kolom No)
  const headerRow = document.createElement("tr");
  headerRow.innerHTML =
    `<th>No</th>` + allKeys.map((key) => `<th>${key}</th>`).join("");
  tableHead.appendChild(headerRow);

  // Render tbody
  data.forEach((item, index) => {
    const row = document.createElement("tr");
    let rowHTML = `<td>${index + 1}</td>`; // Tambah nomor urut
    rowHTML += allKeys
      .map((key) => {
        if (item.jawaban?.[key] !== undefined)
          return `<td>${item.jawaban[key]}</td>`;
        if (item.totalSkor?.[key] !== undefined)
          return `<td>${item.totalSkor[key]}</td>`;
        return `<td>${item[key] ?? ""}</td>`;
      })
      .join("");
    row.innerHTML = rowHTML;
    tableBody.appendChild(row);
  });
}

function filterData() {
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  const filtered = getCurrentData().filter((item) => {
    return (!start || item.tanggal >= start) && (!end || item.tanggal <= end);
  });

  renderTable(filtered);
}

function downloadExcel() {
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  const filtered = getCurrentData().filter((item) => {
    return (!start || item.tanggal >= start) && (!end || item.tanggal <= end);
  });

  if (filtered.length === 0) return;

  let allKeys = [];

  if (currentTest === "mbti") {
    allKeys = [
      "id",
      "tanggal",
      "hasil",
      ...Object.keys(filtered[0].jawaban || {}),
      ...Object.keys(filtered[0].totalSkor || {}),
    ];
  } else {
    const baseKeys = Object.keys(filtered[0]).filter(
      (key) => key !== "totalSkor"
    );
    baseKeys.forEach((key) => {
      if (key === "jawaban") {
        const soalKeys = Object.keys(filtered[0][key] || {});
        allKeys.push(...soalKeys);
      } else {
        allKeys.push(key);
      }
    });
  }

  const excelData = filtered.map((item, index) => {
    const row = { No: index + 1 }; // Tambah nomor urut
    allKeys.forEach((key) => {
      if (item.jawaban?.[key] !== undefined) row[key] = item.jawaban[key];
      else if (item.totalSkor?.[key] !== undefined)
        row[key] = item.totalSkor[key];
      else row[key] = item[key] ?? "";
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Data ${currentTest.toUpperCase()}`);
  XLSX.writeFile(wb, `hasil_${currentTest}.xlsx`);
}
