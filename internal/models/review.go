package models

import "time"

type Review struct {
	ReviewID  int       `gorm:"primaryKey;autoIncrement" json:"review_id"`
	UserID    int       `gorm:"not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID;references:UserID" json:"user,omitempty"`
	HotelID   int       `gorm:"not null" json:"hotel_id"`
	Hotel     Hotel     `gorm:"foreignKey:HotelID;references:HotelID" json:"hotel,omitempty"`
	Rating    int       `gorm:"not null" json:"rating"`
	Content   string    `gorm:"not null" json:"content"`
	CreatedAt time.Time `gorm:"not null;autoCreateTime" json:"created_at"`
}
