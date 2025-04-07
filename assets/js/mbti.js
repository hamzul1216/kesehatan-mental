document.addEventListener("DOMContentLoaded", () => {
  const startButton = document.querySelector(".card-button");
  const quizContainer = document.getElementById("quiz-container");
  const questionText = document.getElementById("question-text");
  const answerButtons = document.getElementById("answer-buttons");
  const progressText = document.getElementById("progress-text");
  const progressFill = document.getElementById("progress-fill");
  const prevButton = document.getElementById("prev-btn");
  const nextButton = document.getElementById("next-btn");

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
    quizContainer.classList.add("fade-in"); // Tambah efek fade-in

    q.options.forEach((option, index) => {
      const btn = document.createElement("div");
      btn.classList.add("answer-btn");
      btn.innerText = option;

      if (answers[currentQuestionIndex] === index) {
        btn.classList.add("selected"); // Highlight jawaban yang dipilih
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

  function showResult() {
    let mbti = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

    answers.forEach((ans, i) => {
      let scoreType = questions[i].scores[ans];
      mbti[scoreType]++;
    });

    let result =
      (mbti["E"] >= mbti["I"] ? "E" : "I") +
      (mbti["S"] >= mbti["N"] ? "S" : "N") +
      (mbti["T"] >= mbti["F"] ? "T" : "F") +
      (mbti["J"] >= mbti["P"] ? "J" : "P");

    quizContainer.innerHTML =
      mbtiResults[result] || `<p>Hasil tidak ditemukan.</p>`;
  }
});
