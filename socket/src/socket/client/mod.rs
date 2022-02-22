use std::{collections::HashMap, sync::Arc};

use super::server;
use futures::StreamExt;
use futures::{stream::SplitStream};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use tokio::sync::{mpsc, RwLock};
use warp::ws::{Message, WebSocket};
use super::{helper,room};

// type Users = Arc<RwLock<HashMap<String,Client>>>;
#[derive(Debug)]
pub struct Client {
    tx: mpsc::UnboundedSender<Result<Message, warp::Error>>,
    pub user_rx: RwLock<SplitStream<WebSocket>>,
    my_id: RwLock<String>,
    name: RwLock<String>,
    room_name: RwLock<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Type {
    NULL,
    UNKNOWN,
    ERROR,
    OPEN,
    JOIN,
    LEAVE,
    UNAME,
    RNAME,
    ECHO,
    DISCONNECT,
}
impl Type {
    fn as_str(&self) -> &'static str {
        match self {
            Type::NULL => "NULL",
            Type::UNKNOWN => "UNKNOWN",
            Type::ERROR => "ERROR",
            Type::OPEN => "OPEN",
            Type::JOIN => "JOIN",
            Type::LEAVE => "LEAVE",
            Type::UNAME => "UNAME",
            Type::RNAME => "RNAME",
            Type::ECHO => "ECHO",
            Type::DISCONNECT => "DISCONNECT",
        }
    }
    fn to_string(&self) -> String {
        self.as_str().to_string()
    }
}
#[derive(Debug, Serialize, Deserialize)]
pub struct Command {
    r#type: Type,
    data: Value,
    sender: String,
}

impl Command {
    pub fn new(r#type: Type, data: Value, sender:String) -> Self {
        Command { r#type, data, sender }
    }
    fn error() -> Self {
        Command {r#type: Type::ERROR, data: Value::Null, sender:String::from("server")}
    }
    pub fn to_string(&self) -> String {
        json!({"type": self.r#type, "data": self.data, "sender":self.sender}).to_string()
    }
}
pub fn new_command(data_string: &String, sender:String) -> Command {
    let value: Value = serde_json::from_str(data_string).unwrap_or_else(|e| {
        println!(
            "----Error getting object from client message\n{}----",
            e.to_string()
        );
        Value::Null
    });
    let rtype = match value.get("type") {
        Some(x) => x.as_str().unwrap_or_else(|| "ERROR"),
        None => Type::ERROR.as_str(),
    };
    let rtype = match rtype {
        "NULL" => Type::NULL,
        "UNKNOWN" => Type::UNKNOWN,
        "ERROR" => Type::ERROR,
        "OPEN" => Type::OPEN,
        "JOIN" => Type::JOIN,
        "LEAVE" => Type::LEAVE,
        "UNAME" => Type::UNAME,
        "RNAME" => Type::RNAME,
        "ECHO" => Type::ECHO,
        "DISCONNECT" => Type::DISCONNECT,
        _ => Type::UNKNOWN,
    };
    let data = match value.get("data") {
        Some(x) => x.clone(),
        None => Value::String(Type::NULL.to_string()),
    };

    Command {
        r#type: rtype,
        data: data,
        sender:sender
    }
}

pub fn new(
    tx: mpsc::UnboundedSender<Result<Message, warp::Error>>,
    user_rx: SplitStream<WebSocket>,
    my_id: String,
) -> Arc<Client> {
    Arc::new(Client {
        tx,
        user_rx: RwLock::new(user_rx),
        my_id: RwLock::new(my_id),
        name: RwLock::new(String::new()),
        room_name: RwLock::new(String::new()),
    })
}

impl Client {
    // returns new string of client name
    pub async fn get_name(&self) -> String {
        self.name.read().await.clone()
    }
    // returns the current room this client is in
    pub async fn get_room_name(&self) -> String {
        self.room_name.read().await.clone()
    }
    // set this client's name
    pub async fn set_name(&self, name: &String) {
        *self.name.write().await = name.clone();
    }
    // get a string of this client's id
    pub async fn get_id(&self) -> String {
        self.my_id.read().await.clone()
    }
    // set this client room name
    pub async fn set_room_name(&self, name: &String) {
        *self.room_name.write().await = name.clone();
    }
    // reset client string to ""
    pub async fn reset_room_name(&self) {
        *self.room_name.write().await = String::new();
    }
    // send message to client
    pub fn send(&self, message: Message) {
        self.tx.send(Ok(message)).expect("failed to send message to client");
    }

    // Reading and broadcasting messages to and from this client
    pub async fn read_input(&self, server: &Arc<RwLock<server::Server>>) {
        let mut DISCONNECT = false;
        let mut x;
        {
            x = self.user_rx.write().await;
        }
        let user_id = self.get_id().await;
        let user;
        {

            let server = server.read().await;
            user = server.get_user(&user_id).await.unwrap();
        }
        while let Some(result) = x.next().await {
            let room_id = self.get_room_name().await;
            let room;
            {
                let room_result = server.read().await.get_room(&room_id).await;
                room = if room_result.is_ok() {
                    let room_result = room_result.unwrap();
                    println!("There is a room {} -- size {}",room_id, room_result.get_size().await);
                    room_result
                }else { 
                    println!("There is no room {}",room_id);
                    room::new(String::new())
                }
            }
            println!("list of rooms {:?}", server.read().await.list_rooms().await);
            let result = result.unwrap_or_else(|e| {
                println!("--{}--", e.to_string());
                Message::text("error")
            });
            let raw_result = result.to_str().unwrap_or_else(|()| "Error!").to_string();
            if raw_result != "Error!" {
                let value = new_command(&raw_result, user_id.clone());
                let data = value.data.to_string();
                let user_name = self.get_name().await;
                match value.r#type {
                    //sends back error for error message or unknown case
                    Type::ERROR | Type::UNKNOWN => {
                        println!("----------error or unknown type in command------------");
                        self.send(Message::text(Command::error().to_string()));
                    }
                    // if no data or string too small returns the current name, else sets the name and returns it to client
                    Type::UNAME => {
                        if !helper::empty_data(&data)
                        {
                            let name = helper::trim(1,&data);
                            self.set_name(&name).await;
                        }
                        self.send(Message::text(Command::new(value.r#type,Value::String(self.get_name().await), user_id.clone()).to_string()));
                    }
                    // maybe not needed
                    Type::RNAME => {
                        if !helper::empty_data(&data)
                        {
                            self.set_room_name(&data).await;
                        }
                        self.send(Message::text(Command::new(value.r#type,Value::String(self.get_name().await), user_id.clone()).to_string()));
                    }
                    // joins the room if exists else creates the room
                    Type::JOIN => {
                        if !helper::empty_data(&data){
                            let name = helper::trim(1,&data);
                            // room is there so we add our user to the room 
                            let new_room;
                            {
                                let new_room_name;
                                let result_room;
                                {
                                    let result = server.read().await.get_room(&name).await;
                                    new_room_name = if result.is_ok() {
                                        result_room = result.unwrap();
                                        result_room.get_name().await
                                    } else {
                                        result_room = room::new(String::new());
                                        String::new()
                                    };
                                }

                                new_room = if !new_room_name.is_empty() {
                                    println!("--cloning room--"); 
                                    result_room.clone()
                                } else {
                                    println!("--creating new room with name {}--",name); 
                                    server.write().await.add_new_room(&name).await
                                };
                            }
                            new_room.add_member(self.get_id().await, user.clone()).await;
                            self.set_room_name(&name).await;
                            let users = new_room.member_iter().await.iter().filter(|(k,_)| {
                                println!("{} vs {}", k, user_id);
                                true
                            }).cloned().collect::<Vec<(String,Arc<Client>)>>();
                            println!("data name from client {} -- {}\nid from server func {}",name, name.len(), room_id);
                            helper::broadcast_msg(Message::text(Command::new(Type::ECHO,Value::String(format!("{} has joined the room {}", user_name,name).to_string()),user_id.clone()).to_string()), users)
                        }else {
                            // data is too small
                            self.send(Message::text(Command::error().to_string()))
                        }
                    }
                    Type::ECHO => {
                        if !helper::empty_data(&data){

                            if !room.get_name().await.is_empty() {
                                let users = room.member_iter().await.iter().filter(|(k,_)| k != &user_id).cloned().collect::<Vec<(String,Arc<Client>)>>();
                                helper::broadcast_msg(Message::text(Command::new(Type::ECHO,value.data,user_id.clone()).to_string()),users);
                            }else{ 
                                self.send(Message::text(Command::error().to_string()));
                            }
                        }
                    }
                    Type::LEAVE => {
                        if !room.get_name().await.is_empty(){
                            room.remove_member(&user_id).await;
                            let users = room.member_iter().await;
                            helper::broadcast_msg( Message::text( Command::new( Type::LEAVE,Value::String( format!("{} has left the room",user_name).to_string() ), user_id.clone() ).to_string() ), users )
                        }else{ 
                            self.send(Message::text(Command::error().to_string()));
                        }
                    }
                    Type::DISCONNECT => {
                        server.read().await.disconnect(&user).await;
                        DISCONNECT = true;
                    }
                    _ => println!("-------error understanding command type-------"),
                }
            } else {
                println!("-----error unwraping message from a client--------");
            }
        }
        println!("done with messages");
        if !DISCONNECT {
            server.read().await.disconnect(&user).await;
        }
    }
}
