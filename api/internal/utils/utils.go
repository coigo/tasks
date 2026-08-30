package utils

import (
	"regexp"
	"strings"

	"github.com/microcosm-cc/bluemonday"
)

func EnsureList[T any](l []T) []T {
	if l == nil {
		return []T{}
	}
	return l
}


func ClearHtml(html string) string {
	reBlocos := regexp.MustCompile(`(?i)</?(br|p|div|li|h[1-6]|tr)\s*/?>`)
	comEspacos := reBlocos.ReplaceAllString(html, " ")

	p := bluemonday.StrictPolicy()
	textoLimpo := p.Sanitize(comEspacos)

	return strings.Join(strings.Fields(textoLimpo), " ")
}