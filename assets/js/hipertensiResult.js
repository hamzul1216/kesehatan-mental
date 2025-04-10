function generateHipertensiResult({ type, message, tips, videos }) {
  const videoEmbeds = videos
    .map(
      (url) => `
        <div class="video-wrapper">
          <iframe width="100%" height="200" src="${url}" frameborder="0" allowfullscreen></iframe>
        </div>
      `
    )
    .join("");

  return `
    <div class="result-container fade-in">
      <div class="card-logos" style = "margin-bottom : 2rem;">
        <img src="/assets/img/Desain-tanpa-judul-1.png" alt="Logo 2" class="logo">
      </div>
      <h2 class="result-heading">Hasil Tes Hipertensi Kamu</h2>
      <div class="result-card">
        <div class="info-wrapper">
          <p class="result-title">Hasil: ${type}</p>
          <p class="desc-main">${message}</p>
          <div class="result-description">
            <h3>TIPS!</h3>
            <p>${tips}</p>
            ${videoEmbeds}
          </div>
          <div style="max-width: 800px; margin: 2rem auto; border: 1px solid #ccc; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <iframe 
              src="https://drive.google.com/file/d/1YKArfDVKvLQv6ju6HjcD7OxcWI-f2KGL/preview" 
              width="100%" 
              height="600px" 
              style="border: none;"
              allowfullscreen>
            </iframe>
          </div>
          <div class="share">
            <p>Yuk, Bagikan hasil tesmu!</p>
            <img class="share-icon" onclick="shareResult()" src="../assets/svg/share.svg" alt="Clipboard" width="24" height="24" />
          </div>
        </div>
        <button class="card-button" onclick="location.reload()">Coba Lagi</button>
        </div>
        <div class="footer-politeknik">
          <p>Politeknik Kesehatan Kementrian Kesehatan</p>
          <p>Profesi Ners 2025</p>
          <p>Kelompok 3 Reguler 2</p>
        </div>
    </div>
  `;
}

const hipertensiData = {
  positive: {
    type: "Beresiko Hipertensi",
    message:
      "Segera lakukan pemeriksaan lebih lanjut ke pelayanan fasilitas kesehatan terdekat.",
    tips: "Pencegahan dan penanganan Tekanan Darah Tinggi dapat dilihat di bawah ini:",
    videos: [
      "https://www.youtube.com/embed/cghXs8sIa_A?si=DHceg46SD7HwveHv",
      "https://www.youtube.com/embed/xPjrZYSg1Ec?si=IObpvlPtFQktk1pq",
      "https://www.youtube.com/embed/cghXs8sIa_A?si=DHceg46SD7HwveHv",
      "https://www.youtube.com/embed/xPjrZYSg1Ec?si=IObpvlPtFQktk1pq",
    ],
  },
  negative: {
    type: "Tidak Beresiko Hipertensi",
    message:
      "Tetap lanjutkan pemeriksaan secara rutin di fasilitas kesehatan terdekat.",
    tips: "Pencegahan dan penanganan Tekanan Darah Tinggi dapat dilihat di bawah ini:",
    videos: [
      "https://www.youtube.com/embed/cghXs8sIa_A?si=DHceg46SD7HwveHv",
      "https://www.youtube.com/embed/xPjrZYSg1Ec?si=IObpvlPtFQktk1pq",
      "https://www.youtube.com/embed/cghXs8sIa_A?si=DHceg46SD7HwveHv",
      "https://www.youtube.com/embed/xPjrZYSg1Ec?si=IObpvlPtFQktk1pq",
    ],
  },
};

window.hipertensiResults = {};
for (const [key, value] of Object.entries(hipertensiData)) {
  window.hipertensiResults[key] = generateHipertensiResult(value);
}
