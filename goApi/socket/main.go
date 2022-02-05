package socket

import (
	"fmt"
	_"log"
	"net/http"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type Message struct {
	Function string `json:"function"`
	Data map[string]interface{} `json:"data"`
}



var (
	wsUpgrader = websocket.Upgrader {
		ReadBufferSize: 1024,
		WriteBufferSize: 1024,
	}

	wsConn *websocket.Conn
)

func WsEndpoint(w http.ResponseWriter, r *http.Request) {

	wsUpgrader.CheckOrigin = func(r *http.Request) bool {
		// check the http.Request
		// make sure it's OK to access
		return true
	}
	var err error
	wsConn, err = wsUpgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Printf("could not upgrade: %s\n", err.Error())
		return
	}

	defer wsConn.Close()

	// event loop
	for {
		var msg Message

		err := wsConn.ReadJSON(&msg)
		if err != nil {
			fmt.Printf("error reading JSON: %s\n", err.Error())
			break
		}

		fmt.Printf("Message Received: %s\n%s\n", msg, msg.Data["message"])
		// switch case for functions
		fmt.Println(msg.Function)
		switch msg.Function {
			case "test":
				SendMessage("test worked")
				
			default:
				fmt.Println("did not find case")
		}
	}
}

func SendMessage(msg string) {
	err := wsConn.WriteMessage(websocket.TextMessage, []byte(msg))
	if err != nil {
		fmt.Printf("error sending message: %s\n", err.Error())
	}
}

func Main() {

	router := mux.NewRouter()

	router.HandleFunc("/socket", WsEndpoint)

	go http.ListenAndServe("0.0.0.0:5000", router)
}