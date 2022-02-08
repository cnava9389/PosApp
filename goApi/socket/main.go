package socket

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	_"github.com/gorilla/websocket"
	"github.com/gofiber/websocket/v2"
)

type Message struct {
	Type string `json:"type"`
	Data string `json:"data"`
}

// var (
// 	wsUpgrader = websocket.Upgrader {
// 		ReadBufferSize: 1024,
// 		WriteBufferSize: 1024,
// 	}
// )
//! rewrite socket in rust with socket io server
func WsEndpoint(s *server) func(c *fiber.Ctx) error {

	return websocket.New(func(c *websocket.Conn) {

		fmt.Printf("connected: %s\n",c.RemoteAddr().String())
	
		s.newClient(c)
	})
}