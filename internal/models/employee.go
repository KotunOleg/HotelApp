package models

import "gorm.io/gorm"

type Employee struct {
	gorm.Model
	FirstName string `gorm:"not null" json:"first_name"`
	LastName  string `gorm:"not null" json:"last_name"`
	Email     string `gorm:"uniqueIndex;not null" json:"email"`
	Phone     string `gorm:"not null" json:"phone"`
	Position  string `json:"position"`
	HotelID   uint   `gorm:"not null" json:"hotel_id"`
	Hotel     Hotel  `json:"hotel,omitempty"`
}
