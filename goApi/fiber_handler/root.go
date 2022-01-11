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
		AllowOrigins: "http://localhost:3000, http://10.0.0.196:3000, http://www.navapos.com, https://www.navapos.com",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowCredentials: true,
	}))
	
	app.Get("/", homeHandler(orm))
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