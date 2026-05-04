package main

import (
	"log"

	"hotel-app/internal/database"
	"hotel-app/internal/handlers"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, reading environment variables")
	}

	database.Connect()
	database.Migrate()

	r := gin.Default()

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
			bookings.DELETE("/:id", handlers.DeleteBooking)
		}

		employees := api.Group("/employees")
		{
			employees.GET("", handlers.GetEmployees)
			employees.GET("/:id", handlers.GetEmployee)
			employees.POST("", handlers.CreateEmployee)
			employees.DELETE("/:id", handlers.DeleteEmployee)
		}

		reviews := api.Group("/reviews")
		{
			reviews.GET("", handlers.GetReviews)
			reviews.POST("", handlers.CreateReview)
		}
	}

	r.Run(":8080")
}
