package handlers

import (
	"net/http"

	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateRoomInput struct {
	HotelID       int     `json:"hotel_id" binding:"required"`
	RoomNumber    string  `json:"room_number" binding:"required"`
	RoomType      string  `json:"room_type" binding:"required"`
	PricePerNight float64 `json:"price_per_night" binding:"required,gt=0"`
	Capacity      int     `json:"capacity" binding:"required,min=1"`
	Floor         int     `json:"floor" binding:"required,min=1"`
}

func GetRooms(c *gin.Context) {
	var rooms []models.Room

	// preload beds + active future bookings (for showing occupied dates)
	query := database.DB.
		Preload("Beds").
		Preload("Bookings", func(db *gorm.DB) *gorm.DB {
			return db.Where("status != 'cancelled' AND check_out_date > NOW()").
				Order("check_in_date ASC")
		})

	if roomType := c.Query("type"); roomType != "" {
		query = query.Where("room_type = ?", roomType)
	}
	if hotelID := c.Query("hotel_id"); hotelID != "" {
		query = query.Where("hotel_id = ?", hotelID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	// filter by date availability
	checkIn  := c.Query("check_in")
	checkOut := c.Query("check_out")
	if checkIn != "" && checkOut != "" {
		query = query.Where(
			"room_id NOT IN (SELECT room_id FROM bookings WHERE status != 'cancelled' AND check_in_date < ? AND check_out_date > ?)",
			checkOut, checkIn,
		)
	}

	query.Find(&rooms)
	c.JSON(http.StatusOK, rooms)
}

func GetRoom(c *gin.Context) {
	var room models.Room
	if err := database.DB.Preload("Beds").First(&room, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
		return
	}
	c.JSON(http.StatusOK, room)
}

func CreateRoom(c *gin.Context) {
	var input CreateRoomInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existing models.Room
	if err := database.DB.Where("hotel_id = ? AND room_number = ?", input.HotelID, input.RoomNumber).First(&existing).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "кімната з таким номером вже існує в цьому готелі"})
		return
	}

	room := models.Room{
		HotelID:       input.HotelID,
		RoomNumber:    input.RoomNumber,
		RoomType:      input.RoomType,
		PricePerNight: input.PricePerNight,
		Capacity:      input.Capacity,
		Floor:         input.Floor,
		Status:        "available",
	}
	database.DB.Create(&room)
	c.JSON(http.StatusCreated, room)
}

func DeleteRoom(c *gin.Context) {
	var room models.Room
	if err := database.DB.First(&room, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
		return
	}
	database.DB.Delete(&room)
	c.JSON(http.StatusOK, gin.H{"message": "room deleted"})
}
