package socket

import (
	"bytes"
	"encoding/gob"
	"log"
)

func DecodeToMessage(s []byte) Message {

	p := Message{}
	println(s)
	dec := gob.NewDecoder(bytes.NewReader(s))
	println(dec)
	err := dec.Decode(&p)
	if err != nil {
		log.Fatal(err)
	}
	return p
}