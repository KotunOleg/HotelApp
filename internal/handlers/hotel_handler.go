package handlers

import (
	"net/http"

	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateHotelInput struct {
	Name       string `json:"name" binding:"required"`
	Address    string `json:"address" binding:"required"`
	City       string `json:"city" binding:"required"`
	Country    string `json:"country" binding:"required"`
	StarRating int    `json:"star_rating" binding:"required,min=1,max=5"`
	Phone      string `json:"phone"`
}

type UpdateHotelInput struct {
	Name       string `json:"name"`
	Address    string `json:"address"`
	City       string `json:"city"`
	Country    string `json:"country"`
	StarRating int    `json:"star_rating" binding:"omitempty,min=1,max=5"`
	Phone      string `json:"phone"`
}

func GetHotels(c *gin.Context) {
	var hotels []models.Hotel
	database.DB.Find(&hotels)
	c.JSON(http.StatusOK, hotels)
}

func GetHotel(c *gin.Context) {
	var hotel models.Hotel
	if err := database.DB.Preload("Rooms").Preload("Reviews").First(&hotel, c.Param("id")).Error; err != nil {
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

	hotel := models.Hotel{
		Name:       input.Name,
		Address:    input.Address,
		City:       input.City,
		Country:    input.Country,
		StarRating: input.StarRating,
		Phone:      input.Phone,
	}
	database.DB.Create(&hotel)
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
