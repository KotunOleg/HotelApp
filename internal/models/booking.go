package models

import (
	"time"

	"gorm.io/gorm"
)

type Booking struct {
	gorm.Model
	UserID        uint      `gorm:"not null" json:"user_id"`
	User          User      `json:"user,omitempty"`
	RoomID        uint      `gorm:"not null" json:"room_id"`
	Room          Room      `json:"room,omitempty"`
	CheckIn       time.Time `gorm:"not null" json:"check_in"`
	CheckOut      time.Time `gorm:"not null" json:"check_out"`
	GuestsCount   uint      `gorm:"not null;default:1" json:"guests_count"`
	HasDiscount   bool      `gorm:"default:false" json:"has_discount"`
}
