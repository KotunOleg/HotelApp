package models

import "time"

type Booking struct {
	BookingID     int              `gorm:"primaryKey;autoIncrement" json:"booking_id"`
	UserID        int              `gorm:"not null" json:"user_id"`
	User          User             `json:"user,omitempty"`
	RoomID        int              `gorm:"not null" json:"room_id"`
	Room          Room             `json:"room,omitempty"`
	DiscountID    *int             `json:"discount_id"`
	Discount      *DiscountProgram `json:"discount,omitempty"`
	CheckInDate   time.Time        `gorm:"type:date;not null" json:"check_in_date"`
	CheckOutDate  time.Time        `gorm:"type:date;not null" json:"check_out_date"`
	TotalPrice    float64          `gorm:"type:decimal(10,2);not null" json:"total_price"`
	Status        string           `gorm:"not null;default:'pending'" json:"status"`
	CreatedAt     time.Time        `gorm:"not null;default:now()" json:"created_at"`
	Payment       *Payment         `json:"payment,omitempty"`
}
