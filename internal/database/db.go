package database

import (
	"fmt"
	"log"
	"os"

	"hotel-app/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	DB = db
	log.Println("database connection established")
}

func Migrate() {
	err := DB.AutoMigrate(
		&models.Permission{},
		&models.Hotel{},
		&models.User{},
		&models.Room{},
		&models.Bed{},
		&models.DiscountProgram{},
		&models.UserDiscount{},
		&models.Booking{},
		&models.Payment{},
		&models.Review{},
		&models.EmployeeLog{},
	)
	if err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("database migration completed")
}
