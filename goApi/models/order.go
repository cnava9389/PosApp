package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	_ "fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// JSONB Interface for JSONB Field of yourTableName Table
type JSONB []interface{}

// Value Marshal
func (a JSONB) Value() (driver.Value, error) {
    return json.Marshal(a)
}

// Scan Unmarshal
func (a *JSONB) Scan(value interface{}) error {
    b, ok := value.([]byte)
    if !ok {
        return errors.New("type assertion to []byte failed")
    }
    return json.Unmarshal(b,&a)
}

type TicketItem struct {
	ID int64 `json:"id"`
	Name string `json:"name" gorm:"not null;default:null;varchar(75)" binding:"required"`
	Price float64 `json:"price"`
	Type string `json:"type" gorm:"not null;default:null;varchar(30)"`
	Description string `json:"description" gorm:"type:text"`
	Custom datatypes.JSON `json:"custom"`
}

type Order struct {
	ID int64 `json:"id" gorm:"primaryKey"`
	DeletedAt time.Time
	Credit bool `json:"credit" gorm:"default:false"`
	CreatedAt time.Time `json:"dateTime"`
	Description string `json:"description" gorm:"text"`
	Employee string `json:"employee" gorm:"type:varchar(75)"`
	Items JSONB `json:"items" gorm:"type:jsonb"`
 	Name string `json:"name" gorm:"type:varchar(75)"`
	Paid bool `json:"paid" gorm:"default:false"`
	Subtotal float64 `json:"subTotal" gorm:"type:numeric"`
	Tax float64 `json:"tax" gorm:"type:numeric"`
	Type string `json:"type" sql:"type:order_type"`
 	Custom datatypes.JSON `json:"custom,omitempty" gorm:"type:json"`
}

type PayOrder struct {
	ID int64 `json:"id"`
	Credit bool `json:"credit"`
	Paid bool `json:"paid"`
}

type IOrder struct {
	ID int64 `json:"-"`
	DeletedAt time.Time
	Credit bool `json:"credit,omitempty"`
	CreatedAt time.Time `json:"-"`
	Description string `json:"description,omitempty"`
	Employee string `json:"employee,omitempty"`
	Items JSONB `json:"items,omitempty"`
 	Name string `json:"name,omitempty"`
	Paid bool `json:"paid,omitempty"`
	Subtotal float64 `json:"subTotal,omitempty"`
	Tax float64 `json:"tax,omitempty"`
	Type string `json:"type,omitempty"`
 	Custom datatypes.JSON `json:"omitempty" `
}


// type Order struct {
// 	ID uint64 `json:"id" gorm:"auto_increment:,primaryKey"`
// 	Credit bool `json:"credit" gorm:"default:false"`
// 	Datetime time.Time `json:"dateTime" gorm:"default:current_timestamptz"`
// 	Description string `json:"description" gorm:"text"`
// 	Employee string `json:"employee" gorm:"type:varchar(75)"`
// 	Items string `json:"items" gorm:"type:varchar(255)"`
// 	Name string `json:"name" gorm:"type:varchar(75)"`
// 	Paid bool `json:"paid" gorm:"default:false"`
// 	Subtotal uint64 `json:"subTotal"`
// 	Tax uint64 `json:"tax"`
// 	Type string `json:"type" gorm:"varchar(30)"`
// }

func (o *Order)BeforeCreate(tx *gorm.DB) error {
	orderType := strings.ToLower(o.Type)
	if (orderType == "togo" || orderType == "pickup" || orderType == "other") {
		return nil
	}else{
		return errors.New("please input 'togo', 'pickup', or 'other'")
	}
}

func AddOrder(orm *ORM) func(c * fiber.Ctx) error {
	fn := func(c* fiber.Ctx) error {
		info := c.Locals("info").(*CookieInfo)
		var order IOrder
		
		err := json.Unmarshal(c.Body(),&order)
		if err != nil {
			c.Status(fiber.StatusBadRequest).SendString("Error binding data")
		}
		// if err := c.BodyParser(&order); err != nil {
			// 	return c.Status(fiber.StatusBadRequest).SendString(err.Error())
			// }
		db := orm.ReturnDB(info.DB)
		db.Model(&Order{}).Create(&order)
		if order.ID<=0{
			return c.Status(fiber.StatusBadRequest).SendString("Error creating order")
		}
		return c.Status(fiber.StatusOK).JSON(&Order{
			ID: order.ID,
			Credit: order.Credit,
			CreatedAt: order.CreatedAt,
			Description: order.Description,
			Employee: order.Employee,
			Items: order.Items,
			Name: order.Name,
			Paid: order.Paid,
			Subtotal: order.Subtotal,
			Tax: order.Tax,
			Type: order.Type,
			Custom: order.Custom,
		})
	}
	return fn
}

func GetOrders(orm *ORM) func(c * fiber.Ctx) error {
	fn := func(c *fiber.Ctx) error {
		info := c.Locals("info").(*CookieInfo)
		db := orm.ReturnDB(info.DB)
		orders := make([]Order, 1)

		db.Limit(250).Find(&orders)

		return c.Status(fiber.StatusOK).JSON(&orders)
	}
	return fn
}

func GetOrder(orm *ORM) func(c * fiber.Ctx) error {
	fn := func(c *fiber.Ctx) error {
		id := c.Params("id")
		info := c.Locals("info").(*CookieInfo)
		db := orm.ReturnDB(info.DB)
		order := new(Order)

		db.First(&order,id)

		if order.ID == 0 {
			return c.Status(fiber.StatusNotFound).SendString("Item not found")
		}

		return c.Status(fiber.StatusOK).JSON(&order)
	}
	return fn
}
func GetDateOrders(orm *ORM) func(c * fiber.Ctx) error {
	return func(c * fiber.Ctx) error {
		date := c.Query("date")
		info := c.Locals("info").(*CookieInfo)
		db := orm.ReturnDB(info.DB)

		orders := make([]Order, 1)
		
		fmt.Println(date)

		db.Where("created_at BETWEEN ? AND ?", fmt.Sprintf("%s 00:00:00",date),fmt.Sprintf("%s 23:59:59",date)).Find(&orders)

		return c.Status(fiber.StatusOK).JSON(&orders)
	}
}

func DeleteOrder(c *fiber.Ctx) error {
	return c.SendString("working on it")
}

func UpdateOrder(orm *ORM) func(c * fiber.Ctx) error {
	fn := func(c *fiber.Ctx) error {
		var order PayOrder
		info := c.Locals("info").(*CookieInfo)
		if err := c.BodyParser(&order); err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Error, processesing item")
		}

		db := orm.ReturnDB(info.DB)
		db.Model(&Order{ID: order.ID}).Updates(&Order{Credit: order.Credit,Paid:order.Paid})

		if order.ID == 0 {
			return c.Status(fiber.StatusBadRequest).SendString("Error updating order")
		}

		return c.Status(fiber.StatusOK).JSON(&order)
	}
	return fn
}