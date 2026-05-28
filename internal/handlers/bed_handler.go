package handlers

import (
	"net/http"

	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/gin-gonic/gin"
)

var validBedTypes = map[string]bool{
	"single": true,
	"double": true,
	"queen":  true,
	"king":   true,
	"sofa":   true,
}

type CreateBedInput struct {
	RoomID   int    `json:"room_id" binding:"required"`
	BedType  string `json:"bed_type" binding:"required"`
	Capacity int    `json:"capacity" binding:"required,min=1,max=4"`
}

func GetBeds(c *gin.Context) {
	var beds []models.Bed
	query := database.DB
	if roomID := c.Query("room_id"); roomID != "" {
		query = query.Where("room_id = ?", roomID)
	}
	query.Find(&beds)
	c.JSON(http.StatusOK, beds)
}

func CreateBed(c *gin.Context) {
	var input CreateBedInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !validBedTypes[input.BedType] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "невірний тип ліжка. Допустимі: single, double, queen, king, sofa",
		})
		return
	}

	var room models.Room
	if err := database.DB.First(&room, input.RoomID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "кімнату не знайдено"})
		return
	}

	bed := models.Bed{
		RoomID:   input.RoomID,
		BedType:  input.BedType,
		Capacity: input.Capacity,
	}
	database.DB.Create(&bed)
	c.JSON(http.StatusCreated, bed)
}

func DeleteBed(c *gin.Context) {
	var bed models.Bed
	if err := database.DB.First(&bed, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ліжко не знайдено"})
		return
	}
	database.DB.Delete(&bed)
	c.JSON(http.StatusOK, gin.H{"message": "ліжко видалено"})
}
