// assets/js/firebaseMain.js
import { db } from "./firebase-config.js";
import {
  ref,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

export function simpanDataMBTI(hasil) {
  const hasilRef = ref(db, "hasilTes/mbti/");
  const newHasilRef = push(hasilRef);
  set(newHasilRef, {
    hasil: hasil,
    waktu: Date.now(),
  })
    .then(() => {
      console.log("Hasil MBTI berhasil disimpan");
    })
    .catch((error) => {
      console.error("Gagal simpan:", error);
    });
}
