import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateConfigDto {
  @ApiProperty({ example: 'key_xxxxxxxxxxxxx', required: false })
  @IsOptional()
  @IsString()
  retellApiKey?: string;

  @ApiProperty({ example: 'ACxxxxxxxxxxxxxxxxx', required: false })
  @IsOptional()
  @IsString()
  twilioAccountSid?: string;

  @ApiProperty({ example: 'your_auth_token', required: false })
  @IsOptional()
  @IsString()
  twilioAuthToken?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  twilioPhoneNumber?: string;

  @ApiProperty({ example: 'sk-xxxxxxxxxxxxx', required: false })
  @IsOptional()
  @IsString()
  openaiApiKey?: string;
}
