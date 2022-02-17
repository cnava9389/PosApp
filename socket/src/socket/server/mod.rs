use super::{room, client};
use std::{collections::HashMap};
use tokio::sync::{mpsc};
use warp::ws::{Message};
#[derive(Debug)]
pub struct Server {
    rooms: HashMap<String, room::Room>,
}

pub fn new(rooms: HashMap<String, room::Room>) -> Server {
    Server {
        rooms,
    }
}

impl Server {

}