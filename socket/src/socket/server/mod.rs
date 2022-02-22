use serde_json::Value;
use tokio::sync::RwLock;
use warp::ws::Message;

use super::{room, client, helper};
use std::{collections::{HashMap}, sync::Arc, io::Error};


#[derive(Debug)]
pub struct Server {
    rooms: RwLock<HashMap<String, Arc<room::Room>>>,
    users: RwLock<HashMap<String, Arc<client::Client>>>
}

pub fn new() -> Server {
    Server {
        rooms: RwLock::new(HashMap::new()),
        users: RwLock::new(HashMap::new()),
    }
}
// //!
impl Server {
    // adds a new room to server's hashmap
    pub async fn add_new_room(&self, name: &String) -> Arc<room::Room> {
        let room = room::new(name.clone());
        self.rooms.write().await.insert(name.clone(), room.clone());
        room
    }
    // deletes room from rooms hashmap
    pub async fn delete_room(&self, name: &String) {
        self.rooms.write().await.remove(name);
    }
    // returns result containing the room or an error
    pub async fn get_room(&self, name: &String) -> Result<Arc<room::Room>,String> {
        let result = self.rooms.read().await;
        let result = result.get(name);
        if result.is_some() {
            let result= result.unwrap();
            Ok(result.clone())
        }else{ Err("failed to get room".to_string())}
    }  
    //  returns result containing the user or room from server.users 
    pub async fn get_user(&self, my_id: &String) -> Result<Arc<client::Client>,Error>{
        let result = self.users.read().await;
        let result = result.get(my_id).expect("failed to get room from server");
        Ok(result.clone())
    }
    // returns list of all server rooms
    pub async fn list_rooms(&self) -> Vec<String> {
        let mut rooms = Vec::new();
        for room in self.rooms.read().await.values() {
            rooms.push(room.get_name().await);
        }
        rooms

    }
    // inserts user into server.users
    pub async fn insert_user(&self, client: Arc<client::Client>, key: &String) {
        self.users.write().await.insert(key.clone(),client);
    }
    // deletes user from server.users
    pub async fn remove_user(&self, key: &String) {
        self.users.write().await.remove(key);
    }
    // returns list of all key, value from server.users
    pub async fn user_iter(&self) -> Vec<(String, Arc<client::Client>)>{
        let mut users:Vec<(String, Arc<client::Client>)> = Vec::new();
        for (id, client) in self.users.read().await.iter() {
            users.push((id.clone(),client.clone()));
        }
        users
    }
    // if room exists remove user from room and or remove them from server
    pub async fn disconnect(&self, client: &client::Client ) {
        let server_room = client.get_room_name().await;
        let my_id = client.get_id().await;
        if !server_room.is_empty() & (server_room != String::from("\"\"")){
            let room = self.get_room(&server_room).await;
            if room.is_ok(){
                let room = room.unwrap();
                let users = room.member_iter().await.iter().filter(|(k,_)| k != &my_id).cloned().collect::<Vec<(String,Arc<client::Client>)>>();
                room.remove_member(&my_id).await;
                helper::broadcast_msg(Message::text(client::Command::new(client::Type::DISCONNECT,Value::String(format!("{} has Disconnected",my_id).to_string()),client.get_id().await).to_string()),users);
            }
        }
        self.remove_user(&my_id).await;
        println!("Good bye user {}", my_id);
    }
    // checks if user is in room ?should return if they are in or just check
    pub async fn check_user_in_room(&self, id: &String, room_name: &String) -> Result<Arc<room::Room>,String> {
        let room = self.get_room(room_name).await;
        if room.is_ok() {
            let room = room.unwrap();
            let user = room.get_user(id).await;
            if user.is_ok() {  Ok(room) } else { Err("user not in room".to_string()) }
        }else { Err("room does not exist".to_string())}
    }
}