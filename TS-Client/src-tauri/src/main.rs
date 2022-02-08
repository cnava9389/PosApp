#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
use serde::{Serialize, Deserialize};
use online::check;
use rusqlite::{ params, Connection, Result };
use std::sync::{Arc, Mutex};
use lazy_static::lazy_static;

lazy_static! {
  static ref CONNECTION: Arc<Mutex<Connection>> = Arc::new(Mutex::new(Connection::open("./store.db3".to_string()).expect("Unable to open store.db3")));
}

#[derive(Debug, Serialize, Deserialize)]
struct Config {
  status: String,
}

///! need to add Custom and deleted at byte array or blob
#[derive(Debug, Serialize, Deserialize)]
struct Item {
  id: i32,
  name: String,
  price: f64,
  r#type: String,
  description: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct OrderItem {
  qty: i32,
  name: String,
  price: f64,
  r#type: String,
  description: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Order {
  id: i32,
  credit: bool,
  created_at: String,
  employee: String,
  items: String,
  name: String,
  paid: bool,
  r#type: String,
  description: String,
  sub_total: f64,
  tax: f64
}

#[derive(Debug, Serialize, Deserialize)]
struct OrderResponse {
  id: i32,
  credit: bool,
  dateTime: String,
  employee: String,
  items: serde_json::Value,
  name: String,
  paid: bool,
  r#type: String,
  description: String,
  sub_total: f64,
  tax: f64
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
      CREDIT BOOLEAN DEFAULT FALSE,
      CREATEDAT TEXT,
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
  return true
}

#[tauri::command]
fn create_item(name:&str, price:f64, js_type:&str, description:&str) -> usize{
  let db = CONNECTION.lock().unwrap();

  let mut id = 0;
  let mut stmt = db.prepare(
    "INSERT INTO items (name, price, type, description) VALUES (?1, ?2, ?3, ?4) RETURNING id"
  ).unwrap();
  let mut rows = stmt.query(params![name, price, js_type, description]).unwrap();
  while let Some(row) = rows.next().expect("while row failed") {
    id=row.get(0).expect("get row failed");
}
  return id;
}

#[tauri::command]
fn delete_item(item_id: i8) -> bool {
  let db = CONNECTION.lock().unwrap();

  db.execute("DELETE FROM items WHERE id = ?1",params![item_id]).expect("failed to delet item");
  return true;
}

#[tauri::command]
fn get_items() -> Result<Vec<Item>,()> {
  let db = CONNECTION.lock().unwrap();
  let mut stmt = db.prepare("SELECT * FROM items").unwrap();
  let rows = stmt.query_map([], |row| {
    let id: i32 = row.get(0)?;
    let name: String = row.get(1)?;
    let price: f64 = row.get(2)?;
    let js_type: String = row.get(3)?;
    let description: String = row.get(4)?;
    Ok(Item{id:id,name:name,price:price,r#type:js_type,description:description})
  }).unwrap();
  let mut items: Vec<Item> = Vec::new();
  for item in rows {
    items.push(item.unwrap());
  }
  Ok(items.into())
  // return items;
}

#[tauri::command]
fn get_orders() -> Result<Vec<OrderResponse>, ()>{
  let db = CONNECTION.lock().unwrap();
  let mut stmt = db.prepare("SELECT * FROM orders").unwrap();
  let rows = stmt.query_map([], |row| {
    let id: i32 = row.get(0)?;
    let credit: bool = row.get(1)?;
    let created_at: String = row.get(2)?;
    let description: String = row.get(3)?;
    let employee: String = row.get(4)?;
    let items: String = row.get(5)?;
    let name: String = row.get(6)?;
    let paid: bool = row.get(7)?;
    let sub_total: f64 = row.get(8)?;
    let tax: f64 = row.get(9)?;
    let js_type: String = row.get(10)?;
    Ok(Order{id: id, description: description, employee: employee, items: items,
    credit:credit,created_at:created_at,name: name, paid: paid,
  sub_total: sub_total, tax: tax, r#type:js_type})
  }).unwrap();
  let mut orders: Vec<OrderResponse> = Vec::new();
  for order in rows {
    
    let object_items: serde_json::Value = serde_json::from_str(&order.as_ref().unwrap().items).unwrap();
    let new_order = OrderResponse{ 
      id: order.as_ref().unwrap().id,
     credit: order.as_ref().unwrap().credit,
     dateTime: order.as_ref().unwrap().created_at.clone(),
     description: order.as_ref().unwrap().description.clone(),
     employee: order.as_ref().unwrap().employee.clone(),
     items: object_items,
     name: order.as_ref().unwrap().name.clone(),
     paid: order.as_ref().unwrap().paid,
     sub_total: order.as_ref().unwrap().sub_total,
     tax: order.as_ref().unwrap().tax,
     r#type: order.as_ref().unwrap().r#type.clone(),
    };
    orders.push(new_order);
  }
  Ok(orders.into())

}

#[tauri::command]
fn create_order(credit:bool, date_time:String, description:String, employee:String,items: Vec<OrderItem>,
  name:String, paid:bool, sub_total:f64, tax:f64, js_type:String) -> usize {
  let o_items = serde_json::to_string(&items).unwrap();
  println!("{0} {1} {2} {3} {4} {5} {6}",serde_json::to_string(&items).unwrap(),date_time,description,paid,sub_total,js_type,tax);
  for x in items {
    println!("{0} {1} {2} {3} {4}",x.r#type, x.qty, x.name, x.description, serde_json::to_string(&x).unwrap());
  }
  let db = CONNECTION.lock().unwrap();

  let mut id = 0;
  let mut stmt = db.prepare(
    "INSERT INTO orders (credit, createdat, description, employee, items, name, paid, subtotal, tax, type)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10) RETURNING id"
  ).unwrap();
  let mut rows = stmt.query(params![credit, date_time, description, employee, o_items, name, 
  paid, sub_total, tax, js_type]).unwrap();
  while let Some(row) = rows.next().expect("while row failed") {
    id=row.get(0).expect("get row failed");
  }
  return id;
}

#[tauri::command]
fn test_fn() {

}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![hello_world, is_native, check_db_config,
      is_online, initiate_db, create_item, delete_item, get_items, get_orders, create_order,
      test_fn])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
