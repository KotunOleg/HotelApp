package handlers

import (
	"net/http"

	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateHotelInput struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`
	Street      string `json:"street" binding:"required"`
	City        string `json:"city" binding:"required"`
	Country     string `json:"country" binding:"required"`
	ZipCode     string `json:"zip_code"`
}

type UpdateHotelInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url"`
}

func GetHotels(c *gin.Context) {
	var hotels []models.Hotel
	database.DB.Preload("Address").Find(&hotels)
	c.JSON(http.StatusOK, hotels)
}

func GetHotel(c *gin.Context) {
	var hotel models.Hotel
	if err := database.DB.Preload("Address").Preload("Rooms").Preload("Reviews").First(&hotel, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "hotel not found"})
		return
	}
	c.JSON(http.StatusOK, hotel)
}

func CreateHotel(c *gin.Context) {
	var input CreateHotelInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	address := models.Address{
		Street:  input.Street,
		City:    input.City,
		Country: input.Country,
		ZipCode: input.ZipCode,
	}
	database.DB.Create(&address)

	hotel := models.Hotel{
		Name:        input.Name,
		Description: input.Description,
		ImageURL:    input.ImageURL,
		AddressID:   address.ID,
	}
	database.DB.Create(&hotel)
	hotel.Address = address

	c.JSON(http.StatusCreated, hotel)
}

func UpdateHotel(c *gin.Context) {
	var hotel models.Hotel
	if err := database.DB.First(&hotel, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "hotel not found"})
		return
	}

	var input UpdateHotelInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	database.DB.Model(&hotel).Updates(input)
	c.JSON(http.StatusOK, hotel)
}

func DeleteHotel(c *gin.Context) {
	var hotel models.Hotel
	if err := database.DB.First(&hotel, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "hotel not found"})
		return
	}
	database.DB.Delete(&hotel)
	c.JSON(http.StatusOK, gin.H{"message": "hotel deleted"})
}
