package handlers

import (
	"net/http"

	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateRoomInput struct {
	HotelID       int     `json:"hotel_id" binding:"required"`
	RoomNumber    string  `json:"room_number" binding:"required"`
	RoomType      string  `json:"room_type" binding:"required"`
	PricePerNight float64 `json:"price_per_night" binding:"required"`
	Capacity      int     `json:"capacity" binding:"required,min=1"`
	Floor         int     `json:"floor" binding:"required"`
}

func GetRooms(c *gin.Context) {
	var rooms []models.Room
	query := database.DB.Preload("Beds")

	if roomType := c.Query("type"); roomType != "" {
		query = query.Where("room_type = ?", roomType)
	}
	if hotelID := c.Query("hotel_id"); hotelID != "" {
		query = query.Where("hotel_id = ?", hotelID)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
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
