import init, {
  convert_image_to_webp,
} from "./pkg/image_webp_converter_wasm.js";

const fileInput = document.getElementById("fileInput");
const convertBtn = document.getElementById("convertBtn");

let images = []; // 複数画像を格納

// WASMの初期化
init().then(() => {
  console.log("WASM Module Loaded");
});

// ファイル選択イベントの処理
fileInput.addEventListener("change", (e) => {
  const files = e.target.files;
  if (files.length > 0) {
    handleFiles(files);
  }
});

// 複数のファイルを処理する
function handleFiles(files) {
  images = []; // 画像のリストを初期化

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith("image/")) {
      alert("Please upload only image files.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = new Uint8Array(e.target.result);
      images.push({ data: imageData, name: file.name });
      if (images.length === files.length) {
        convertBtn.disabled = false; // すべてのファイルが読み込まれたら変換ボタンを有効化
      }
    };
    reader.readAsArrayBuffer(file);
  }
}

// 変換ボタンがクリックされた時
convertBtn.addEventListener("click", async () => {
  if (images.length === 0) {
    alert("No images loaded.");
    return;
  }

  const zip = new JSZip(); // 新しいZIPを作成

  for (const image of images) {
    const { data, name } = image;
    const webpData = convert_image_to_webp(data);

    const fileNameWithoutExt = name.split(".").slice(0, -1).join(".");
    const webpFileName = `${fileNameWithoutExt}.webp`;

    // ZIPにWebPファイルを追加
    zip.file(webpFileName, webpData);
  }

  // ZIPファイルを作成してダウンロード
  zip.generateAsync({ type: "blob" }).then((content) => {
    const a = document.createElement("a");
    const url = URL.createObjectURL(content);
    a.href = url;
    a.download = "converted_images.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
