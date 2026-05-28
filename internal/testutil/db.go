package testutil

import (
	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func SetupTestDB() {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to open test database: " + err.Error())
	}

	db.AutoMigrate(
		&models.Permission{},
		&models.Hotel{},
		&models.User{},
		&models.Room{},
		&models.DiscountProgram{},
		&models.UserDiscount{},
		&models.Booking{},
		&models.Payment{},
		&models.Review{},
		&models.EmployeeLog{},
	)

	database.DB = db
}
