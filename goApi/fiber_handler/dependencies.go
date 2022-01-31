package fiber_handler

import (
	"fmt"
	"main/models"
	"os"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type LoginForm struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func createAccountHandler(orm *models.ORM) func(c *fiber.Ctx) error {
	fn := func(c *fiber.Ctx) error {
		fmt.Println("createing account here")
		var user models.User
		
		if err := c.BodyParser(&user); err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Error, invalid credentials")
			
		}
		
		if user.Name == "" || user.Password == "" || user.Business == "" {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid json body, missing name, password, or business")
		}
		
		hashedpassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), 10)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("generating hashed password")
		}
		
		user.Password = string(hashedpassword)
		
		var code string
		
		if user.BusinessCode == ""{
			checkBusiness := &models.Business{}
			
			orm.RDB.Where("business = ?",user.Business).First(&checkBusiness)
			
			if checkBusiness.ID != 0 {
				return c.Status(fiber.StatusBadRequest).SendString("Business name already exists")
			}
			
			uuid := uuid.NewString()
			uuid = strings.Split(uuid, "-")[0]
			code = fmt.Sprintf("r%s", uuid)		
			user.BusinessCode = code
			
			db := orm.InitiateDB(code)
			
			db.Create(&user)
			sql, _ := db.DB()
			if user.ID == 0 {
				sql.Close()
				orm.DeleteDB(code)
				return c.Status(fiber.StatusBadRequest).SendString("Error creating account; required => name, password, email, business, and phone")
			}
			
			business := &models.Business{
				Business: user.Business,
				Code:     user.BusinessCode,
				Email:    user.Email,
			}
			
			orm.InsertToRestaurant(business)
			if business.ID == 0 {
				sql.Close()
				orm.DeleteDB(code)
				return c.Status(fiber.StatusBadRequest).SendString("Error inserting information into business table")
			}
		}else{
			code = user.BusinessCode
			var record models.Business
			orm.RDB.Where("code = ?", code).First(&record)
			if record.ID == 0{
				return c.Status(fiber.StatusBadRequest).SendString("Business code does not exist!")
			}
			db := orm.ReturnDB(code)
			db.Create(&user)
			if user.ID == 0 {
				return c.Status(fiber.StatusBadRequest).SendString("Could not add user to this business")
			}
		}
		
		
		token, err := generateToken(&user.Email, &code)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Error generating Token")
		}
	
		if(c.Query("native")=="true"){
			ip := &models.IPs{BusinessCode:code,IP:c.IP()}
			orm.RDB.Create(ip)
			if(ip.ID == 0){
				return c.Status(fiber.StatusBadRequest).SendString("Error saving IP settings")
			}
			orm.Extend(ip.IP)
		}

		setCookie(c, &token)
		user.Password = ""
		return c.Status(fiber.StatusOK).JSON(&user)
	}
	return fn
}

//! this is not for regular users this is for company sign in
func loginHandler(orm *models.ORM) func(c *fiber.Ctx) error {
	fn := func(c *fiber.Ctx) error {
		var loginForm LoginForm

		if err := c.BodyParser(&loginForm); err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Error, invalid credentials")
		}

		var user models.User
		var business models.Business

		orm.RDB.Where("email = ?", loginForm.Email).First(&business)

		if business.ID == 0 {
			return c.Status(fiber.StatusNotFound).SendString("User not found in restaurants db")
		}

		db := orm.ReturnDB(business.Code)

		db.Where("email = ?", loginForm.Email).First(&user)

		if user.ID == 0 {
			return c.Status(fiber.StatusNotFound).SendString("User not found in business db")
		}

		err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginForm.Password))
		if err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Password incorrect")
		}

		token, err := generateToken(&user.Email, &user.BusinessCode)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Error generating Token")
		}

		setCookie(c, &token)
		user.Password=""
		return c.JSON(&user)
	}
	return fn
}

type User struct {
	Name string `json:"name"`
}

func homeHandler(c *fiber.Ctx) error {
		// db := orm.ReturnDBx()
		// db.Exec("CREATE DATABASE test")
		// db.Table("test.user")
		// db.AutoMigrate(&User{})

		return c.SendString("home")
}

func logout(c *fiber.Ctx) error {
	deleteCookie(c)
	return c.SendString("logged out")
}

func setCookie(c *fiber.Ctx, str *string) {
	cookie := fiber.Cookie{
		Name:    "POSAPI",
		Value:   *str,
		Expires: time.Now().Add(8 * time.Hour),
	}

	c.Cookie(&cookie)
}

func deleteCookie(c *fiber.Ctx) {
	cookie := fiber.Cookie{
		Name:    "POSAPI",
		Value:   "",
		Expires: time.Now().Add(-time.Hour),
	}

	c.Cookie(&cookie)
}

func checkCookie(c *fiber.Ctx) error {
	godotenv.Load()
	cookie := c.Cookies("POSAPI")
	claim := new(jwt.StandardClaims)
	pToken, err := jwt.ParseWithClaims(cookie, claim, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("SECRET_KEY")), nil
	})

	if err != nil || !pToken.Valid {
		return c.Status(fiber.StatusUnauthorized).SendString(err.Error())
	}

	dbName, email := claim.Audience, claim.Issuer
	info := models.CookieInfo{
		DB:    dbName,
		Email: email,
	}
	c.Locals("info", &info)
	return c.Next()
}
//!use for loop in this to add to allowed origin list or cors wrapper.
// func checkOrigin(orm *models.ORM) func(c *fiber.Ctx) bool {
// 	return func(c *fiber.Ctx) bool {
// 		host := fmt.Sprintf("http://%s:3000", c.IP())
// 		fmt.Printf("hosts == %s,\n", host)
// 		fmt.Println(c.Method())
// 		fmt.Println(c.OriginalURL())
// 		if((c.OriginalURL() == "/user/?native=true" || c.OriginalURL() == "/user/?native=false" || c.OriginalURL() == "/user/") && (c.Method() == "OPTIONS" || c.Method() == "POST")){
// 			fmt.Println("true")
// 			c.Set("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, DELETE, HEAD, PATCH")
// 			c.Set("Access-Control-Allow-Origin", host)
// 			c.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Accept-Encoding, Accept-Language")
// 			return true
// 		}
// 		for _ , x := range orm.IPs {
// 			if x == c.IP() {return true}
// 		}
// 		fmt.Println("returning false")
// 		return false
// 	}
// }
func generateToken(email *string, code *string) (string, error) {
	_, x := os.LookupEnv("SECRET_KEY")
	if !x {
		godotenv.Load()
	}

	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.StandardClaims{
		Issuer:    *email,
		ExpiresAt: time.Now().Add(time.Hour * 10).Unix(),
		Audience:  *code,
	})

	token, err := claims.SignedString([]byte(os.Getenv("SECRET_KEY")))
	if err != nil {
		return "", err
	}

	return token, nil
}
