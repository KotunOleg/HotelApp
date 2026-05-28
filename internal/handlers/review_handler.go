package handlers

import (
	"net/http"
	"time"

	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateReviewInput struct {
	UserID  int    `json:"user_id" binding:"required"`
	HotelID int    `json:"hotel_id" binding:"required"`
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Content string `json:"content" binding:"required"`
}

func GetReviews(c *gin.Context) {
	var reviews []models.Review
	query := database.DB.Preload("User")
	if hotelID := c.Query("hotel_id"); hotelID != "" {
		query = query.Where("hotel_id = ?", hotelID)
	}
	query.Find(&reviews)
	c.JSON(http.StatusOK, reviews)
}

func CreateReview(c *gin.Context) {
	var input CreateReviewInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// user must have a confirmed booking for this hotel that has already ended
	var completedBooking models.Booking
	err := database.DB.
		Joins("JOIN rooms ON rooms.room_id = bookings.room_id").
		Where(
			"bookings.user_id = ? AND rooms.hotel_id = ? AND bookings.status = 'confirmed' AND bookings.check_out_date < ?",
			input.UserID, input.HotelID, time.Now(),
		).
		First(&completedBooking).Error

	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "відгук можна залишити лише після завершення підтвердженого бронювання в цьому готелі",
		})
		return
	}

	// prevent duplicate review for the same booking period
	var existing models.Review
	if database.DB.Where("user_id = ? AND hotel_id = ?", input.UserID, input.HotelID).First(&existing).Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "ви вже залишили відгук для цього готелю"})
		return
	}

	review := models.Review{
		UserID:  input.UserID,
		HotelID: input.HotelID,
		Rating:  input.Rating,
		Content: input.Content,
	}
	database.DB.Create(&review)
	c.JSON(http.StatusCreated, review)
}
