package models

type Room struct {
	RoomID        int       `gorm:"primaryKey;autoIncrement" json:"room_id"`
	HotelID       int       `gorm:"not null;uniqueIndex:idx_hotel_room_number" json:"hotel_id"`
	Hotel         Hotel     `gorm:"foreignKey:HotelID;references:HotelID" json:"hotel,omitempty"`
	RoomNumber    string    `gorm:"not null;uniqueIndex:idx_hotel_room_number" json:"room_number"`
	RoomType      string    `gorm:"not null" json:"room_type"`
	PricePerNight float64   `gorm:"type:decimal(10,2);not null" json:"price_per_night"`
	Capacity      int       `gorm:"not null" json:"capacity"`
	Floor         int       `gorm:"not null" json:"floor"`
	Status   string    `gorm:"not null;default:'available'" json:"status"`
	Beds     []Bed     `gorm:"foreignKey:RoomID;references:RoomID" json:"beds,omitempty"`
	Bookings []Booking `gorm:"foreignKey:RoomID;references:RoomID" json:"bookings,omitempty"`
}
