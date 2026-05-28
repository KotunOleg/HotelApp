package models

type Permission struct {
	PermissionID int    `gorm:"primaryKey;autoIncrement" json:"permission_id"`
	Role         string `gorm:"not null;uniqueIndex" json:"role"`
	Users        []User `gorm:"foreignKey:PermissionLevel;references:PermissionID" json:"users,omitempty"`
}
