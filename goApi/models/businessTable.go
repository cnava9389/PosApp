package models

type Business struct {
	ID uint64 `json:"id" gorm:"primary_key,auto_increment:"`
	Business string `json:"business" binding:"required" gorm:"type:varchar(75);unique"`
	Code string `json:"code" binding:"required" gorm:"type:varchar(255)"`
	Email string `json:"email" binding:"required" gorm:"type:varchar(150);unique"`
}