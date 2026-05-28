package models

type Bed struct {
	BedID    int    `gorm:"primaryKey;autoIncrement" json:"bed_id"`
	RoomID   int    `gorm:"not null" json:"room_id"`
	BedType  string `gorm:"not null" json:"bed_type"`
	Capacity int    `gorm:"not null;default:1" json:"capacity"`
}
