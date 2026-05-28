package models

import "time"

type Payment struct {
	PaymentID     int        `gorm:"primaryKey;autoIncrement" json:"payment_id"`
	BookingID     int        `gorm:"not null;uniqueIndex" json:"booking_id"`
	Amount        float64    `gorm:"type:decimal(10,2);not null" json:"amount"`
	PaymentMethod string     `gorm:"not null" json:"payment_method"`
	Status        string     `gorm:"not null;default:'pending'" json:"status"`
	PaidAt        *time.Time `json:"paid_at"`
}
