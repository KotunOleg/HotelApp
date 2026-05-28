package handlers

import (
	"net/http"

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

	review := models.Review{
		UserID:  input.UserID,
		HotelID: input.HotelID,
		Rating:  input.Rating,
		Content: input.Content,
	}
	database.DB.Create(&review)
	c.JSON(http.StatusCreated, review)
}
