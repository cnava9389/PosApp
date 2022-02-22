use warp::ws::{Message};
use std::{sync::Arc};
use super::{client};
// use futures::stream::SplitStream;
// use futures::StreamExt;
// use warp::ws::{WebSocket};
// use serde_json::{ Value};

// broadcasts a msg to all users
pub fn broadcast_msg(msg: Message, users: Vec<(String, Arc<client::Client>)>) {
    if let Ok(_) = msg.to_str() {
        for (_uid, client) in users {
            client.send(msg.clone());
        }
    }
}

pub fn string_too_small(data: &String) -> bool {
    (*data == String::from("\"\""))
                            | (*data == String::from("{}"))
                            | (data.len() < 3)
}

pub fn empty_data(data: &String) -> bool {
    data.is_empty() & (*data != String::from("\"\"")) & (*data != String::from("{}"))
}

pub fn trim(spaces:usize, data: &String) -> String {
    let mut name = data.as_str();
    name = &name[spaces..name.len()-spaces];
    name.to_string()
}

// // disconnects user
// pub async fn disconnect(my_id: &String, server: Arc<RwLock<server::Server>>) {
//     server.write().await.remove_user(my_id);
//     println!("Good bye user {}", my_id);
// }

// pub async fn read_input<'a>(mut user_rx: SplitStream<WebSocket>, server: &Arc<RwLock<server::Server<'a>>>) {
//     println!("reading input");
//     // Reading and broadcasting messages
//     while let Some(result) = user_rx.next().await {
//         let result = result.unwrap();
//         let result = result.to_str().unwrap_or_else(|()|"Error!");
//         if result != "Error!"{
//             let value:Value = serde_json::from_str(result).unwrap_or_else(|_|Value::Null);
//             println!("{:?}",value);
//             {
//                 let server = server.read().await;
//                 let users = server.user_iter();
//                 broadcast_msg(Message::text(value.to_string()), users).await;
//             }
//         }else {
//             println!("error unwraping message for a client");
//         }
//     }
//     println!("done with messages");
// }