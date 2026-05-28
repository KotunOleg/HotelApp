package models

import "time"

type Review struct {
	ReviewID  int       `gorm:"primaryKey;autoIncrement" json:"review_id"`
	UserID    int       `gorm:"not null" json:"user_id"`
	User      User      `json:"user,omitempty"`
	HotelID   int       `gorm:"not null" json:"hotel_id"`
	Hotel     Hotel     `json:"hotel,omitempty"`
	Rating    int       `gorm:"not null;check:rating between 1 and 5" json:"rating"`
	Content   string    `gorm:"not null" json:"content"`
	CreatedAt time.Time `gorm:"not null;default:now()" json:"created_at"`
}
