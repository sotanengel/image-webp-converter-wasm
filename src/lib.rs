use image::{load_from_memory, DynamicImage};
use image_webp::WebPEncoder;
use std::io::Cursor;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn convert_image_to_webp(input: &[u8]) -> Vec<u8> {
    let img = load_from_memory(input).expect("Failed to load image");

    let (width, height) = (img.width(), img.height());
    let color_type = match img.color() {
        image::ColorType::Rgb8 => image_webp::ColorType::Rgb8,
        image::ColorType::Rgba8 => image_webp::ColorType::Rgba8,
        _ => image_webp::ColorType::Rgb8,
    };

    let data = match img {
        DynamicImage::ImageRgba8(rgba_img) => rgba_img.into_raw(),
        DynamicImage::ImageRgb8(rgb_img) => rgb_img.into_raw(),
        _ => img.to_rgb8().into_raw(),
    };

    // 画像のエンコーディング
    // 圧縮率を見積もる（40% の圧縮後サイズを予測）
    let estimated_size = match color_type {
        image_webp::ColorType::Rgb8 => (width * height * 3) * 30 / 100, // RGB: 3バイト/ピクセル
        image_webp::ColorType::Rgba8 => (width * height * 4) * 30 / 100, // RGBA: 4バイト/ピクセル
        _ => (width * height * 3) * 30 / 100,
    };
    let mut output_picture = Vec::with_capacity((estimated_size + 1024) as usize); // バッファを余裕を持たせて初期化

    let encoder: WebPEncoder<Cursor<&mut _>> = WebPEncoder::new(Cursor::new(&mut output_picture));
    encoder.encode(&data, width, height, color_type).unwrap();

    output_picture
}
