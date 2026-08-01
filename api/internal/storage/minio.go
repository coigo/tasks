package storage

import (
	"context"
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type ArquivoStorage interface {
	UploadTemp(ctx context.Context, nome string, conteudo io.Reader) (string, error)
	MoverTempParaTarefa(ctx context.Context, uuid string, tarefaID int32) (string, error)
	GerarURLAssinada(ctx context.Context, local string, duracao time.Duration) (string, error)
}

type MinioStorage struct {
	client   *s3.Client
	bucket   string
	tempDir  string
	endpoint string
	useSSL   bool
}

type MinioStorageConfig struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	Bucket    string
	UseSSL    bool
	TempDir   string
}

func NewMinioStorage(ctx context.Context, cfg MinioStorageConfig) (*MinioStorage, error) {
	if cfg.TempDir == "" {
		cfg.TempDir = "/temp"
	}

	resolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL:               fmt.Sprintf("%s://%s", map[bool]string{true: "https", false: "http"}[cfg.UseSSL], cfg.Endpoint),
			HostnameImmutable: true,
		}, nil
	})

	awsCfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion("us-east-1"),
		config.WithEndpointResolverWithOptions(resolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AccessKey, cfg.SecretKey, "")),
	)
	if err != nil {
		return nil, fmt.Errorf("erro ao configurar aws s3: %w", err)
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.UsePathStyle = true
	})

	storage := &MinioStorage{
		client:   client,
		bucket:   cfg.Bucket,
		tempDir:  cfg.TempDir,
		endpoint: cfg.Endpoint,
		useSSL:   cfg.UseSSL,
	}

	if err := storage.ensureBucket(ctx); err != nil {
		return nil, err
	}

	return storage, nil
}

func (s *MinioStorage) ensureBucket(ctx context.Context) error {
	_, err := s.client.HeadBucket(ctx, &s3.HeadBucketInput{
		Bucket: aws.String(s.bucket),
	})
	if err == nil {
		return nil
	}

	_, err = s.client.CreateBucket(ctx, &s3.CreateBucketInput{
		Bucket: aws.String(s.bucket),
	})
	if err != nil {
		return fmt.Errorf("erro ao criar bucket: %w", err)
	}
	return nil
}

func (s *MinioStorage) UploadTemp(ctx context.Context, nome string, conteudo io.Reader) (string, error) {
	arquivoUUID := uuid.New().String()
	destino := fmt.Sprintf("temp/%s", arquivoUUID)
	
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(destino),
		Body:   conteudo,
	})
	if err != nil {
		return "", fmt.Errorf("erro ao fazer upload: %w", err)
	}

	return arquivoUUID, nil
}

func (s *MinioStorage) MoverTempParaTarefa(ctx context.Context, arquivoUUID string, tarefaID int32) (string, error) {
	tempPath := fmt.Sprintf("temp/%s", arquivoUUID)

	destino := fmt.Sprintf("tarefas/%d/%s", tarefaID, arquivoUUID)

	_, err := s.client.CopyObject(ctx, &s3.CopyObjectInput{
		Bucket: 	aws.String(s.bucket),
		CopySource: aws.String(tempPath),
		Key: 		aws.String(destino),
	})
	if err != nil {
		return "", fmt.Errorf("erro ao copiar arquivo: %w", err)
	}

	if err != nil {
		return "", fmt.Errorf("erro ao enviar arquivo para s3: %w", err)
	}

	return destino, nil
}

func (s *MinioStorage) GerarURLAssinada(ctx context.Context, local string, duracao time.Duration) (string, error) {
	presigner := s3.NewPresignClient(s.client)
	req, err := presigner.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(local),
	}, s3.WithPresignExpires(duracao))
	if err != nil {
		return "", fmt.Errorf("erro ao gerar url assinada: %w", err)
	}
	return req.URL, nil
}

func (s *MinioStorage) RemoverArquivo(ctx context.Context, local string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(local),
	})
	if err != nil {
		return fmt.Errorf("erro ao remover arquivo: %w", err)
	}
	return nil
}

func SanitizeUUID(local string) string {
	parts := strings.Split(local, "/")
	if len(parts) > 0 {
		return parts[len(parts)-1]
	}
	return local
}
