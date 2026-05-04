package models

import "gorm.io/gorm"

type Address struct {
	gorm.Model
	Street  string `gorm:"not null" json:"street"`
	City    string `gorm:"not null" json:"city"`
	Country string `gorm:"not null" json:"country"`
	ZipCode string `json:"zip_code"`
}
