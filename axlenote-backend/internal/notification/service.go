package notification

import (
	"bytes"
	"fmt"
	"net/http"
	"os"
)

type Service struct {
	BaseURL string
	Topic   string
	Enabled bool
}

func New() *Service {
	return &Service{
		BaseURL: os.Getenv("NOTIFY_BASE_URL"),
		Topic:   os.Getenv("NOTIFY_TOPIC"),
		Enabled: os.Getenv("NOTIFY_ENABLED") == "true",
	}
}

func (s *Service) Send(title, message string) error {
	if !s.Enabled {
		return nil
	}

	url := fmt.Sprintf("%s/%s", s.BaseURL, s.Topic)
	req, err := http.NewRequest("POST", url, bytes.NewBufferString(message))
	if err != nil {
		return err
	}

	req.Header.Set("Title", title)
	req.Header.Set("Tags", "car,warning")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("notification failed with status: %d", resp.StatusCode)
	}

	return nil
}
