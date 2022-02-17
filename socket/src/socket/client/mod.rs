use futures::stream::SplitStream;
use tokio::sync::{mpsc};
use warp::ws::{Message, WebSocket};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::{RwLock};
use futures::StreamExt;
use super::helper;

type Users = Arc<RwLock<HashMap<String, Client>>>;

#[derive(Debug)]
pub struct Client {
    pub tx: mpsc::UnboundedSender<Result<Message, warp::Error>>, 
    name: String,
}

pub fn new(tx: mpsc::UnboundedSender<Result<Message, warp::Error>>, name: String) -> Client {
        println!("client created");
        Client {
            tx,
            name,
        }
    }

impl Client {
    pub async fn read_input(&self, mut user_rx: SplitStream<WebSocket>, users: &Users) {
        // Reading and broadcasting messages
        while let Some(result) = user_rx.next().await {
            helper::broadcast_msg(result.expect("Failed to fetch message"), users).await;
        }
    }
}