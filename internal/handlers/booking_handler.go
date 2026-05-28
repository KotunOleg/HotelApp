package handlers

import (
	"net/http"
	"time"

	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateBookingInput struct {
	UserID       int       `json:"user_id" binding:"required"`
	RoomID       int       `json:"room_id" binding:"required"`
	DiscountID   *int      `json:"discount_id"`
	CheckInDate  time.Time `json:"check_in_date" binding:"required"`
	CheckOutDate time.Time `json:"check_out_date" binding:"required"`
	TotalPrice   float64   `json:"total_price" binding:"required"`
}

func GetBookings(c *gin.Context) {
	var bookings []models.Booking
	query := database.DB.Preload("User").Preload("Room").Preload("Discount").Preload("Payment")
	if userID := c.Query("user_id"); userID != "" {
		query = query.Where("user_id = ?", userID)
	}
	query.Find(&bookings)
	c.JSON(http.StatusOK, bookings)
}

func GetBooking(c *gin.Context) {
	var booking models.Booking
	if err := database.DB.Preload("User").Preload("Room").Preload("Discount").Preload("Payment").First(&booking, c.Param("id")).Error; err != nil {
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

	if !input.CheckOutDate.After(input.CheckInDate) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "check_out_date must be after check_in_date"})
		return
	}

	var room models.Room
	if err := database.DB.First(&room, input.RoomID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "кімнату не знайдено"})
		return
	}
	if room.Status == "occupied" {
		c.JSON(http.StatusConflict, gin.H{"error": "кімната зайнята"})
		return
	}

	var conflict models.Booking
	err := database.DB.Where(
		"room_id = ? AND check_in_date < ? AND check_out_date > ? AND status != 'cancelled'",
		input.RoomID, input.CheckOutDate, input.CheckInDate,
	).First(&conflict).Error
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "кімната вже заброньована на ці дати"})
		return
	}

	booking := models.Booking{
		UserID:       input.UserID,
		RoomID:       input.RoomID,
		DiscountID:   input.DiscountID,
		CheckInDate:  input.CheckInDate,
		CheckOutDate: input.CheckOutDate,
		TotalPrice:   input.TotalPrice,
		Status:       "pending",
	}
	database.DB.Create(&booking)
	c.JSON(http.StatusCreated, booking)
}

func ConfirmBooking(c *gin.Context) {
	var booking models.Booking
	if err := database.DB.First(&booking, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found"})
		return
	}
	if booking.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "можна підтвердити лише бронювання зі статусом 'pending'"})
		return
	}
	database.DB.Model(&booking).Update("status", "confirmed")

	// mark room as occupied
	database.DB.Model(&models.Room{}).Where("room_id = ?", booking.RoomID).Update("status", "occupied")

	c.JSON(http.StatusOK, gin.H{"message": "бронювання підтверджено", "booking_id": booking.BookingID})
}

func DeleteBooking(c *gin.Context) {
	var booking models.Booking
	if err := database.DB.First(&booking, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "booking not found"})
		return
	}
	database.DB.Model(&booking).Update("status", "cancelled")
	c.JSON(http.StatusOK, gin.H{"message": "booking cancelled"})
}
