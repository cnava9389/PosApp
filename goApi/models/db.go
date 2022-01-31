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
	IPs []string
}

//drop DB
func (orm *ORM)DeleteDB(dbName string) error {

	db := orm.ReturnDBx()
	db.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS %s;", dbName))

	orm.DeleteFromRestaurant(dbName)
	delete(orm.DBs, dbName)
	return nil
}

func (orm *ORM)Extend(element string) {
    n := len(orm.IPs)
    if n == cap(orm.IPs) {
        // Slice is full; must grow.
        // We double its size and add 1, so if the size is zero we still grow.
        newSlice := make([]string, len(orm.IPs), 2*len(orm.IPs)+1)
        copy(newSlice, orm.IPs)
        orm.IPs = newSlice
    }
    orm.IPs = orm.IPs[0 : n+1]
    orm.IPs[n] = element
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

	err := loadEnv()
	if err != nil {
		log.Fatal("Error loading .env")
	}
	
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
	err := loadEnv()
	if err != nil {
		log.Fatal("Error loading .env")
	}

	dns := fmt.Sprintf("host=%s user=%s password=%s port=%s sslmode=disable", os.Getenv("SQL_HOST"),
	os.Getenv("SQL_USER"), os.Getenv("SQL_PASSWORD"), os.Getenv("SQL_PORT"))

	db, err := gorm.Open(postgres.Open(dns), &gorm.Config{})
	if err != nil {
		log.Fatal("Error connecting to database")
	}

	orm.DBs["psql"] = db
	
	return db
}

func (orm *ORM)InitiateRestaurant() (*gorm.DB) {
	var db *gorm.DB
	
	db = orm.ReturnDBx()
	db.Exec("CREATE DATABASE restaurants;")
	db = orm.ReturnDB("restaurants")
	db.AutoMigrate(&Business{}, &IPs{})
	
	
	ips := make([]IPs,1)

	db.Find(&ips)

	for _ , s := range ips {
		orm.Extend(s.IP)
	}
	
	return db
}

func (orm *ORM)DeleteFromRestaurant(dbName string){
	orm.RDB.Where("code = ?", dbName).Delete(&Business{})
}

func (orm *ORM)InsertToRestaurant(business *Business) {
	orm.RDB.Create(business)
}

func loadEnv() error {
	_, loaded := os.LookupEnv("SQL_PORT")
	if !loaded {
		err := godotenv.Load()
		return err
	}
	
	return nil
	
}