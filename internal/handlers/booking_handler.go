package handlers

import (
	"net/http"
	"time"

	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateBookingInput struct {
	UserID      uint      `json:"user_id" binding:"required"`
	RoomID      uint      `json:"room_id" binding:"required"`
	CheckIn     time.Time `json:"check_in" binding:"required"`
	CheckOut    time.Time `json:"check_out" binding:"required"`
	GuestsCount uint      `json:"guests_count" binding:"required,min=1"`
}

func GetBookings(c *gin.Context) {
	var bookings []models.Booking
	database.DB.Preload("User").Preload("Room").Find(&bookings)
	c.JSON(http.StatusOK, bookings)
}

func GetBooking(c *gin.Context) {
	var booking models.Booking
	if err := database.DB.Preload("User").Preload("Room").First(&booking, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found"})
		return
	}
	c.JSON(http.StatusOK, booking)
}

func CreateBooking(c *gin.Context) {
	var input CreateBookingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !input.CheckOut.After(input.CheckIn) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "check_out must be after check_in"})
		return
	}

	var conflict models.Booking
	err := database.DB.Where(
		"room_id = ? AND check_in < ? AND check_out > ?",
		input.RoomID, input.CheckOut, input.CheckIn,
	).First(&conflict).Error
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "room is not available for selected dates"})
		return
	}

	booking := models.Booking{
		UserID:      input.UserID,
		RoomID:      input.RoomID,
		CheckIn:     input.CheckIn,
		CheckOut:    input.CheckOut,
		GuestsCount: input.GuestsCount,
	}
	database.DB.Create(&booking)
	c.JSON(http.StatusCreated, booking)
}

func DeleteBooking(c *gin.Context) {
	var booking models.Booking
	if err := database.DB.First(&booking, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found"})
		return
	}
	database.DB.Delete(&booking)
	c.JSON(http.StatusOK, gin.H{"message": "booking cancelled"})
}
