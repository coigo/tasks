package llm

import (
	"context"

	op "github.com/sashabaranov/go-openai"
)

type GenerateInput struct {
	prompt string
}

type LLMProvider interface {
	Generate (ctx context.Context, data GenerateInput) error
	
}

type OpenAiConfig struct {
	
}

type OpenAiProvider struct {
	client op.Client
}

func NewLLMProvider (ctx context.Context, cfg OpenAiConfig) *OpenAiProvider{
	openAi := &OpenAiProvider{}
	return openAi
}

func (o *OpenAiProvider) Generate(ctx context.Context, data GenerateInput) error {
	return nil
}

