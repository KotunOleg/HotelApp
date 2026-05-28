package handlers

import (
	"net/http"

	"hotel-app/internal/database"
	"hotel-app/internal/models"
	"hotel-app/internal/validation"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Email           string `json:"email" binding:"required,email"`
	Password        string `json:"password" binding:"required,min=6"`
	Phone           string `json:"phone"`
	FullName        string `json:"full_name" binding:"required"`
	PermissionLevel int    `json:"permission_level" binding:"required"`
}

type UpdateUserInput struct {
	Phone    string `json:"phone"`
	FullName string `json:"full_name"`
}

type ChangePasswordInput struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

func GetUsers(c *gin.Context) {
	var users []models.User
	database.DB.Preload("Permission").Find(&users)
	c.JSON(http.StatusOK, users)
}

func GetUser(c *gin.Context) {
	var user models.User
	if err := database.DB.Preload("Permission").First(&user, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Phone != "" && !validation.IsValidPhone(input.Phone) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "невірний формат телефону, використовуйте +380XXXXXXXXX"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	user := models.User{
		Email:           input.Email,
		PasswordHash:    string(hashed),
		Phone:           input.Phone,
		FullName:        input.FullName,
		PermissionLevel: input.PermissionLevel,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email already in use"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func UpdateUser(c *gin.Context) {
	var user models.User
	if err := database.DB.First(&user, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	var input UpdateUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Phone != "" && !validation.IsValidPhone(input.Phone) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "невірний формат телефону, використовуйте +380XXXXXXXXX"})
		return
	}

	database.DB.Model(&user).Updates(input)
	c.JSON(http.StatusOK, user)
}

func ChangePassword(c *gin.Context) {
	var user models.User
	if err := database.DB.First(&user, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	var input ChangePasswordInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.OldPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "incorrect old password"})
		return
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	database.DB.Model(&user).Update("password_hash", string(hashed))
	c.JSON(http.StatusOK, gin.H{"message": "password updated"})
}

func DeleteUser(c *gin.Context) {
	var user models.User
	if err := database.DB.First(&user, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	database.DB.Delete(&user)
	c.JSON(http.StatusOK, gin.H{"message": "user deleted"})
}
