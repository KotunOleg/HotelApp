package models

import "gorm.io/gorm"

type Review struct {
	gorm.Model
	UserID  uint   `gorm:"not null" json:"user_id"`
	User    User   `json:"user,omitempty"`
	HotelID uint   `gorm:"not null" json:"hotel_id"`
	Hotel   Hotel  `json:"hotel,omitempty"`
	Content string `gorm:"not null" json:"content"`
	Rating  uint   `gorm:"not null;check:rating >= 1 AND rating <= 5" json:"rating"`
}
