package fiber_handler

import (
	"main/models"
	"main/socket"

	"github.com/gofiber/fiber/v2"
	_ "github.com/gofiber/fiber/v2/middleware/cors"
)

func Start(app *fiber.App, orm *models.ORM) {
	sql,_ := orm.RDB.DB()
	defer sql.Close()

	go socket.Main()

	
	app.Use(CORS(orm))
	app.Post("/login", loginHandler(orm))
	// app.Get("/logout", logout)
	app.Get("/", homeHandler)
	
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
	
	order := app.Group("order", checkCookie)
	order.Get("/:id", models.GetOrder(orm))
	order.Get("/", models.GetOrders(orm))
	order.Post("/", models.AddOrder(orm))
	order.Put("/", models.UpdateOrder(orm))
	//! work on this
	order.Delete("/", models.DeleteOrder)

	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).SendString("404 could not find that!")
	})

	if err := app.Listen(":8000"); err != nil {
		panic(err)
	}

}