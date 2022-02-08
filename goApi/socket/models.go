package socket

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"strings"
	"github.com/gofiber/websocket/v2"
	uuid "github.com/lithammer/shortuuid"
)

type client struct {
	conn     *websocket.Conn
	name     string
	room     *room
	// commands chan<- command
}

func(c *client) readInput(s *server) {	
	for {
		_, msgByte, err := c.conn.ReadMessage()
		if err != nil {
			s.quit(c)
			break
		}
		msg := Message{}
		json.Unmarshal(msgByte,&msg)
		switch msg.Type {
			case "join":
				var arg [1]string
				arg[0] = msg.Data
				s.join(c, arg[:])
			case "leave":
				s.quitCurrentRoom(c)
			case "name":
				var arg [1]string
				arg[0] = msg.Data
				s.name(c,arg[:])
			case "rooms":
				s.listRooms(c)
			case "broadcast":
				var arg [1]string
				arg[0] = msg.Data
				s.msg(c,arg[:])
			case "quit":
				s.quit(c)
			default:
				c.err(fmt.Errorf("could not find command type: %s",msg.Type))
		}
	}
}


func (c *client) err(err error) {
	c.msg("error",err.Error())
}

func (c *client) msg(Type string, data string) {
	c.conn.WriteJSON(Message{
		Type: Type,
		Data: data,
	})
}


type room struct {
	name string
	members map[net.Addr]*client
}

func (r *room)broadcast(sender *client, msg string) {
	for addr, m := range r.members {
		if addr != sender.conn.RemoteAddr() {
			m.msg("message",msg)
		}
	}
}

type server struct {
	rooms map[string]*room
}

func NewServer() *server {
	return &server{
		rooms: make(map[string]*room),
	}
}

func (s *server) newClient(conn *websocket.Conn) {
	c:= &client{
		conn: conn,
		name: uuid.New(),
		// commands: s.commands,
	}

	c.readInput(s)
}

func (s *server) name(c *client, args []string) {
	c.name = args[0]
	c.msg("message",fmt.Sprintf("all right, I will call you %s", c.name))
}

func (s *server) join(c *client, args []string) {
	roomName := args[0]

	r, ok := s.rooms[roomName]
	if !ok {
		r = &room{
			name: roomName,
			members: make(map[net.Addr]*client),
		}
		s.rooms[roomName] = r
	}
	
	r.members[c.conn.RemoteAddr()] = c

	s.quitCurrentRoom(c)

	c.room = r

	r.broadcast(c, fmt.Sprintf("%s has joined the room", c.name))
	c.msg("message",fmt.Sprintf("welcome to %s", r.name))
}

func (s *server) listRooms(c *client) {
	var rooms []string
	for name := range s.rooms {
		rooms = append(rooms,name)
	}

	c.msg("message",fmt.Sprintf("available rooms are: %s", strings.Join(rooms, ", ")))
}

func (s *server) msg(c *client, args []string) {
	if len(args) < 1 {
		c.msg("error", "message is required, usage: /msg MSG")
		return
	}

	msg := strings.Join(args[0:], " ")
	c.room.broadcast(c, c.name+": "+msg)
}

func (s *server) quit(c *client) {
	log.Printf("client has disconnected: %s", c.conn.RemoteAddr().String())

	s.quitCurrentRoom(c)

	c.msg("message","sad to see you go :(")
	c.conn.Close()
}

func (s *server) quitCurrentRoom(c *client) {
	if c.room != nil {
		delete(c.room.members, c.conn.RemoteAddr())
		c.room.broadcast(c,fmt.Sprintf("%s has left the room", c.name))
	}
}