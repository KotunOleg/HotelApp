package handlers_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"hotel-app/internal/database"
	"hotel-app/internal/handlers"
	"hotel-app/internal/models"
	"hotel-app/internal/testutil"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/api/hotels", handlers.GetHotels)
	r.GET("/api/hotels/:id", handlers.GetHotel)
	r.POST("/api/hotels", handlers.CreateHotel)
	r.PUT("/api/hotels/:id", handlers.UpdateHotel)
	r.DELETE("/api/hotels/:id", handlers.DeleteHotel)
	r.GET("/api/rooms", handlers.GetRooms)
	r.POST("/api/rooms", handlers.CreateRoom)
	r.DELETE("/api/rooms/:id", handlers.DeleteRoom)
	return r
}

func TestMain(m *testing.M) {
	testutil.SetupTestDB()
	m.Run()
}

// ── Hotel tests ──────────────────────────────────────────────────────────────

func TestGetHotels_Empty(t *testing.T) {
	r := setupRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/hotels", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var result []models.Hotel
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &result))
	assert.NotNil(t, result)
}

func TestCreateHotel_Success(t *testing.T) {
	r := setupRouter()
	body := `{"name":"Grand Hotel","address":"Хрещатик 1","city":"Київ","country":"Україна","star_rating":5,"phone":"+380441234567"}`
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/api/hotels", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	var hotel models.Hotel
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &hotel))
	assert.Equal(t, "Grand Hotel", hotel.Name)
	assert.Equal(t, "Київ", hotel.City)
	assert.Equal(t, 5, hotel.StarRating)

	database.DB.Unscoped().Delete(&hotel)
}

func TestCreateHotel_MissingRequiredFields(t *testing.T) {
	r := setupRouter()
	body := `{"name":"Incomplete"}`
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/api/hotels", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetHotel_NotFound(t *testing.T) {
	r := setupRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/hotels/99999", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestUpdateHotel_Success(t *testing.T) {
	hotel := models.Hotel{Name: "Old Name", Address: "вул. Тест 1", City: "Харків", Country: "Україна", StarRating: 3}
	database.DB.Create(&hotel)
	defer database.DB.Unscoped().Delete(&hotel)

	r := setupRouter()
	body := `{"name":"New Name","star_rating":4}`
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPut, fmt.Sprintf("/api/hotels/%d", hotel.HotelID), bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestDeleteHotel_Success(t *testing.T) {
	hotel := models.Hotel{Name: "To Delete", Address: "вул. X", City: "Одеса", Country: "Україна", StarRating: 2}
	database.DB.Create(&hotel)

	r := setupRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, fmt.Sprintf("/api/hotels/%d", hotel.HotelID), nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestDeleteHotel_NotFound(t *testing.T) {
	r := setupRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodDelete, "/api/hotels/99999", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// ── Room tests ───────────────────────────────────────────────────────────────

func TestCreateRoom_Success(t *testing.T) {
	hotel := models.Hotel{Name: "Room Test Hotel", Address: "вул. А", City: "Дніпро", Country: "Україна", StarRating: 3}
	database.DB.Create(&hotel)
	defer database.DB.Unscoped().Delete(&hotel)

	r := setupRouter()
	body := fmt.Sprintf(`{"hotel_id":%d,"room_number":"101","room_type":"standard","price_per_night":1200.50,"capacity":2,"floor":1}`, hotel.HotelID)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/api/rooms", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	var room models.Room
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &room))
	assert.Equal(t, "101", room.RoomNumber)
	assert.Equal(t, "standard", room.RoomType)

	database.DB.Unscoped().Delete(&room)
}

func TestCreateRoom_MissingFields(t *testing.T) {
	r := setupRouter()
	body := `{"room_number":"202"}`
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodPost, "/api/rooms", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestGetRooms_FilterByType(t *testing.T) {
	hotel := models.Hotel{Name: "Filter Hotel", Address: "вул. Б", City: "Запоріжжя", Country: "Україна", StarRating: 2}
	database.DB.Create(&hotel)
	room := models.Room{HotelID: int(hotel.HotelID), RoomNumber: "301", RoomType: "suite", PricePerNight: 3000, Capacity: 4, Floor: 3, Status: "available"}
	database.DB.Create(&room)
	defer func() {
		database.DB.Unscoped().Delete(&room)
		database.DB.Unscoped().Delete(&hotel)
	}()

	r := setupRouter()
	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/api/rooms?type=suite", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var rooms []models.Room
	require.NoError(t, json.Unmarshal(w.Body.Bytes(), &rooms))
	for _, rm := range rooms {
		assert.Equal(t, "suite", rm.RoomType)
	}
}
