use image::{load_from_memory, DynamicImage};
use image_webp::WebPEncoder;
use std::io::Cursor;

fn main() -> () {
    let input_path = "assets/fuwamoco_fuwawa_mococo_abyssbard_official-1024x577.jpg";
    let output_path = "assets/fuwamoco_fuwawa_mococo_abyssbard_official.webp";

    // 画像の読み込み
    let picture = std::fs::read(input_path).unwrap();
    let img = load_from_memory(&picture).unwrap();

    // エンコードに必要な情報の抽出
    let (width, height) = (img.width(), img.height());
    let color_type = match img.color() {
        image::ColorType::Rgb8 => image_webp::ColorType::Rgb8,
        image::ColorType::Rgba8 => image_webp::ColorType::Rgba8,
        _ => image_webp::ColorType::Rgba8,
    };

    let data = match img {
        DynamicImage::ImageRgba8(rgba_img) => rgba_img.into_raw(),
        DynamicImage::ImageRgb8(rgb_img) => rgb_img.into_raw(),
        _ => img.to_rgba8().into_raw(), // デフォルトでRGBAに変換
    };

    // 画像の出力
    let mut output_picture = Vec::new();
    let encoder: WebPEncoder<Cursor<&mut _>> = WebPEncoder::new(Cursor::new(&mut output_picture));
    encoder.encode(&data, width, height, color_type).unwrap();
    println!("{:?}", output_picture);
}
