package main

import (
	"fmt"
	"main/fiber_handler"
	"main/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func main() {
	app := fiber.New()
	orm := new(models.ORM)
	orm.Test = false
	orm.DBs = map[string]*gorm.DB{}
	orm.RDB = orm.InitiateRestaurant()
	fmt.Println("Starting")
	fiber_handler.Start(app, orm)
	fmt.Println("Done!")
}