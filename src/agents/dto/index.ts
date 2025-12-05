import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';

enum AgentType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  TRANSFER = 'transfer',
}

export class CreateAgentDto {
  @ApiProperty({ example: 'Assistente de Vendas' })
  @IsString()
  name: string;

  @ApiProperty({ enum: AgentType, example: 'inbound' })
  @IsEnum(AgentType)
  type: string;

  @ApiProperty({ example: 'Você é um assistente prestativo...' })
  @IsString()
  systemPrompt: string;

  @ApiProperty({ example: 'Olá! Como posso ajudar?', required: false })
  @IsOptional()
  @IsString()
  firstMessage?: string;

  @ApiProperty({ example: 'en-US-JennyNeural' })
  @IsString()
  voiceId: string;

  @ApiProperty({ example: 'openai', default: 'openai' })
  @IsOptional()
  @IsString()
  llmProvider?: string;

  @ApiProperty({ example: 'gpt-4', default: 'gpt-4' })
  @IsOptional()
  @IsString()
  llmModel?: string;

  @ApiProperty({ example: 0.7, default: 0.7 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @ApiProperty({ example: 500, default: 500 })
  @IsOptional()
  @IsNumber()
  maxTokens?: number;

  @ApiProperty({ example: 0.5, default: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  interruptSens?: number;

  @ApiProperty({ example: 100, default: 100 })
  @IsOptional()
  @IsNumber()
  responseDelay?: number;
}

export class UpdateAgentDto extends PartialType(CreateAgentDto) {}
