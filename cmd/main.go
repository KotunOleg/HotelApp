package main

import (
	"log"
	"net/http"
	"strings"

	"hotel-app/internal/database"
	"hotel-app/internal/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, reading environment variables")
	}

	database.Connect()
	database.Migrate()

	r := setupRouter()
	r.Run(":8080")
}

func setupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: false,
	}))

	// React assets (JS, CSS)
	r.Static("/assets", "./static/assets")
	// SPA fallback — all non-API routes serve index.html
	r.NoRoute(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/api") {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.File("./static/index.html")
	})

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
		}

		users := api.Group("/users")
		{
			users.GET("", handlers.GetUsers)
			users.GET("/:id", handlers.GetUser)
			users.PUT("/:id", handlers.UpdateUser)
			users.PUT("/:id/password", handlers.ChangePassword)
			users.PUT("/:id/block", handlers.BlockUser)
			users.PUT("/:id/unblock", handlers.UnblockUser)
			users.DELETE("/:id", handlers.DeleteUser)
		}

		hotels := api.Group("/hotels")
		{
			hotels.GET("", handlers.GetHotels)
			hotels.GET("/:id", handlers.GetHotel)
			hotels.POST("", handlers.CreateHotel)
			hotels.PUT("/:id", handlers.UpdateHotel)
			hotels.DELETE("/:id", handlers.DeleteHotel)
		}

		rooms := api.Group("/rooms")
		{
			rooms.GET("", handlers.GetRooms)
			rooms.GET("/:id", handlers.GetRoom)
			rooms.POST("", handlers.CreateRoom)
			rooms.DELETE("/:id", handlers.DeleteRoom)
		}

		bookings := api.Group("/bookings")
		{
			bookings.GET("", handlers.GetBookings)
			bookings.GET("/:id", handlers.GetBooking)
			bookings.POST("", handlers.CreateBooking)
			bookings.PUT("/:id/confirm", handlers.ConfirmBooking)
			bookings.DELETE("/:id", handlers.DeleteBooking)
		}

		beds := api.Group("/beds")
		{
			beds.GET("", handlers.GetBeds)
			beds.POST("", handlers.CreateBed)
			beds.DELETE("/:id", handlers.DeleteBed)
		}

		reviews := api.Group("/reviews")
		{
			reviews.GET("", handlers.GetReviews)
			reviews.POST("", handlers.CreateReview)
		}

		logs := api.Group("/logs")
		{
			logs.GET("", handlers.GetLogs)
			logs.POST("", handlers.CreateLog)
		}
	}

	return r
}
