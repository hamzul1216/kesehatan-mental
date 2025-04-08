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

  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = uuid.v4();
    localStorage.setItem("userId", userId);
  }

  let currentQuestionIndex = 0;
  let answers = [];

  const questions = [
    {
      question: "Ketika bertemu dengan orang baru kamu biasanya...",
      options: [
        "Memulai membuka topik pembicaraan",
        "Menunggu orang membuka topik pembicaraan",
      ],
      scores: ["E", "I"],
    },
    {
      question: "Kamu lebih nyaman dengan informasi yang...",
      options: [
        "Berdasarkan fakta dan pengalaman nyata",
        "Berdasarkan teori dan kemungkinan",
      ],
      scores: ["S", "N"],
    },
    {
      question: "Dalam mengambil keputusan, kamu lebih sering menggunakan...",
      options: ["Logika dan objektivitas", "Perasaan dan empati"],
      scores: ["T", "F"],
    },
    {
      question: "Kamu lebih suka menjalani hidup yang...",
      options: ["Terencana dan tersusun", "Fleksibel dan spontan"],
      scores: ["J", "P"],
    },
    {
      question: "Saat bekerja dalam tim, kamu lebih suka...",
      options: ["Memimpin dan mengarahkan", "Mendukung dan bekerja sama"],
      scores: ["E", "I"],
    },
  ];

  startButton.addEventListener("click", () => {
    document.querySelector(".custom-card").style.display = "none";
    quizContainer.style.display = "block";
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
    loadQuestion();

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
      } else {
        showResult();
      }
    }, 300);
  }

  prevButton.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      loadQuestion();
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      loadQuestion();
    } else {
      showResult();
    }
  });

  // SHARE RESULT with Toastify
  window.shareResult = function () {
    const uid = localStorage.getItem("uid");
    const mbti = localStorage.getItem("mbtiType");

    if (!uid || !mbti) {
      Toastify({
        text: "Hasil tidak tersedia untuk dibagikan.",
        backgroundColor: "#f44336",
        duration: 3000,
        gravity: "top",
        position: "center",
      }).showToast();
      return;
    }

    const shareURL = `${window.location.origin}/psikotes/mbti.html?uid=${uid}&type=${mbti}`;
    navigator.clipboard.writeText(shareURL).then(() => {
      Toastify({
        text: "Link hasil berhasil disalin! 📋 Bagikan ke temanmu ✨",
        backgroundColor: "#ffb870",
        duration: 3000,
        gravity: "top",
        position: "center",
      }).showToast();
    });
  };

  // SIMPAN DAN TAMPILKAN HASIL
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

    let mbti = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    answers.forEach((ans, i) => {
      const scoreType = questions[i].scores[ans];
      mbti[scoreType]++;
    });

    const result =
      (mbti["E"] >= mbti["I"] ? "E" : "I") +
      (mbti["S"] >= mbti["N"] ? "S" : "N") +
      (mbti["T"] >= mbti["F"] ? "T" : "F") +
      (mbti["J"] >= mbti["P"] ? "J" : "P");

    const mbtiListRef = ref(db, "results/mbti");
    const newRef = push(mbtiListRef);

    const tanggalSekarang = new Date().toLocaleString("sv-SE", {
      timeZone: "Asia/Jakarta",
    });

    const data = {
      id: newRef.key,
      tanggal: tanggalSekarang,
      hasil: result,
      jawaban: questions.reduce((acc, q, idx) => {
        acc[`q${idx + 1}`] = answers[idx] + 1;
        return acc;
      }, {}),
      totalSkor: mbti,
    };

    set(newRef, data)
      .then(() => {
        console.log("Hasil MBTI berhasil disimpan.");
        localStorage.setItem("uid", newRef.key);
        localStorage.setItem("mbtiType", result);

        quizContainer.innerHTML =
          window.mbtiResults?.[result] || `<p>Hasil tidak ditemukan.</p>`;
      })
      .catch((error) => {
        console.error("Error menyimpan hasil MBTI: ", error);
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

  if (uidParam && typeParam && window.mbtiResults?.[typeParam]) {
    document.querySelector(".custom-card").style.display = "none";
    quizContainer.style.display = "block";
    quizContainer.innerHTML = window.mbtiResults[typeParam];

    localStorage.setItem("uid", uidParam);
    localStorage.setItem("mbtiType", typeParam);
  }
});
