package llm

import (
	"context"
	"fmt"
	"os"

	"github.com/openai/openai-go/v3"
	"github.com/openai/openai-go/v3/option"
	"github.com/openai/openai-go/v3/responses"
)

type GenerateInput struct {
	Prompt 		string
	DocChunk    []string
}

type ResponseChunk struct {
	Token 	string
	Err 	error
}

type LLMProvider interface {
	Generate (ctx context.Context, data GenerateInput) error
}

type OpenAiConfig struct {
	BasePrompt string
}

type OpenAiProvider struct {
	client openai.Client
	config OpenAiConfig
}

func NewLLMProvider (ctx context.Context, cfg OpenAiConfig) *OpenAiProvider{
	openAi := &OpenAiProvider{
		config: cfg,
	}
	return openAi
}

func (o *OpenAiProvider) Generate(ctx context.Context, data GenerateInput) (chan ResponseChunk, error) {

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("variável de ambiente OPENAI_API_KEY não definida")
	}

	c := openai.NewClient(
	    option.WithAPIKey(apiKey),
		option.WithBaseURL("https://openrouter.ai/api/v1"),
	)

	prompt := o.config.BasePrompt + fmt.Sprintf(`\n Pergunta: %v`, data.Prompt) + fmt.Sprintf(`\n Documento: %v`, data.DocChunk[0]) 
	stream := c.Responses.NewStreaming(ctx, responses.ResponseNewParams{
		Model: "nvidia/nemotron-3-ultra-550b-a55b:free",
		Input: responses.ResponseNewParamsInputUnion{
			OfString: openai.String(prompt),
		},
	})

	ch := make(chan ResponseChunk)
	
	go func () {
		fmt.Println("Comecando")
		defer close(ch)
		for stream.Next() {
			event := stream.Current()  
			fmt.Println("asdasd", event)

			fmt.Println("Novo Token:", event.Delta)
			select {
				case ch <- ResponseChunk{ Token: event.Delta }:
				case <-ctx.Done():
					return
			}
		}

		if err := stream.Err(); err != nil {
			select {
				case ch <- ResponseChunk{Err: fmt.Errorf("Erro ao processar stream: %v", err)}:
				case <- ctx.Done():
					return
			}
		}
	}()
	
	return ch, nil
}

