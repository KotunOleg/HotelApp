package models

import "gorm.io/gorm"

type Bed struct {
	gorm.Model
	Capacity uint `gorm:"not null" json:"capacity"`
	RoomID   uint `gorm:"not null" json:"room_id"`
}
