package fiber_handler

import (
	"fmt"
	"main/models"

	"github.com/gofiber/fiber/v2"
	_ "github.com/gofiber/fiber/v2/middleware/cors"
)

func Start(app *fiber.App, orm *models.ORM) {
	sql,_ := orm.RDB.DB()
	defer sql.Close()

	//!whitelist function missing
	app.Use(func(c *fiber.Ctx) error {
		host := fmt.Sprintf("http://%s:3000", c.IP())
		c.Set("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, DELETE, HEAD, PATCH")
		c.Set("Access-Control-Allow-Origin", host)
		c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Accept-Encoding, X-Requested-With")
		c.Set("Access-Control-Allow-Credentials", "true")
		c.Set("Content-Type", "application/json")
		if(c.Method() != "OPTIONS"){
		return c.Next()
		}else {
			return c.SendStatus(fiber.StatusOK)
		}
	})
	
	app.Get("/", homeHandler)
	app.Post("/login", loginHandler(orm))
	app.Get("/logout", logout)
	
	user := app.Group("/user")
	user.Post("/", createAccountHandler(orm))
	user.Use(checkCookie)
	user.Get("/", models.GetUser(orm))
	user.Get("/:id", models.GetUser(orm))
	user.Delete("/:id", models.DeleteUser)
	user.Put("/:id", models.UpdateUser)

	item := app.Group("item", checkCookie)
	item.Get("/:id", models.GetItem(orm))
	item.Get("/", models.GetItems(orm))
	item.Post("/", models.AddItem(orm))
	item.Delete("/:id", models.DeleteItem(orm))
	item.Put("/:id", models.UpdateItem(orm))
	//! work on this
	order := app.Group("order", checkCookie)
	order.Get("/:id", models.GetOrder(orm))
	order.Get("/", models.GetOrders(orm))
	order.Post("/", models.AddOrder(orm))
	order.Delete("/", models.DeleteOrder)
	order.Put("/", models.UpdateOrder(orm))


	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).SendString("404 could not find that!")
	})
	
	if err := app.Listen(":8000"); err != nil {
		panic(err)
	}
}