package fiber_handler

import (
	_"fmt"
	"main/models"
	"main/socket"
	_ "path/filepath"

	"github.com/gofiber/fiber/v2"
	_"github.com/gofiber/websocket/v2"
)

func Start(app *fiber.App, orm *models.ORM) {
	sql,_ := orm.RDB.DB()
	defer sql.Close()
	s:= socket.NewServer()

	app.Use("/ws", originCheck(orm))
	app.Get("/ws", socket.WsEndpoint(s))

	app.Use(CORS(orm))

	// app.Use("/socket", originCheck(orm))

	app.Post("/login", loginHandler(orm))
	// app.Get("/logout", logout)
	app.Get("/", homeHandler)
	
	user := app.Group("user")
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
	
	data := app.Group("data", checkCookie(orm))
	data.Get("/orders/", models.GetDateOrders(orm))
	// data.Get("/orders/", models.GetDateOrders(orm))

	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).SendString("404 could not find that!")
	})
	
	// go socket.Main()
	if(orm.Test){
		if err := app.Listen(":8000"); err != nil {
			panic(err)
		}
		}else{
		// if err := app.Listen(":8000"); err != nil {
		if err := app.ListenTLS(":443","./fullchain.pem","./privkey.pem"); err != nil {
			panic(err)
		}
	}

}