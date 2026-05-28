package models

import "time"

type EmployeeLog struct {
	LogID       int       `gorm:"primaryKey;autoIncrement" json:"log_id"`
	EmployeeID  int       `gorm:"not null" json:"employee_id"`
	Employee    User      `gorm:"foreignKey:EmployeeID;references:UserID" json:"employee,omitempty"`
	Action      string    `gorm:"not null" json:"action"`
	Description string    `json:"description"`
	CreatedAt   time.Time `gorm:"not null;autoCreateTime" json:"created_at"`
}
