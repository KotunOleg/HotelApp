package models

import "gorm.io/gorm"

type RoomClass string

const (
	RoomClassStandard RoomClass = "standard"
	RoomClassDeluxe   RoomClass = "deluxe"
	RoomClassSuite    RoomClass = "suite"
)

type Room struct {
	gorm.Model
	RoomNumber string    `gorm:"not null" json:"room_number"`
	Identifier string    `gorm:"uniqueIndex;not null" json:"identifier"`
	Class      RoomClass `gorm:"not null;default:'standard'" json:"class"`
	HotelID    uint      `gorm:"not null" json:"hotel_id"`
	Hotel      Hotel     `json:"hotel,omitempty"`
	Beds       []Bed     `json:"beds,omitempty"`
	Bookings   []Booking `json:"bookings,omitempty"`
}
