use warp::ws::{Message};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::{RwLock};
use super::client;

type Users = Arc<RwLock<HashMap<String, client::Client>>>;

// broadcasts a msg to all users
pub async fn broadcast_msg(msg: Message, users: &Users) {
    if let Ok(_) = msg.to_str() {
        for (_uid, client) in users.read().await.iter() {
            client.tx.send(Ok(msg.clone())).expect("Failed to send message");
        }
    }
}

// disconnects user
pub async fn disconnect(my_id: String, users: &Users) {
    println!("Good bye user {}", my_id);

    users.write().await.remove(&my_id);
}