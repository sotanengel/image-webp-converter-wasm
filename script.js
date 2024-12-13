import init, {
  convert_image_to_webp,
} from "./pkg/image_webp_converter_wasm.js";

const dropZone = document.getElementById("dropZone");
const convertBtn = document.getElementById("convertBtn");

let imageData = null;
let imageName = "";

// WASMの初期化
init().then(() => {
  console.log("WASM Module Loaded");
});

// ドロップイベントの処理
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.style.backgroundColor = "#e1eaff"; // ドラッグ中の色
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.backgroundColor = "";
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.style.backgroundColor = "";

  const file = e.dataTransfer.files[0];
  if (file) {
    handleFile(file);
  }
});

// ファイル処理
function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    imageData = new Uint8Array(e.target.result);
    imageName = file.name; // 元々の画像名を保存
    convertBtn.disabled = false; // 変換ボタンを有効化
  };
  reader.readAsArrayBuffer(file);
}

// ボタンがクリックされた時
convertBtn.addEventListener("click", () => {
  if (!imageData) {
    alert("No image loaded.");
    return;
  }

  // WASMを使ってWebPに変換
  const webpData = convert_image_to_webp(imageData);
  const fileNameWithoutExt = imageName.split(".").slice(0, -1).join("."); // 拡張子を取り除いた元のファイル名
  const webpFileName = `${fileNameWithoutExt}.webp`; // 拡張子を .webp に変更
  downloadFile(webpData, webpFileName);
});

// ファイルのダウンロード
function downloadFile(data, filename) {
  const blob = new Blob([data], { type: "image/webp" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
