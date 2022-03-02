package models

import (
	"errors"
	"fmt"
	_ "fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Item struct {
	ID	uint64 `json:"id,omitempty" gorm:"auto_increment:,primaryKey"`
	Name string `json:"name,omitempty" gorm:"not null;default:null;varchar(75)" binding:"required"`
	Price float64 `json:"price,omitempty"`
	Type string `json:"type,omitempty" gorm:"not null;default:null;varchar(30)"`
	Description string `json:"description,omitempty" gorm:"type:text"`
	DeletedAt time.Time
	Custom datatypes.JSON `json:"object,omitempty" gorm:"type:json"`
}

// type Item struct {
// 	ID	int64 `json:"id" gorm:"auto_increment:,primaryKey"`
// 	Name string `json:"name" gorm:"type:varchar(75)" binding:"required"`
// 	Price uint64 `json:"price"`
// 	Type item_type `json:"type" sql:"type:item_type"`
// 	Description string `json:"description" gorm:"type:text"`
//  Custom JSON `json:"object,omitempty" sql:"type:json"`
// }
type ExampleItem struct {
	Name string `json:"name"`
	Price string `json:"price"`
	Type string `json:"type"`
	Description string `json:"description"`
}

func (i *Item) BeforeCreate(tx *gorm.DB) error {
	itemType := strings.ToLower(i.Type)
	if (itemType == "food" || itemType == "ingredient" || itemType == "meat") {
		return nil
	}
	return errors.New("please insert 'food', 'ingredient', or 'meat'")
}

func AddItem(orm *ORM) func(c * fiber.Ctx) error {
	f := func(c * fiber.Ctx) error {
		info := c.Locals("info").(*CookieInfo)

		var item Item

		if err := c.BodyParser(&item); err != nil {
			return c.Status(fiber.StatusBadRequest).SendString(err.Error())
		}
		fmt.Println(item)
		if item.Name == "" || item.Type =="" {
			return c.Status(fiber.StatusBadRequest).JSON(&ExampleItem{
				Name: "give a name for item",
				Price: "optional whole number in cents",
				Type: "an Enum ('food','meat','ingredient','other')",
				Description: "optional text description of item",
			})
		}

		db := orm.ReturnDB(info.DB)
		db.Create(&item)
		if item.ID == 0 {
			
			return c.Status(fiber.StatusBadRequest).JSON(&ExampleItem{
				Name: "give a name for item",
				Price: "optional whole number in cents",
				Type: "an Enum ('food','meat','ingredient','other')",
				Description: "optional text description of item",
			})
		}

		return c.Status(fiber.StatusOK).JSON(&item)
	}

	return f
}

func GetItems(orm *ORM) func(c * fiber.Ctx) error {
	fn := func(c *fiber.Ctx) error {
		info := c.Locals("info").(*CookieInfo)
		db := orm.ReturnDB(info.DB)
		items := make([]Item, 1)

		db.Limit(300).Find(&items)
		// if(items[0].ID==0){
		// 	return c.Status(fiber.StatusBadRequest).SendString("Error collecting items")
		// }

		return c.Status(fiber.StatusOK).JSON(&items)
	}
	return fn
}

func GetItem(orm *ORM) func(c * fiber.Ctx) error {
	fn := func(c *fiber.Ctx) error {
		id := c.Params("id")
		info := c.Locals("info").(*CookieInfo)
		db := orm.ReturnDB(info.DB)
		item := new(Item)

		db.First(&item,id)

		if item.ID == 0 {
			return c.Status(fiber.StatusNotFound).SendString("Item not found")
		}

		return c.Status(fiber.StatusOK).JSON(&item)
	}
	return fn
}

func DeleteItem(orm *ORM) func(c * fiber.Ctx) error {
	fn := func(c *fiber.Ctx) error {
		id := c.Params("id")
		info := c.Locals("info").(*CookieInfo)
		db := orm.ReturnDB(info.DB)
		db.Delete(&Item{},id)
		return c.Status(fiber.StatusOK).SendString("")
	}
	return fn
}

func UpdateItem(orm *ORM) func(c * fiber.Ctx) error {
	fn := func(c *fiber.Ctx) error {
		item := new(Item)
		if err := c.BodyParser(&item); err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Error, processesing item")
		}
		info := c.Locals("info").(*CookieInfo)
		db := orm.ReturnDB(info.DB)

		id := c.Params("id")
		db.Model(&Item{}).Where("id = ?", id).Updates(&item)

		return c.Status(fiber.StatusOK).JSON(&item)
	}
	return fn
}