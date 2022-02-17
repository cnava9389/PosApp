// use tokio::{
//     io::{AsyncBufReadExt, AsyncWriteExt, BufReader},
//     net::TcpListener,
//     sync::broadcast,
// };

// #[tokio::main]
// async fn main() {
//     println!("Hello, world!");

//     // listening on local network on port 8000
//     let listener = TcpListener::bind("10.0.0.182:9000").await.unwrap();
//     // returns sender (tx) and receiver (rx)
//     let (tx, _rx) = broadcast::channel(10);

//     loop {
//         let (mut socket, addr) = listener.accept().await.unwrap();
//         println!("accepted connection");

//         let tx = tx.clone();
//         let mut rx = tx.subscribe();

//         tokio::spawn( async move {
//             let (reader, mut writer) = socket.split();

//             let mut reader = BufReader::new(reader);
//             let mut line = String::new();

//             loop {
//                 tokio::select! {
//                     result = reader.read_line(&mut line) => {
//                         if result.unwrap() == 0 {
//                             break;
//                         }
//                         tx.send((line.clone(), addr)).unwrap();
//                         line.clear();
//                     }
//                     result = rx.recv() => {
//                         let (msg, other_addr) = result.unwrap();

//                         if addr != other_addr {
//                             writer.write_all(msg.as_bytes()).await.unwrap();
//                         }
//                     }
//                 }
//             }
//         });
//     }
// }

mod socket;

use futures::StreamExt;
use std::env;
// use std::fs;
use std::net::SocketAddr;
use std::{collections::HashMap, sync::Arc};
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::ws::{WebSocket};
use warp::Filter;
use socket::{client, server, helper};
use uuid::Uuid;

// static NEXT_USERID: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(1);

type Users<'a> = Arc<RwLock<HashMap<&'a String, &'a client::Client>>>;
type echoServer = Arc<RwLock<server::Server>>;

#[tokio::main]
async fn main() {
    // gets args that are included when this file is run and sets that as the host:port or else a default is set
    let addr = env::args().nth(1).unwrap_or_else(|| "127.0.0.1:9000".to_string());
    // parses socket address from addr
    let socket_addr: SocketAddr = addr.parse().expect("valid socket address");

    let users = Users::default();
    let users = warp::any().map(move || users.clone());

    let server: echoServer = Arc::new(RwLock::new(server::new(HashMap::new())));
    let server = warp::any().map(move || server.clone());

    let opt = warp::path::param::<String>()
        .map(Some)
        .or_else(|_| async { Ok::<(Option<String>,), std::convert::Infallible>((None,)) });

    // GET /hello/warp => 200 OK with body "Hello, warp!"
    let hello = warp::path("hello")
        .and(opt)
        .and(warp::path::end())
        .map(|name: Option<String>| {
            format!("Hello, {}!", name.unwrap_or_else(|| "world".to_string()))
        });

    // GET /ws 
    let chat = warp::path("ws")
        .and(warp::ws())
        .and(users)
        .and(server)
        .map(|ws: warp::ws::Ws, users, server| ws.on_upgrade(move |socket| connect(socket, users, server)));

    // not found page
    let res_404 = warp::any().map(|| {
        warp::http::Response::builder()
            .status(warp::http::StatusCode::NOT_FOUND)
            .body("404 Not Found!")
    });

    // add all routes together. can modularize even further
    let routes = chat.or(hello).or(res_404);

    // serving routes at socket address
    let server = warp::serve(routes).try_bind(socket_addr);

    println!("Running server at {}!", addr);

    server.await
}

// function that handles websocket connection
async fn connect(ws: WebSocket, users: Users, server: echoServer) {
    // Bookkeeping
    let my_id: &String = Uuid::new_v4().to_string();
    println!("Welcome User {}", my_id);

    // Establishing a connection
    let (user_tx, user_rx) = ws.split();
    let (tx, rx) = mpsc::unbounded_channel();

    let rx = UnboundedReceiverStream::new(rx);

    tokio::spawn(rx.forward(user_tx));

    let client = client::new(tx,"".to_string());
    
    // inserts this connection as new user in map
    users.write().await.insert(&my_id, &client);

    // Reading and broadcasting messages
    client.read_input(user_rx, &users).await;

    // Disconnect
    helper::disconnect(&my_id, &users).await;
}

