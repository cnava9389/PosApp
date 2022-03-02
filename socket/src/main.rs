mod socket;

use futures::StreamExt;
use std::env;
// use std::fs;
use std::net::SocketAddr;
use std::{sync::Arc};
use tokio::sync::{mpsc, RwLock};
use tokio_stream::wrappers::UnboundedReceiverStream;
use warp::ws::{WebSocket};
use warp::Filter;
use socket::{client, server};
use uuid::Uuid;
use dotenv;

// static NEXT_USERID: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(1);

// type Users = Arc<RwLock<HashMap<String,client::Client>>>;
type echoServer = Arc<RwLock<server::Server>>;

#[tokio::main]
async fn main() {
    // gets args that are included when this file is run and sets that as the host:port or else a default is set
    dotenv::dotenv().ok();
    let addr = env::args().nth(1).unwrap_or_else(|| "127.0.0.1:9000".to_string());
    // parses socket address from addr
    let socket_addr: SocketAddr = addr.parse().expect("valid socket address");

    // let users = Users::default();
    // let users = warp::any().map(move || users.clone());

    let server: echoServer = Arc::new(RwLock::new(server::new()));
    let server = warp::any().map(move || server.clone());

    // let opt = warp::path::param::<String>()
    //     .map(Some)
    //     .or_else(|_| async { Ok::<(Option<String>,), std::convert::Infallible>((None,)) });

    // // GET /hello/warp => 200 OK with body "Hello, warp!"
    // let hello = warp::path("hello")
    //     .and(opt)
    //     .and(warp::path::end())
    //     .map(|name: Option<String>| {
    //         format!("Hello, {}!", name.unwrap_or_else(|| "world".to_string()))
    //     });

    // GET /ws 
    let chat = warp::path("ws")
        .and(warp::ws())
        // .and(users)
        .and(server)
        .map(|ws: warp::ws::Ws, server| ws.on_upgrade(move |socket| connect(socket, server)));

    // not found page
    let res_404 = warp::any().map(|| {
        warp::http::Response::builder()
            .status(warp::http::StatusCode::NOT_FOUND)
            .body("404 Not Found!")
    });

    // add all routes together. can modularize even further
    let routes = chat.or(res_404);//.or(hello)

    // serving routes at socket address
    // ! fix where env goes
    // match env::var_os("TEST") {
    //     Some(v) => println!("{}",v.into_string().unwrap()),
    //     None => println!("no TEST")
    // }
    let TEST_ENV = dotenv::var("TEST").unwrap_or_else(|_|"false".to_string());

    if TEST_ENV == "true".to_string() {
        let server;
        server = warp::serve(routes).try_bind(socket_addr);
        println!("Running server at {}!", addr);
        server.await
    }else {
        println!("Running server on 433!");
        warp::serve(routes).tls().cert_path("./fullchain.pem").key_path("./privkey.pem").run(([127,0,0,1],433)).await;
    }

}

// function that handles websocket connection
async fn connect(ws: WebSocket, server: echoServer) {
    
    // Establishing a connection
    let (user_tx, user_rx) = ws.split();
    let (tx, rx) = mpsc::unbounded_channel();
    
    let rx = UnboundedReceiverStream::new(rx);
    
    tokio::spawn(rx.forward(user_tx));
    
    // Bookkeeping
    let client = client::new(tx, user_rx, Uuid::new_v4().to_string());

    let client_id = client.get_id().await;

    println!("Welcome User {}", client_id);
    
    {
        // inserts this connection as new user in map
        server.write().await.insert_user(client, &client_id).await;
    }
    let client_copy;
    {
        let server = server.read().await;
        // Reading and broadcasting messages
        client_copy = server.get_user(&client_id).await.unwrap();
    }
    client_copy.read_input(&server).await;
}

