package fiber_handler

import (
	"main/models"
	"main/socket"
	"github.com/gofiber/fiber/v2"
)

func Start(app *fiber.App, orm *models.ORM) {
	sql,_ := orm.RDB.DB()
	defer sql.Close()
	s:= socket.NewServer()

	app.Use(CORS(orm))
	app.Get("/socket", originCheck(orm))

	app.Get("/socket", socket.WsEndpoint(s))
	app.Post("/login", loginHandler(orm))
	// app.Get("/logout", logout)
	app.Get("/", homeHandler)
	
	user := app.Group("/user")
	user.Post("/", createAccountHandler(orm))
	user.Use(checkCookie(orm))
	user.Get("/", models.GetUser(orm))
	user.Get("/:id", models.GetUser(orm))
	user.Delete("/:id", models.DeleteUser)
	user.Put("/:id", models.UpdateUser)

	item := app.Group("item", checkCookie(orm))
	item.Get("/:id", models.GetItem(orm))
	item.Get("/", models.GetItems(orm))
	item.Post("/", models.AddItem(orm))
	item.Delete("/:id", models.DeleteItem(orm))
	item.Put("/:id", models.UpdateItem(orm))
	
	order := app.Group("order", checkCookie(orm))
	order.Get("/:id", models.GetOrder(orm))
	order.Get("/", models.GetOrders(orm))
	order.Post("/", models.AddOrder(orm))
	order.Put("/", models.UpdateOrder(orm))
	//! work on this
	order.Delete("/", models.DeleteOrder)
	
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).SendString("404 could not find that!")
	})
	
	// socket.Main()
	if(orm.Test){
		if err := app.Listen(":8000"); err != nil {
			panic(err)
		}
		}else{
		if err := app.Listen(":8000"); err != nil {
		// if err := app.ListenTLS(":8000","./letsencrypt/live/api.navapos.com/cert.pem","../../letsencrypt/live/api.navapos.com/privkey.pem"); err != nil {
			panic(err)
		}
	}

}