package models

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type ORM struct {
	Test bool
	RDB *gorm.DB
	DBs map[string]*gorm.DB
	IPs map[string]bool
}

//drop DB
func (orm *ORM)DeleteDB(dbName string) error {

	db := orm.ReturnDBx()
	db.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s;", dbName))

	orm.DeleteFromMetadata(dbName)
	delete(orm.DBs, dbName)
	return nil
}

func (orm *ORM)AddIP(element string) {
    orm.IPs[element] = true;
}

//for createAccount
func (orm *ORM)InitiateDB(dbName string) (*gorm.DB){
	var db *gorm.DB

	db = orm.ReturnDBx()
	db.Exec(fmt.Sprintf("CREATE DATABASE %s", dbName))
	db = orm.ReturnDB(dbName)
	db.AutoMigrate(&User{}, &Order{}, &Item{})

	orm.DBs[dbName] = db

	return db
}

//for login
func (orm *ORM)ReturnDB(dbName string) (*gorm.DB) {
	if orm.DBs[dbName] != nil {
		return orm.DBs[dbName]
	}

	// err := LoadEnv()
	// if err != nil {
	// 	log.Fatal("Error loading .env")
	// }
	
	dns := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable", os.Getenv("SQL_HOST"),
	os.Getenv("SQL_USER"), os.Getenv("SQL_PASSWORD"), dbName, os.Getenv("SQL_PORT"))

	db, err := gorm.Open(postgres.Open(dns), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		fmt.Printf("Error connecting to database")
	}
	orm.DBs[dbName] = db
	return db
}

func (orm *ORM)ReturnDBx() (*gorm.DB) {
	if orm.DBs["psql"] != nil {
		return orm.DBs["psql"]
	}
	// err := LoadEnv()
	// if err != nil {
	// 	log.Fatal("Error loading .env")
	// }

	dns := fmt.Sprintf("host=%s user=%s password=%s port=%s sslmode=disable", os.Getenv("SQL_HOST"),
	os.Getenv("SQL_USER"), os.Getenv("SQL_PASSWORD"), os.Getenv("SQL_PORT"))

	db, err := gorm.Open(postgres.Open(dns), &gorm.Config{})
	if err != nil {
		log.Fatal("Error connecting to database")
	}

	orm.DBs["psql"] = db
	
	return db
}

func (orm *ORM)InitiateMetadata() (*gorm.DB) {
	var db *gorm.DB
	
	db = orm.ReturnDBx()
	db.Exec("CREATE DATABASE metadata;")
	db = orm.ReturnDB("metadata")
	db.AutoMigrate(&Business{}, &IPs{})
	
	
	ips := make([]IPs,1)

	db.Find(&ips)

	for _ , s := range ips {
		orm.AddIP(s.IP)
	}
	
	return db
}

func (orm *ORM)DeleteFromMetadata(dbName string){
	orm.RDB.Where("code = ?", dbName).Delete(&Business{})
}

func (orm *ORM)InsertToMetadata(business *Business) {
	orm.RDB.Create(business)
}

func LoadEnv() error {
	_, loaded := os.LookupEnv("SQL_PORT")
	if !loaded {
		err := godotenv.Load()
		return err
	}
	
	return nil
	
}