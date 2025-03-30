// Toggle class active

const navbarNav = document.querySelector(".navbar-nav");
document.querySelector("#hamburger-menu").onclick = () => {
  navbarNav.classList.toggle("active");
};

// Klik diluar sidebar untuk menghhilangkan nav
const hamburger = document.querySelector("#hamburger-menu");

document.addEventListener("click", function (e) {
  if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
    navbarNav.classList.remove("active");
  }
});

window.addEventListener("load", function () {
  const preloader = document.getElementById("preloader");

  // Tambahin delay sebelum mulai fade-out
  setTimeout(() => {
    preloader.style.opacity = 0;

    // Tunggu efek fade-out sebelum preloader dihapus
    setTimeout(() => {
      preloader.style.display = "none";
    }, 500); // Sama dengan transition di CSS
  }, 300); // Delay 1 detik sebelum mulai fade-out
});
