package handlers

import (
	"net/http"

	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateLogInput struct {
	EmployeeID  int    `json:"employee_id" binding:"required"`
	Action      string `json:"action" binding:"required"`
	Description string `json:"description"`
}

func GetLogs(c *gin.Context) {
	var logs []models.EmployeeLog
	query := database.DB.Preload("Employee")
	if empID := c.Query("employee_id"); empID != "" {
		query = query.Where("employee_id = ?", empID)
	}
	query.Find(&logs)
	c.JSON(http.StatusOK, logs)
}

func CreateLog(c *gin.Context) {
	var input CreateLogInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	entry := models.EmployeeLog{
		EmployeeID:  input.EmployeeID,
		Action:      input.Action,
		Description: input.Description,
	}
	database.DB.Create(&entry)
	c.JSON(http.StatusCreated, entry)
}
