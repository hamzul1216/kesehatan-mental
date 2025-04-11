import { db } from "./firebase-config.js";
import {
  ref,
  set,
  push,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector(".card-button");
  const quizContainer = document.getElementById("quiz-container");
  const questionText = document.getElementById("question-text");
  const answerButtons = document.getElementById("answer-buttons");
  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  const prevButton = document.getElementById("prev-btn");
  const nextButton = document.getElementById("next-btn");
  const customCard = document.querySelector(".custom-card");

  // Tambahkan container untuk screening
  const screeningContainer = document.createElement("div");
  screeningContainer.className = "screening-container";
  screeningContainer.style.display = "none";
  screeningContainer.innerHTML = `
    <h2>Data Diri</h2>
    <div class="form-group">
      <label for="nama">Nama:</label>
      <input type="text" id="nama" required>
    </div>
    <div class="form-group">
      <label for="usia">Usia:</label>
      <input type="number" id="usia" required min="1" max="120">
    </div>
    <div class="form-group">
      <label for="jenis-kelamin">Jenis Kelamin:</label>
      <select id="jenis-kelamin" required>
        <option value="">Pilih Jenis Kelamin</option>
        <option value="Laki-laki">Laki-laki</option>
        <option value="Perempuan">Perempuan</option>
      </select>
    </div>
    <button id="screening-submit" class="card-button">Lanjut ke Pertanyaan</button>
  `;

  // Tempatkan screeningContainer setelah custom-card
  customCard.insertAdjacentElement("afterend", screeningContainer);

  // Cek apakah user datang dari halaman lain
  const isComingFromOtherPage =
    !document.referrer.includes(window.location.hostname) ||
    (document.referrer && !document.referrer.includes("hipertensi.html"));

  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = uuid.v4();
    localStorage.setItem("userId", userId);
  }

  let currentQuestionIndex = 0;
  let answers = [];
  let screeningData = {};

  const questions = [
    {
      question: "1. Hasil cek tensi atau tekanan darah terakhir:",
      options: ["A. di bawah 120/80", "B. di atas 120/80"],
      scores: ["A", "B"],
    },
    {
      question:
        "2. Apakah anda lebih sering merasa nyeri di kepala atau tengkuk leher belakang?",
      options: ["A. Ya", "B. Tidak"],
      scores: ["A", "B"],
    },
    {
      question:
        "3. Apakah anda sering mengkonsumsi tinggi garam dalam masakan atau yang lainnya?",
      options: ["A. Ya", "B. Tidak"],
      scores: ["A", "B"],
    },
    {
      question: "4. Apakah anda memiliki riwayat keluarga dengan darah tinggi?",
      options: ["A. Ya", "B. Tidak"],
      scores: ["A", "B"],
    },
    {
      question:
        "5. Apakah anda rutin periksa tekanan darah atau tensi di fasilitas kesehatan terdekat?",
      options: ["A. Ya", "B. Tidak"],
      scores: ["A", "B"],
    },
    {
      question: "6. Apakah anda merokok atau memiliki riwayat merokok?",
      options: ["A. Ya", "B. Tidak"],
      scores: ["A", "B"],
    },
    {
      question:
        "7. Apakah anda pernah rutin konsumsi obat penurun darah tinggi?",
      options: ["A. Ya", "B. Tidak"],
      scores: ["A", "B"],
    },
    {
      question: "8. Apakah anda memiliki waktu tidur yang cukup?",
      options: ["A. Ya", "B. Tidak"],
      scores: ["A", "B"],
    },
    {
      question: "9. Apakah anda melakukan olahraga secara rutin?",
      options: ["A. Ya", "B. Tidak"],
      scores: ["A", "B"],
    },
    {
      question:
        "10. Apakah sebelumnya anda pernah ke dokter untuk berobat hipertensi?",
      options: ["A. Ya", "B. Tidak"],
      scores: ["A", "B"],
    },
  ];

  // Fungsi untuk menyimpan state quiz
  function saveQuizState() {
    const state = {
      currentQuestionIndex,
      answers,
      quizStarted: customCard.style.display === "none",
      screeningCompleted: screeningContainer.style.display === "none",
      screeningData,
    };
    sessionStorage.setItem("hipertensiQuizState", JSON.stringify(state));
  }

  // Fungsi untuk memuat state quiz
  function loadQuizState() {
    if (
      isComingFromOtherPage &&
      !sessionStorage.getItem("hipertensiInternalNav")
    ) {
      sessionStorage.removeItem("hipertensiQuizState");
      return;
    }

    const savedState = sessionStorage.getItem("hipertensiQuizState");
    if (savedState) {
      const state = JSON.parse(savedState);
      currentQuestionIndex = state.currentQuestionIndex || 0;
      answers = state.answers || [];
      screeningData = state.screeningData || {};

      if (state.quizStarted) {
        customCard.style.display = "none";
        if (state.screeningCompleted) {
          screeningContainer.style.display = "none";
          quizContainer.style.display = "block";
          loadQuestion();
        } else {
          screeningContainer.style.display = "block";
        }
      }
    }
  }

  // Deteksi jika halaman dimuat dari cache (back/forward navigation)
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      sessionStorage.removeItem("hipertensiQuizState");
      resetQuiz();
    }
  });

  // Reset quiz ke keadaan awal
  function resetQuiz() {
    currentQuestionIndex = 0;
    answers = [];
    screeningData = {};
    customCard.style.display = "flex";
    screeningContainer.style.display = "none";
    quizContainer.style.display = "none";
    sessionStorage.removeItem("hipertensiQuizState");
  }

  // Panggil loadQuizState saat halaman dimuat
  loadQuizState();

  startButton.addEventListener("click", () => {
    customCard.style.display = "none";
    screeningContainer.style.display = "block";
    sessionStorage.setItem("hipertensiInternalNav", "true");
    saveQuizState();
  });

  // Handle screening form submission
  document.getElementById("screening-submit").addEventListener("click", () => {
    const nama = document.getElementById("nama").value;
    const usia = document.getElementById("usia").value;
    const jenisKelamin = document.getElementById("jenis-kelamin").value;

    if (!nama || !usia || !jenisKelamin) {
      Toastify({
        text: "Harap isi semua data diri terlebih dahulu",
        backgroundColor: "#f44336",
        duration: 3000,
        gravity: "top",
        position: "center",
      }).showToast();
      return;
    }

    screeningData = { nama, usia, jenisKelamin };
    screeningContainer.style.display = "none";
    quizContainer.style.display = "block";
    saveQuizState();
    loadQuestion();

    // // Save screening data to Firebase
    // const screeningRef = ref(db, "screening/hipertensi");
    // const newScreeningRef = push(screeningRef);

    // set(newScreeningRef, {
    //   userId,
    //   ...screeningData,
    //   tanggal: new Date().toLocaleString("sv-SE", {
    //     timeZone: "Asia/Jakarta",
    //   }),
    // }).catch((error) => {
    //   console.error("Error menyimpan data screening: ", error);
    // });
  });

  function loadQuestion() {
    const q = questions[currentQuestionIndex];
    questionText.innerText = q.question;
    answerButtons.innerHTML = "";
    quizContainer.classList.add("fade-in");

    q.options.forEach((option, index) => {
      const btn = document.createElement("div");
      btn.classList.add("answer-btn");
      btn.innerText = option;

      if (answers[currentQuestionIndex] === index) {
        btn.classList.add("selected");
      }

      btn.addEventListener("click", () => selectAnswer(index));
      answerButtons.appendChild(btn);
    });

    progressText.innerText = `Pertanyaan ke ${currentQuestionIndex + 1}/${
      questions.length
    }`;
    progressFill.style.width = `${
      ((currentQuestionIndex + 1) / questions.length) * 100
    }%`;

    prevButton.disabled = currentQuestionIndex === 0;
    nextButton.disabled = answers[currentQuestionIndex] === undefined;
  }

  function selectAnswer(index) {
    answers[currentQuestionIndex] = index;
    saveQuizState();
    loadQuestion();

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        saveQuizState();
        loadQuestion();
      } else {
        showResult();
      }
    }, 300);
  }

  prevButton.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      saveQuizState();
      loadQuestion();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      saveQuizState();
      loadQuestion();
    } else {
      showResult();
    }
  });

  // Fungsi untuk menyalin teks ke clipboard (fallback)
  function fallbackCopyToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const successful = document.execCommand("copy");
      const msg = successful ? "berhasil" : "gagal";
      console.log("Fallback copy text command " + msg);

      Toastify({
        text: successful
          ? "Link hasil berhasil disalin! 📋 Bagikan ke temanmu ✨"
          : "Gagal menyalin link. Silakan coba manual.",
        backgroundColor: successful ? "#4CAF50" : "#f44336",
        duration: 3000,
        gravity: "top",
        position: "center",
      }).showToast();
    } catch (err) {
      console.error("Fallback copy failed:", err);

      Toastify({
        text: "Gagal menyalin link. Silakan salin manual dari address bar.",
        backgroundColor: "#f44336",
        duration: 3000,
        gravity: "top",
        position: "center",
      }).showToast();
    }

    document.body.removeChild(textarea);
  }

  window.shareResult = function () {
    const params = new URLSearchParams(window.location.search);
    const uidFromURL = params.get("uid");
    const typeFromURL = params.get("type");

    const uid = uidFromURL || localStorage.getItem("uid");
    const hipertensiType =
      typeFromURL || localStorage.getItem("hipertensiType");

    if (!uid || !hipertensiType) {
      Toastify({
        text: "Hasil tidak tersedia untuk dibagikan. Silakan selesaikan quiz terlebih dahulu.",
        backgroundColor: "#f44336",
        duration: 3000,
        gravity: "top",
        position: "center",
      }).showToast();
      return;
    }

    const shareURL = `${window.location.origin}${window.location.pathname}?uid=${uid}&type=${hipertensiType}`;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareURL)
        .then(() => {
          Toastify({
            text: "Link hasil berhasil disalin! 📋 Bagikan ke temanmu ✨",
            backgroundColor: "#4CAF50",
            duration: 3000,
            gravity: "top",
            position: "center",
          }).showToast();
        })
        .catch((err) => {
          console.error("Gagal menyalin ke clipboard:", err);
          fallbackCopyToClipboard(shareURL);
        });
    } else {
      fallbackCopyToClipboard(shareURL);
    }
  };

  function showResult() {
    if (answers.length < questions.length || answers.includes(undefined)) {
      Toastify({
        text: "Harap jawab semua pertanyaan sebelum melihat hasil.",
        backgroundColor: "#f44336",
        duration: 3000,
        gravity: "top",
        position: "center",
      }).showToast();
      return;
    }

    let countAnswers = { A: 0, B: 0 };
    answers.forEach((ans) => {
      countAnswers[ans === 0 ? "A" : "B"]++;
    });

    // const riskPattern = "BAAABABBBB";
    // const userPattern = answers.map((ans) => (ans === 0 ? "A" : "B")).join("");
    // const result = userPattern === riskPattern ? "positive" : "negative";
    const isPositive =
      answers[0] === 1 || // Pertanyaan 1 jawab B
      answers[6] === 0 || // Pertanyaan 7 jawab A
      answers[9] === 0; // Pertanyaan 10 jawab A

    const result = isPositive ? "positive" : "negative";
    const resultData =
      result === "positive"
        ? "Beresiko Hipertensi"
        : "Tidak Beresiko Hipertensi";

    const hipertensiListRef = ref(db, "results/hipertensi");
    const newRef = push(hipertensiListRef);

    const tanggalSekarang = new Date().toLocaleString("sv-SE", {
      timeZone: "Asia/Jakarta",
    });

    const data = {
      id: newRef.key,
      tanggal: tanggalSekarang,
      hasil: resultData,
      jawaban: questions.reduce((acc, q, idx) => {
        acc[`Q${idx + 1}`] = answers[idx] === 0 ? "A" : "B";
        return acc;
      }, {}),
      userId: userId,
      // Tambahkan data screening langsung di sini
      nama: screeningData.nama,
      usia: screeningData.usia,
      jenisKelamin: screeningData.jenisKelamin,
    };

    set(newRef, data)
      .then(() => {
        console.log("Hasil hipertensi berhasil disimpan.");
        localStorage.setItem("uid", newRef.key);
        localStorage.setItem("hipertensiType", result);
        localStorage.setItem("hipertensiData", JSON.stringify(data));
        sessionStorage.removeItem("hipertensiQuizState");

        if (window.hipertensiResults && window.hipertensiResults[result]) {
          quizContainer.innerHTML = window.hipertensiResults[result];
        } else {
          quizContainer.innerHTML = `
            <div class="result-container">
              <h2>Hasil Tes Hipertensi</h2>
              <p>Anda memiliki risiko hipertensi: ${
                result === "positive" ? "Tinggi" : "Rendah"
              }</p>
              <button onclick="shareResult()" class="share-btn">Bagikan Hasil</button>
            </div>
          `;
        }
      })
      .catch((error) => {
        console.error("Error menyimpan hasil hipertensi: ", error);
        Toastify({
          text: "Gagal menyimpan hasil. Coba lagi.",
          backgroundColor: "#f44336",
          duration: 3000,
          gravity: "top",
          position: "center",
        }).showToast();
      });
  }

  // CEK PARAMETER URL UNTUK MENAMPILKAN HASIL LANGSUNG
  const params = new URLSearchParams(window.location.search);
  const uidParam = params.get("uid");
  const typeParam = params.get("type");

  if (
    uidParam &&
    typeParam &&
    (typeParam === "positive" || typeParam === "negative")
  ) {
    customCard.style.display = "none";
    screeningContainer.style.display = "none";
    quizContainer.style.display = "block";

    const savedData = localStorage.getItem("hipertensiData");
    if (savedData && JSON.parse(savedData).id === uidParam) {
      const data = JSON.parse(savedData);
      if (window.hipertensiResults && window.hipertensiResults[typeParam]) {
        quizContainer.innerHTML = window.hipertensiResults[typeParam];
      } else {
        quizContainer.innerHTML = `
          <div class="result-container">
            <h2>Hasil Tes Hipertensi</h2>
            <p>Anda memiliki risiko hipertensi: ${
              typeParam === "positive" ? "Tinggi" : "Rendah"
            }</p>
            <button onclick="shareResult()" class="share-btn">Bagikan Hasil</button>
          </div>
        `;
      }
    } else {
      quizContainer.innerHTML = `
        <div class="result-container">
          <h2>Hasil Tes Hipertensi</h2>
          <p>Anda memiliki risiko hipertensi: ${
            typeParam === "positive" ? "Tinggi" : "Rendah"
          }</p>
          <button onclick="shareResult()" class="share-btn">Bagikan Hasil</button>
        </div>
      `;
    }

    sessionStorage.removeItem("hipertensiQuizState");
    localStorage.setItem("uid", uidParam);
    localStorage.setItem("hipertensiType", typeParam);
  }

  window.addEventListener("load", function () {
    sessionStorage.removeItem("hipertensiInternalNav");
  });
});
