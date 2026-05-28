package models

import "time"

type DiscountProgram struct {
	DiscountID      int            `gorm:"primaryKey;autoIncrement" json:"discount_id"`
	Name            string         `gorm:"not null" json:"name"`
	DiscountPercent float64        `gorm:"type:decimal(5,2);not null" json:"discount_percent"`
	MinBookings     int            `gorm:"not null;default:0" json:"min_bookings"`
	Description     string         `json:"description"`
	IsActive        bool           `gorm:"not null;default:true" json:"is_active"`
	StartDate       time.Time      `gorm:"type:date;not null" json:"start_date"`
	EndDate         time.Time      `gorm:"type:date;not null" json:"end_date"`
	UserDiscounts   []UserDiscount `gorm:"foreignKey:DiscountID;references:DiscountID" json:"user_discounts,omitempty"`
	Bookings        []Booking      `gorm:"foreignKey:DiscountID;references:DiscountID" json:"bookings,omitempty"`
}

type UserDiscount struct {
	UserDiscountID int             `gorm:"primaryKey;autoIncrement" json:"user_discount_id"`
	UserID         int             `gorm:"not null" json:"user_id"`
	User           User            `gorm:"foreignKey:UserID;references:UserID" json:"user,omitempty"`
	DiscountID     int             `gorm:"not null" json:"discount_id"`
	Discount       DiscountProgram `gorm:"foreignKey:DiscountID;references:DiscountID" json:"discount,omitempty"`
	JoinedAt       time.Time       `gorm:"not null;autoCreateTime" json:"joined_at"`
	TotalBookings  int             `gorm:"not null;default:0" json:"total_bookings"`
	IsActive       bool            `gorm:"not null;default:true" json:"is_active"`
}
