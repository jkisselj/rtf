package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"forum/server/internal/models"
	"forum/server/internal/store"
	"forum/server/pkg/router"

	"github.com/gorilla/sessions"
)

const (
	sessionName        = "session"
	ctxKeyUser  ctxKey = iota
	ctxKeyRequestID
)

type ctxKey int8

type server struct {
	router       *router.Router
	logger       *log.Logger
	store        store.Store
	sessionStore sessions.Store
}

func newServer(store store.Store, sessionStore sessions.Store) *server {
	s := &server{
		router:       router.NewRouter(),
		logger:       log.Default(),
		store:        store,
		sessionStore: sessionStore,
	}

	s.configureRouter()

	return s
}

func (s *server) configureRouter() {
	// Using middlewares
	s.router.Use(s.setRequestID)
	s.router.Use(s.logRequest)
	s.router.Use(s.CORSMiddleware)

	s.router.HandleFunc("POST", "/api/v1/users/create", s.handleUsersCreate())
	s.router.HandleFunc("POST", "/api/v1/users/login", s.handleUsersLogin())
	s.router.HandleFunc("GET", "/api/v1/auth/checkCookie", s.handleCheckCookie())

	s.router.UseWithPrefix("/private", s.jwtMiddleware)

	s.router.HandleFunc("*", "/api/v1/users/private/findById", s.handleUsersGetById())
}

func (s *server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}
func (s *server) handleCheckCookie() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(sessionName)
		if err != nil {
			s.logger.Printf("error: %s", err)
			// Cookie not present, respond with JSON indicating false
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]bool{"cookiePresent": false})
			return
		}
		fmt.Println(cookie.Value)
		// Cookie is present, respond with JSON indicating true
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]bool{"cookiePresent": true})
	}
}


func (s *server) handleUsersLogin() http.HandlerFunc {
	type RequestBody struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		var requestBody RequestBody

		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		user, err := s.store.User().CheckUser(requestBody.Email)
		if err != nil && !user.ComparePassword(requestBody.Password) {
			s.error(w, r, http.StatusUnauthorized, errors.New("invalid login credentials"))
			return
		}

		expiration := time.Now().Add(5 * time.Hour)
		token, err := s.generateToken(user.ID, expiration)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		r.Header.Set("Authorization", "Bearer "+token)
		cookie := http.Cookie{
			Name:     sessionName,
			Value:    token,
			Expires:  expiration,
			Path:     "/",
			HttpOnly: true,
			Secure:   true,
			SameSite: http.SameSiteNoneMode,

		}

		http.SetCookie(w, &cookie)

		// we don't actually need token in respond
		s.respond(w, r, http.StatusOK, token)
	}
}

func (s *server) handleUsersGetById() http.HandlerFunc {
	type RequestBody struct {
		ID string `json:"id"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		var requestBody RequestBody
		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		user, err := s.store.User().FindByID(requestBody.ID)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		s.respond(w, r, http.StatusCreated, user)
	}
}

func (s *server) handleUsersCreate() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		user := &models.User{}
		if err := json.NewDecoder(r.Body).Decode(user); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		if err := s.store.User().Create(user); err != nil {
			s.error(w, r, http.StatusUnprocessableEntity, err)
			return
		}

		s.respond(w, r, http.StatusCreated, fmt.Sprintf(`Successfull, user: %v`, user))
	}
}

func (s *server) handleSessionsCreate() http.HandlerFunc {
	type request struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		req := &request{}
		if err := json.NewDecoder(r.Body).Decode(req); err != nil {
			s.error(w, r, http.StatusBadRequest, err)
			return
		}

		u, err := s.store.User().FindByEmail(req.Email)
		if err != nil || !u.ComparePassword(req.Password) {
			s.error(w, r, http.StatusUnauthorized, errors.New("incorrect email or password"))
			return
		}

		session, err := s.sessionStore.Get(r, sessionName)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		session.Values["user_id"] = u.ID
		err = s.sessionStore.Save(r, w, session)
		if err != nil {
			s.error(w, r, http.StatusInternalServerError, err)
			return
		}

		s.respond(w, r, http.StatusOK, nil)
	}
}

func (s *server) error(w http.ResponseWriter, r *http.Request, code int, err error) {
	s.respond(w, r, code, map[string]string{"error": err.Error()})
}

func (s *server) respond(w http.ResponseWriter, r *http.Request, code int, data interface{}) {
	w.WriteHeader(code)
	if data != nil {
		json.NewEncoder(w).Encode(data)
	}
}
