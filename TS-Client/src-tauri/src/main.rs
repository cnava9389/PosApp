#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
use serde::{Serialize, Deserialize};
use online::check;
use rusqlite::{ Connection};
use std::sync::{Arc, Mutex};
use lazy_static::lazy_static;

lazy_static! {
  static ref CONNECTION: Arc<Mutex<Connection>> = Arc::new(Mutex::new(Connection::open("./src/store.db3".to_string()).expect("Unable to open store.db3")));
}

#[derive(Debug, Serialize, Deserialize)]
struct Config {
  status: String,
}


#[tauri::command]
fn hello_world() -> String {
  return "hello world".into()
}
#[tauri::command]
fn is_native() -> bool {
  return true.into()
}

#[tauri::command]
fn check_db_config() -> Config {
  let config = Config { status:"Test".to_string() };
  return config.into()
}

#[tauri::command]
async fn is_online() -> bool {
  return check(None).await.is_ok();
}

#[tauri::command]
fn initiate_db()-> bool{
  let path = "./src/store.db3";
  let db = Connection::open(&path);
  match db {
    Ok(_) => return true,
    Err(_) => return false,
  }
}

#[tauri::command]
fn test_fn() {
  let db = CONNECTION.lock().unwrap();
  match db.execute(
    "CREATE TABLE if not exists metadata(
      ID INTEGER PRIMARY KEY NOT NULL,
      BUSINESS TEXT UNIQUE NOT NULL,
      BUSINESS_CODE TEXT UNIQUE NOT NULL,
      EMAIL TEXT UNIQUE,
      PHONE TEXT UNIQUE,
      NAME TEXT
    )",[]) {
    Ok(_) => (),
    Err(err) => println!("error: {:?}",err),
  }
  match db.execute(
    "CREATE TABLE if not exists items(
      ID INTEGER PRIMARY KEY NOT NULL,
      NAME TEXT NOT NULL,
      PRICE REAL,
      TYPE TEXT NOT NULL,
      DESCRIPTION TEXT,
      DELETEDAT BLOB,
      CUSTOM BLOB
    )",[]) {
    Ok(_) => (),
    Err(err) => println!("error: {:?}",err),
  }
  match db.execute(
    "CREATE TABLE if not exists orders(
      ID INTEGER PRIMARY KEY NOT NULL,
      DELETEAT BLOB,
      CREDIT BOOLEAN DEFAULT FALSE,
      CREATEDAT BLOB,
      DESCRIPTION TEXT,
      EMPLOYEE TEXT,
      ITEMS BLOB,
      NAME TEXT,
      PAID BOOLEAN DEFAULT FALSE,
      SUBTOTAL REAL,
      TAX REAL,
      TYPE TEXT NOT NULL,
      CUSTOM BLOB
    )",[]) {
    Ok(_) => (),
    Err(err) => println!("error: {:?}",err),
  }
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![hello_world, is_native, check_db_config, is_online, initiate_db, test_fn])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
