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
        _ => image_webp::ColorType::Rgba8,
    };

    let data = match img {
        DynamicImage::ImageRgba8(rgba_img) => rgba_img.into_raw(),
        DynamicImage::ImageRgb8(rgb_img) => rgb_img.into_raw(),
        _ => img.to_rgba8().into_raw(),
    };

    let mut output_picture = Vec::new();
    let encoder: WebPEncoder<Cursor<&mut _>> = WebPEncoder::new(Cursor::new(&mut output_picture));
    encoder.encode(&data, width, height, color_type).unwrap();

    output_picture
}
