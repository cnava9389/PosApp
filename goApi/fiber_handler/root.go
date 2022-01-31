package fiber_handler

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"main/models"
)

func Start(app *fiber.App, orm *models.ORM) {
	sql,_ := orm.RDB.DB()
	defer sql.Close()

	app.Use(cors.New(cors.Config{
		// AllowOrigins: "http://localhost:3000, https://www.navapos.com, https://posnava.com",
		AllowOrigins: "https://www.navapos.com, https://posnava.com",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowCredentials: true,
		AllowMethods: "GET, POST, PUT, DELETE, HEAD, PATCH, OPTIONS",
	}))
	
	app.Use(checkOrigin)
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