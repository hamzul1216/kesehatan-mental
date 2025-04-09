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
      quizStarted:
        document.querySelector(".custom-card").style.display === "none",
    };
    sessionStorage.setItem("hipertensiQuizState", JSON.stringify(state));
  }

  // Fungsi untuk memuat state quiz
  function loadQuizState() {
    // Reset jika datang dari halaman lain
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

      if (state.quizStarted) {
        document.querySelector(".custom-card").style.display = "none";
        quizContainer.style.display = "block";
        loadQuestion();
      }
    }
  }

  // Deteksi jika halaman dimuat dari cache (back/forward navigation)
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      // Hapus state jika kembali ke halaman melalui navigasi browser
      sessionStorage.removeItem("hipertensiQuizState");
      resetQuiz();
    }
  });

  // Reset quiz ke keadaan awal
  function resetQuiz() {
    currentQuestionIndex = 0;
    answers = [];
    document.querySelector(".custom-card").style.display = "flex";
    quizContainer.style.display = "none";
    sessionStorage.removeItem("hipertensiQuizState");
  }

  // Panggil loadQuizState saat halaman dimuat
  loadQuizState();

  startButton.addEventListener("click", () => {
    document.querySelector(".custom-card").style.display = "none";
    quizContainer.style.display = "block";
    // Set flag bahwa user datang dari dalam halaman ini
    sessionStorage.setItem("hipertensiInternalNav", "true");
    saveQuizState();
    loadQuestion();
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
    textarea.style.position = "fixed"; // Avoid scrolling to bottom
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
    // Ambil uid dan type dari URL parameter jika ada
    const params = new URLSearchParams(window.location.search);
    const uidFromURL = params.get("uid");
    const typeFromURL = params.get("type");

    // Prioritaskan dari URL, lalu dari localStorage
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

    // Cek apakah browser mendukung clipboard API
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

  // SIMPAN DAN TAMPILKAN HASIL
  function showResult() {
    // Pastikan semua pertanyaan dijawab
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

    // Hitung jumlah jawaban A dan B
    let countAnswers = { A: 0, B: 0 };
    answers.forEach((ans) => {
      countAnswers[ans === 0 ? "A" : "B"]++;
    });

    // Buat string pola jawaban user dan bandingkan dengan pola risiko
    const riskPattern = "BAAABABBBB";
    const userPattern = answers.map((ans) => (ans === 0 ? "A" : "B")).join("");
    const result = userPattern === riskPattern ? "positive" : "negative";

    // Simpan hasil ke Firebase
    const hipertensiListRef = ref(db, "results/hipertensi");
    const newRef = push(hipertensiListRef);

    const tanggalSekarang = new Date().toLocaleString("sv-SE", {
      timeZone: "Asia/Jakarta",
    });

    const data = {
      id: newRef.key,
      tanggal: tanggalSekarang,
      hasil: result,
      jawaban: questions.reduce((acc, q, idx) => {
        acc[`Q${idx + 1}`] = answers[idx] === 0 ? "A" : "B";
        return acc;
      }, {}),
      totalSkor: countAnswers,
      userId: userId,
    };

    set(newRef, data)
      .then(() => {
        console.log("Hasil hipertensi berhasil disimpan.");
        localStorage.setItem("uid", newRef.key);
        localStorage.setItem("hipertensiType", result);
        localStorage.setItem("hipertensiData", JSON.stringify(data));
        sessionStorage.removeItem("hipertensiQuizState");

        // Tampilkan hasil
        if (window.hipertensiResults && window.hipertensiResults[result]) {
          quizContainer.innerHTML = window.hipertensiResults[result];
        } else {
          quizContainer.innerHTML = `
            <div class="result-container">
              <h2>Hasil Tes Hipertensi</h2>
              <p>Anda memiliki risiko hipertensi: ${
                result === "positive" ? "Tinggi" : "Rendah"
              }</p>
              <p>Skor A: ${countAnswers.A}, Skor B: ${countAnswers.B}</p>
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
    document.querySelector(".custom-card").style.display = "none";
    quizContainer.style.display = "block";

    // Coba tampilkan dari localStorage dulu
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
            <p>Skor A: ${data.totalSkor.A}, Skor B: ${data.totalSkor.B}</p>
            <button onclick="shareResult()" class="share-btn">Bagikan Hasil</button>
          </div>
        `;
      }
    } else {
      // Tampilkan hasil dasar jika data tidak ditemukan di localStorage
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
