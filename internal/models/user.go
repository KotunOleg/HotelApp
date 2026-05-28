package models

import "time"

type User struct {
	UserID          int            `gorm:"primaryKey;autoIncrement" json:"user_id"`
	Email           string         `gorm:"not null;uniqueIndex" json:"email"`
	PasswordHash    string         `gorm:"not null" json:"-"`
	Phone           string         `json:"phone"`
	FullName        string         `gorm:"not null" json:"full_name"`
	IsBlacklisted   bool           `gorm:"not null;default:false" json:"is_blacklisted"`
	PermissionLevel int            `gorm:"not null" json:"permission_level"`
	Permission      Permission     `gorm:"foreignKey:PermissionLevel;references:PermissionID" json:"permission,omitempty"`
	CreatedAt       time.Time      `gorm:"not null;autoCreateTime" json:"created_at"`
	Bookings        []Booking      `gorm:"foreignKey:UserID;references:UserID" json:"bookings,omitempty"`
	Reviews         []Review       `gorm:"foreignKey:UserID;references:UserID" json:"reviews,omitempty"`
	UserDiscounts   []UserDiscount `gorm:"foreignKey:UserID;references:UserID" json:"user_discounts,omitempty"`
}
