package validation

import "regexp"

// E.164 format: +<country_code><number>, 8–15 digits total
var phoneRe = regexp.MustCompile(`^\+[1-9]\d{7,14}$`)

func IsValidPhone(phone string) bool {
	return phoneRe.MatchString(phone)
}
