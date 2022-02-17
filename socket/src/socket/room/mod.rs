use super::client;
use std::{collections::HashMap};

#[derive(Debug)]
pub struct Room {
    name: String,
    members: HashMap<String,client::Client>,
}

pub fn new(name: String, members: HashMap<String,client::Client>) -> Room {
    Room{
        name, 
        members,
    }
}

impl Room {

}