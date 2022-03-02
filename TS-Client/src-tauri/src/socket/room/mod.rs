use tokio::sync::RwLock;

use super::client;
use std::{collections::HashMap, sync::Arc, error::Error};

#[derive(Debug)]
pub struct Room {
    name: RwLock<String>,
    members: RwLock<HashMap<String, Arc<client::Client>>>,
}

pub fn new(name: String) -> Arc<Room> {
    Arc::new(Room{
        name: RwLock::new(name), 
        members: RwLock::new(HashMap::new()),
    })
}
// //!
impl Room {
    // returns new string of room name
    pub async fn get_name(&self) -> String {
        self.name.read().await.clone()
    }
    // returns number of members in room
    pub async fn get_size(&self) -> usize {
        self.members.read().await.len()
    }
    // returns a list of the id strings in the room
    pub async fn list_of_member_names(&self) -> Vec<String> {
        let mut names:Vec<String> = Vec::new();
        for client in self.members.read().await.values() {
            names.push(client.get_name().await);
        }
        names
    }
    // returns a list of the key value from room.members
    pub async fn member_iter(&self) -> Vec<(String, Arc<client::Client>)>{
        let mut members:Vec<(String, Arc<client::Client>)> = Vec::new();
        for (id, client) in self.members.read().await.iter() {
            members.push((id.clone(),client.clone()));
        }
        members
    }
    // add a new client to this room
    pub async fn add_member(&self, id:String, client:Arc<client::Client>) {
        self.members.write().await.insert(id, client);
    }
    // remove a client from this room
    pub async fn remove_member(&self, id:&String){
        if self.get_size().await != 0 {
            self.members.write().await.remove(id);
        }; 
    }
    // get a user from this room. returns a result
    pub async fn get_user(&self, id:&String) -> Result<Arc<client::Client>,Box<dyn Error>> {
        let result = self.members.read().await;
        let result = result.get(id).expect("failed to get user from room");
        Ok(result.clone())
    }
}