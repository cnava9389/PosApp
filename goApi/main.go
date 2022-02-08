package main

import (
	"fmt"
	"main/fiber_handler"
	"main/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"os"
)

func main() {
	app := fiber.New()
	orm := new(models.ORM)
	err := models.LoadEnv()
	if err != nil {
		panic(err)
	}
	if (os.Getenv("TEST") == "true"){
		orm.Test = true
	}else{
		orm.Test = false
	}
	orm.IPs = map[string]bool{}
	orm.DBs = map[string]*gorm.DB{}
	orm.AddIP("155.138.203.239")
	orm.AddIP("155.138.213.55")
	orm.AddIP("10.0.0.182")
	orm.AddIP("10.0.0.196")
	orm.AddIP("10.0.0.47")
	orm.RDB = orm.InitiateMetadata()
	fmt.Println("Starting")
	// socket.StartSocketServer()
	fiber_handler.Start(app, orm)
	fmt.Println("Done!")
}