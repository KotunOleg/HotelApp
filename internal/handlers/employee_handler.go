package handlers

import (
	"net/http"

	"hotel-app/internal/database"
	"hotel-app/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateEmployeeInput struct {
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Phone     string `json:"phone" binding:"required"`
	Position  string `json:"position"`
	HotelID   uint   `json:"hotel_id" binding:"required"`
}

func GetEmployees(c *gin.Context) {
	var employees []models.Employee
	database.DB.Find(&employees)
	c.JSON(http.StatusOK, employees)
}

func GetEmployee(c *gin.Context) {
	var employee models.Employee
	if err := database.DB.First(&employee, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
		return
	}
	c.JSON(http.StatusOK, employee)
}

func CreateEmployee(c *gin.Context) {
	var input CreateEmployeeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	employee := models.Employee{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Phone:     input.Phone,
		Position:  input.Position,
		HotelID:   input.HotelID,
	}
	if err := database.DB.Create(&employee).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email already in use"})
		return
	}
	c.JSON(http.StatusCreated, employee)
}

func DeleteEmployee(c *gin.Context) {
	var employee models.Employee
	if err := database.DB.First(&employee, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
		return
	}
	database.DB.Delete(&employee)
	c.JSON(http.StatusOK, gin.H{"message": "employee deleted"})
}
