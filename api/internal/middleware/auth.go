package middleware

import (
	"net/http"
	"strings"
	"tasks/internal/services"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "authorization header ausente"})
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "authorization header invalido"})
			return
		}

		claims, err := authService.ValidarToken(parts[1])
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "token invalido ou expirado"})
			return
		}

		if claims.Tipo != "access" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "tipo de token invalido"})
			return
		}

		ctx.Set("usuario_id", claims.UsuarioID)
		ctx.Set("usuario", claims.Usuario)
		ctx.Next()
	}
}

func GetUsuarioID(ctx *gin.Context) int32 {
	id, _ := ctx.Get("usuario_id")
	if v, ok := id.(int32); ok {
		return v
	}
	return 0
}
