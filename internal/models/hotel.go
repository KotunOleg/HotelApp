package models

import "gorm.io/gorm"

type Hotel struct {
	gorm.Model
	Name        string     `gorm:"not null" json:"name"`
	Description string     `json:"description"`
	ImageURL    string     `json:"image_url"`
	AddressID   uint       `gorm:"not null" json:"address_id"`
	Address     Address    `json:"address,omitempty"`
	Rooms       []Room     `json:"rooms,omitempty"`
	Employees   []Employee `json:"employees,omitempty"`
	Reviews     []Review   `json:"reviews,omitempty"`
}
