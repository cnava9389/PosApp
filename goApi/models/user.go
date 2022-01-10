package models

import (
	"errors"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type User struct {
	ID           uint   `json:"id" gorm:"auto_increment:,primaryKey"`
	Name         string `json:"name" binding:"required" gorm:"not null;default:null;varchar(75)"`
	Password     string  `json:"password,omitempty" binding:"required" gorm:"not null;default:null;varchar(255)"`
	Email        string `json:"email" gorm:"not null;default:null;varchar(150);unique" binding:"required"`
	Business     string `json:"business" binding:"required" gorm:"not null;default:null;varchar(75);unique"`
	Phone        string `json:"phone" gorm:"type:varchar(30);not null;default:null;unique"`
	City         string `json:"city" gorm:"type:varchar(30)"`
	State        string `json:"state" gorm:"type:varchar(30)"`
	Street       string `json:"street" gorm:"type:varchar(75)"`
	Street2      string `json:"street2" gorm:"type:varchar(75)"`
	Ppic         string `json:"ppic" gorm:"type:varchar(255)"`
	BusinessCode string `json:"businessCode" gorm:"type:varchar(75)"`
	Auth         string `json:"auth"`
	ZipCode      string `json:"zipCode" gorm:"varchar(20)"`
	DeletedAt	 time.Time
}

// type User struct {
// 	ID uint `json:"id" gorm:"auto_increment:,primaryKey"`
// 	Name string `json:"name" binding:"required" gorm:"not null;default:null;varchar(75)"`
// 	Password []byte `json:"password" binding:"required" gorm:"type:varchar(255);not null;unique;default:null"`
// 	Email string `json:"email" gorm:"not null;unique;default:null;type:varchar(150)" binding:"required"`
// 	Business string `json:"business" binding:"required" gorm:"not null;unique;default:null;type:varchar(75)"`
// 	Phone string `json:"phone" gorm:"type:varchar(30)"`
// 	City string `json:"city" gorm:"type:varchar(30)"`
// 	State string `json:"state" gorm:"type:varchar(30)"`
// 	Street string `json:"street" gorm:"type:varchar(75)"`
// 	Street2 string `json:"street2" gorm:"type:varchar(75)"`
// 	Ppic string `json:"pic" gorm:"type:varchar(255)"`
// 	BusinessCode string `json:"BusinessCode" gorm:"type:varchar(75)"`
// 	Auth string `json:"auth" gorm:"type:varchar(10)"`
// }

// CREATE TYPE auth AS ENUM (
//     'super',
//     'admin',
//     'user',
//     'client'
// );

func (u *User) BeforeCreate(tx *gorm.DB) error {
	auth := strings.ToLower(u.Auth)
	if auth == "super" {
		if strings.ToLower(u.Email) != "cnava9389@gmail.com"{
			return errors.New("cannot be super user")
		}
	}
	if auth == "super" || auth == "admin" || auth == "user" || auth == "client" {
		return nil
	}
	u.Auth = "user"
	return nil
}

func GetUser(orm *ORM) func(c * fiber.Ctx) error {
	fn := func(c *fiber.Ctx) error {
		var user User
		info := c.Locals("info").(*CookieInfo)
		db := orm.ReturnDB(info.DB)
		if db == nil {
			c.Status(fiber.StatusBadRequest).SendString("Database does not exist")
		}
		id := c.Params("id")

		if id == "" {
			db.Where("email = ?", info.Email).First(&user)
		}else{
			db.Where("id = ?", id).First(&user)
		}

		if user.ID == 0 {
			return c.Status(fiber.StatusNotFound).SendString("could not find user with cookie")
		}
		user.Password=""
		return c.Status(fiber.StatusOK).JSON(&user)
	}
	return fn
}

func DeleteUser(c *fiber.Ctx) error {
	return c.SendString("working on it")
}

func UpdateUser(c *fiber.Ctx) error {
	return c.SendString("working on it")
}
