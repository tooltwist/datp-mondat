#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

// use tauri::{ Menu, Submenu, MenuItem, CustomMenuItem };


fn main() {
  // See https://developpaper.com/throw-away-electron-and-embrace-tauri-based-on-rust/
  // let submenu_gear = Submenu::new(
  //   "Gear",
  //   Menu::new()
  //     .add_native_item(MenuItem::Copy)
  //     .add_native_item(MenuItem::Paste)
  //     .add_native_item(MenuItem::Separator)
  //     .add_native_item(MenuItem::Zoom)
  //     .add_native_item(MenuItem::Separator)
  //     .add_native_item(MenuItem::Hide)
  //     .add_native_item(MenuItem::CloseWindow)
  //     .add_native_item(MenuItem::Quit),
  // );
  // let close = CustomMenuItem::new("close".to_string(), "Close");
  // let quit = CustomMenuItem::new("quit".to_string(), "Quit");

  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
