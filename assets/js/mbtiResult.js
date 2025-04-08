function generateMBTIResult({
  type,
  nickname,
  description,
  strengths,
  challenges,
}) {
  return `
    <div class="result-container fade-in">
      <h2 class="result-heading">Hasil Tes MBTI Kamu</h2>
      <div class="result-card">
        <div class="info-wrapper">
          <p class="result-title">${type} <span class="nickname">(${nickname})</span></p>
          <div class="result-description">
            <p class="desc-main">${description}</p>
            <p><strong>Kelebihan:</strong> ${strengths}</p>
            <p><strong>Tantangan:</strong> ${challenges}</p>
          </div>
          <div class="share">
            <p>Yuk, Bagikan hasil tesmu!</p>
            <img class="share-icon" onclick="shareResult()" src="../assets/svg/share.svg" alt="Clipboard" width="24" height="24" />
          </div>
        </div>
        <button class="card-button" onclick="location.reload()">Coba Lagi</button>
      </div>
    </div>
  `;
}

const mbtiData = {
  INTP: {
    type: "INTP",
    nickname: "The Thinker",
    description:
      "Kamu adalah pencari kebenaran yang senang menganalisis ide dan sistem. Selalu penasaran dan suka menyelidiki sesuatu secara mendalam.",
    strengths: "Logis, kreatif, open-minded",
    challenges: "Bisa terlalu mengabaikan emosi dan kurang praktik",
  },
  ENTJ: {
    type: "ENTJ",
    nickname: "The Commander",
    description:
      "Kamu adalah pemimpin alami yang tegas dan visioner. Selalu punya rencana besar dan siap untuk mengeksekusinya.",
    strengths: "Strategis, ambisius, percaya diri",
    challenges:
      "Bisa keras kepala dan kurang sensitif terhadap perasaan orang lain",
  },
  ENTP: {
    type: "ENTP",
    nickname: "The Debater",
    description:
      "Kamu adalah inovator yang penuh ide dan suka berdiskusi. Antusias, kreatif, dan tidak takut menghadapi tantangan baru.",
    strengths: "Inovatif, komunikatif, fleksibel",
    challenges: "Bisa cepat bosan dan kurang konsisten",
  },
  INTJ: {
    type: "INTJ",
    nickname: "The Mastermind",
    description:
      "Kamu adalah perencana jangka panjang yang sangat strategis. Mandiri, visioner, dan perfeksionis.",
    strengths: "Analitis, berwawasan, tegas",
    challenges: "Cenderung kaku dan kurang emosional",
  },
  INFJ: {
    type: "INFJ",
    nickname: "The Advocate",
    description:
      "Kamu adalah idealis yang memiliki visi kuat tentang dunia yang lebih baik. Sangat peduli dengan orang lain dan memiliki nilai-nilai mendalam.",
    strengths: "Empatik, intuitif, berprinsip",
    challenges: "Cenderung menyimpan perasaan dan cepat lelah secara emosional",
  },
  INFP: {
    type: "INFP",
    nickname: "The Mediator",
    description:
      "Kamu adalah pendamai yang menghargai harmoni dan makna dalam hidup. Sangat imajinatif dan sering punya dunia batin yang kaya.",
    strengths: "Penuh empati, setia, kreatif",
    challenges: "Terlalu idealis dan mudah kecewa",
  },
  ENFP: {
    type: "ENFP",
    nickname: "The Campaigner",
    description:
      "Kamu adalah sosok yang energik dan inspiratif. Suka eksplorasi ide, orang, dan kemungkinan baru.",
    strengths: "Antusias, ekspresif, peduli",
    challenges: "Susah fokus dan bisa terlalu impulsif",
  },
  ENFJ: {
    type: "ENFJ",
    nickname: "The Protagonist",
    description:
      "Kamu adalah pemimpin yang hangat dan karismatik. Pandai memotivasi orang dan sering jadi panutan.",
    strengths: "Meyakinkan, empatik, suportif",
    challenges: "Terlalu perfeksionis dan suka menyenangkan semua orang",
  },
  ISTJ: {
    type: "ISTJ",
    nickname: "The Inspector",
    description:
      "Kamu adalah pribadi yang bertanggung jawab dan sangat menghargai tradisi dan struktur.",
    strengths: "Terorganisir, disiplin, andal",
    challenges: "Kurang fleksibel dan bisa terlalu kritis",
  },
  ISFJ: {
    type: "ISFJ",
    nickname: "The Defender",
    description:
      "Kamu adalah pelindung yang tenang dan penuh perhatian. Selalu siap membantu dengan tulus.",
    strengths: "Setia, perhatian, teliti",
    challenges: "Sering mengorbankan diri dan susah bilang tidak",
  },
  ISTP: {
    type: "ISTP",
    nickname: "The Virtuoso",
    description:
      "Kamu adalah pemecah masalah yang suka eksperimen. Praktis, mandiri, dan suka kebebasan.",
    strengths: "Analitis, tenang, fleksibel",
    challenges: "Kurang ekspresif dan bisa cenderung impulsif",
  },
  ISFP: {
    type: "ISFP",
    nickname: "The Adventurer",
    description:
      "Kamu adalah jiwa bebas yang menghargai estetika dan pengalaman pribadi. Lembut tapi punya pendirian sendiri.",
    strengths: "Sensitif, artistik, penuh kasih",
    challenges: "Cenderung tertutup dan menghindari konflik",
  },
  ESTP: {
    type: "ESTP",
    nickname: "The Entrepreneur",
    description:
      "Kamu suka hidup di momen sekarang dan penuh aksi. Cepat berpikir dan pandai beradaptasi.",
    strengths: "Spontan, berani, pragmatis",
    challenges: "Kurang suka rutinitas dan suka ambil risiko",
  },
  ESFP: {
    type: "ESFP",
    nickname: "The Entertainer",
    description:
      "Kamu adalah jiwa sosial yang suka membuat orang lain tertawa dan merasa nyaman. Hidup penuh warna dan energi.",
    strengths: "Ramah, optimis, penuh semangat",
    challenges: "Susah fokus dan cenderung impulsif",
  },
  ESTJ: {
    type: "ESTJ",
    nickname: "The Executive",
    description:
      "Kamu suka memimpin dan menegakkan aturan. Praktis dan suka ketertiban.",
    strengths: "Tegas, tangguh, efisien",
    challenges: "Keras kepala dan kurang empati",
  },
  ESFJ: {
    type: "ESFJ",
    nickname: "The Consul",
    description:
      "Kamu adalah penjaga harmoni yang suka merawat orang lain. Sering jadi perekat dalam kelompok.",
    strengths: "Peduli, setia, bertanggung jawab",
    challenges: "Terlalu bergantung pada opini orang lain",
  },
};

window.mbtiResults = {};
for (const [key, value] of Object.entries(mbtiData)) {
  window.mbtiResults[key] = generateMBTIResult(value);
}
