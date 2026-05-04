package handlers

import (
	"net/http"

	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateRoomInput struct {
	RoomNumber string           `json:"room_number" binding:"required"`
	Identifier string           `json:"identifier" binding:"required"`
	Class      models.RoomClass `json:"class" binding:"required"`
	HotelID    uint             `json:"hotel_id" binding:"required"`
	Beds       []struct {
		Capacity uint `json:"capacity" binding:"required"`
	} `json:"beds"`
}

func GetRooms(c *gin.Context) {
	var rooms []models.Room
	query := database.DB.Preload("Beds")

	if class := c.Query("class"); class != "" {
		query = query.Where("class = ?", class)
	}
	if hotelID := c.Query("hotel_id"); hotelID != "" {
		query = query.Where("hotel_id = ?", hotelID)
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
		RoomNumber: input.RoomNumber,
		Identifier: input.Identifier,
		Class:      input.Class,
		HotelID:    input.HotelID,
	}
	if err := database.DB.Create(&room).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "identifier already in use"})
		return
	}

	for _, b := range input.Beds {
		bed := models.Bed{Capacity: b.Capacity, RoomID: room.ID}
		database.DB.Create(&bed)
		room.Beds = append(room.Beds, bed)
	}

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
