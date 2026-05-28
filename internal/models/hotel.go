package models

type Hotel struct {
	HotelID    int      `gorm:"primaryKey;autoIncrement" json:"hotel_id"`
	Name       string   `gorm:"not null" json:"name"`
	Address    string   `gorm:"not null" json:"address"`
	City       string   `gorm:"not null" json:"city"`
	Country    string   `gorm:"not null" json:"country"`
	StarRating int      `json:"star_rating"`
	Phone      string   `json:"phone"`
	Rooms      []Room   `gorm:"foreignKey:HotelID;references:HotelID" json:"rooms,omitempty"`
	Reviews    []Review `gorm:"foreignKey:HotelID;references:HotelID" json:"reviews,omitempty"`
}
