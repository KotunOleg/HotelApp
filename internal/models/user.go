package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	FirstName string    `gorm:"not null" json:"first_name"`
	LastName  string    `gorm:"not null" json:"last_name"`
	Email     string    `gorm:"uniqueIndex;not null" json:"email"`
	Phone     string    `gorm:"uniqueIndex;not null" json:"phone"`
	Password  string    `gorm:"not null" json:"-"`
	Bookings  []Booking `json:"bookings,omitempty"`
	Reviews   []Review  `json:"reviews,omitempty"`
}
