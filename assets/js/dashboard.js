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

document.getElementById("filterBtn").addEventListener("click", filterData);
document.getElementById("downloadBtn").addEventListener("click", downloadExcel);
window.switchTest = switchTest;

fetchData();

function fetchData() {
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

function getOrderedSoalKeys(jawabanObj) {
  return Object.keys(jawabanObj || {}).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ""), 10);
    const numB = parseInt(b.replace(/\D/g, ""), 10);
    return numA - numB;
  });
}

function parseJakartaDate(str) {
  const [datePart, timePart] = str.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, second);
}

function renderTable(data) {
  tableBody.innerHTML = "";
  tableHead.innerHTML = "";
  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="100%" style="text-align:center; padding: 1rem; font-style: italic; color: gray;">Data kosong</td></tr>`;
    return;
  }

  let allKeys = [];

  if (currentTest === "mbti") {
    allKeys = [
      "id",
      "tanggal",
      "hasil",
      ...getOrderedSoalKeys(data[0].jawaban),
      ...Object.keys(data[0].totalSkor || {}),
    ];
  } else {
    // Urutan kolom untuk hipertensi: id, tanggal, nama, usia, jenis kelamin, hasil, Q1-Q10
    allKeys = ["id", "tanggal", "nama", "usia", "jenisKelamin", "hasil"];
    const soalKeys = getOrderedSoalKeys(data[0].jawaban);
    allKeys.push(...soalKeys);
  }

  const headerRow = document.createElement("tr");
  headerRow.innerHTML =
    `<th>No</th>` +
    allKeys
      .map((key) => {
        // Ubah label untuk beberapa kolom
        if (key === "jenisKelamin") return `<th>Jenis Kelamin</th>`;
        if (key === "nama") return `<th>Nama</th>`;
        if (key === "usia") return `<th>Usia</th>`;
        return `<th>${key}</th>`;
      })
      .join("");
  tableHead.appendChild(headerRow);

  data.forEach((item, index) => {
    const row = document.createElement("tr");
    let rowHTML = `<td>${index + 1}</td>`;

    rowHTML += allKeys
      .map((key) => {
        if (currentTest === "hipertensi" && item.jawaban?.[key] !== undefined)
          return `<td>${item.jawaban[key]}</td>`;
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
  const startInput = document.getElementById("startDate").value;
  const endInput = document.getElementById("endDate").value;

  const startDate = startInput ? new Date(`${startInput}T00:00:00`) : null;
  const endDate = endInput ? new Date(`${endInput}T23:59:59`) : null;

  const filtered = getCurrentData().filter((item) => {
    const itemDate = parseJakartaDate(item.tanggal);
    return (
      (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate)
    );
  });

  renderTable(filtered);
}

function downloadExcel() {
  const startInput = document.getElementById("startDate").value;
  const endInput = document.getElementById("endDate").value;

  const startDate = startInput ? new Date(`${startInput}T00:00:00`) : null;
  const endDate = endInput ? new Date(`${endInput}T23:59:59`) : null;

  const filtered = getCurrentData().filter((item) => {
    const itemDate = parseJakartaDate(item.tanggal);
    return (
      (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate)
    );
  });

  if (filtered.length === 0) return;

  let allKeys = [];

  if (currentTest === "mbti") {
    allKeys = [
      "id",
      "tanggal",
      "hasil",
      ...getOrderedSoalKeys(filtered[0].jawaban),
      ...Object.keys(filtered[0].totalSkor || {}),
    ];
  } else {
    // Urutan kolom untuk Excel sama dengan tampilan tabel
    allKeys = ["id", "tanggal", "nama", "usia", "jenisKelamin", "hasil"];
    const soalKeys = getOrderedSoalKeys(filtered[0].jawaban);
    allKeys.push(...soalKeys);
  }

  const excelData = filtered.map((item, index) => {
    const row = { No: index + 1 };
    allKeys.forEach((key) => {
      if (currentTest === "hipertensi" && item.jawaban?.[key] !== undefined)
        row[key] = item.jawaban[key];
      else if (item.jawaban?.[key] !== undefined) row[key] = item.jawaban[key];
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
