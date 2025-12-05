import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ConfigService {
  private config: any = {};

  constructor(private nestConfig: NestConfigService) {
    this.loadConfig();
  }

  private loadConfig() {
    this.config = {
      retell: {
        apiKey: this.nestConfig.get('RETELL_API_KEY'),
        configured: !!this.nestConfig.get('RETELL_API_KEY')?.startsWith('key_'),
      },
      twilio: {
        accountSid: this.nestConfig.get('TWILIO_ACCOUNT_SID'),
        authToken: this.nestConfig.get('TWILIO_AUTH_TOKEN'),
        phoneNumber: this.nestConfig.get('TWILIO_PHONE_NUMBER'),
        configured:
          !!this.nestConfig.get('TWILIO_ACCOUNT_SID')?.startsWith('AC'),
      },
      openai: {
        apiKey: this.nestConfig.get('OPENAI_API_KEY'),
        configured: !!this.nestConfig.get('OPENAI_API_KEY')?.startsWith('sk-'),
      },
      app: {
        nodeEnv: this.nestConfig.get('NODE_ENV'),
        port: this.nestConfig.get('PORT'),
        appUrl: this.nestConfig.get('APP_URL'),
      },
    };
  }

  getConfig() {
    return {
      retell: {
        configured: this.config.retell.configured,
        apiKey: this.maskSecret(this.config.retell.apiKey),
      },
      twilio: {
        configured: this.config.twilio.configured,
        accountSid: this.maskSecret(this.config.twilio.accountSid),
        phoneNumber: this.config.twilio.phoneNumber,
      },
      openai: {
        configured: this.config.openai.configured,
        apiKey: this.maskSecret(this.config.openai.apiKey),
      },
      app: this.config.app,
    };
  }

  async getIntegrationsStatus() {
    const status = {
      retell: {
        configured: this.config.retell.configured,
        status: 'not_tested',
      },
      twilio: {
        configured: this.config.twilio.configured,
        status: 'not_tested',
      },
      openai: {
        configured: this.config.openai.configured,
        status: 'not_tested',
      },
    };

    return status;
  }

  async updateRetellConfig(apiKey: string) {
    this.updateEnvFile('RETELL_API_KEY', apiKey);
    this.config.retell.apiKey = apiKey;
    this.config.retell.configured = apiKey.startsWith('key_');

    return {
      success: true,
      message: 'Retell.ai API key atualizada',
      configured: this.config.retell.configured,
    };
  }

  async updateTwilioConfig(dto: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  }) {
    this.updateEnvFile('TWILIO_ACCOUNT_SID', dto.accountSid);
    this.updateEnvFile('TWILIO_AUTH_TOKEN', dto.authToken);
    this.updateEnvFile('TWILIO_PHONE_NUMBER', dto.phoneNumber);

    this.config.twilio = {
      accountSid: dto.accountSid,
      authToken: dto.authToken,
      phoneNumber: dto.phoneNumber,
      configured: dto.accountSid.startsWith('AC'),
    };

    return {
      success: true,
      message: 'Credenciais Twilio atualizadas',
      configured: this.config.twilio.configured,
    };
  }

  async updateOpenAIConfig(apiKey: string) {
    this.updateEnvFile('OPENAI_API_KEY', apiKey);
    this.config.openai.apiKey = apiKey;
    this.config.openai.configured = apiKey.startsWith('sk-');

    return {
      success: true,
      message: 'OpenAI API key atualizada',
      configured: this.config.openai.configured,
    };
  }

  async testRetellConnection() {
    if (!this.config.retell.configured) {
      return {
        success: false,
        message: 'Retell.ai API key não configurada',
      };
    }

    try {
      // Aqui você faria uma chamada real para a API da Retell.ai
      // const retellClient = new Retell({ apiKey: this.config.retell.apiKey });
      // await retellClient.agent.list();

      return {
        success: true,
        message: 'Conexão com Retell.ai OK (simulado)',
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao conectar com Retell.ai: ${error.message}`,
      };
    }
  }

  async testTwilioConnection() {
    if (!this.config.twilio.configured) {
      return {
        success: false,
        message: 'Credenciais Twilio não configuradas',
      };
    }

    try {
      // Aqui você faria uma chamada real para a API do Twilio
      // const client = twilio(this.config.twilio.accountSid, this.config.twilio.authToken);
      // await client.api.accounts(this.config.twilio.accountSid).fetch();

      return {
        success: true,
        message: 'Conexão com Twilio OK (simulado)',
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao conectar com Twilio: ${error.message}`,
      };
    }
  }

  async testOpenAIConnection() {
    if (!this.config.openai.configured) {
      return {
        success: false,
        message: 'OpenAI API key não configurada',
      };
    }

    try {
      // Aqui você faria uma chamada real para a API da OpenAI
      // const openai = new OpenAI({ apiKey: this.config.openai.apiKey });
      // await openai.models.list();

      return {
        success: true,
        message: 'Conexão com OpenAI OK (simulado)',
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao conectar com OpenAI: ${error.message}`,
      };
    }
  }

  private maskSecret(secret: string): string {
    if (!secret || secret.length < 8) return '***';
    return secret.substring(0, 4) + '***' + secret.substring(secret.length - 4);
  }

  private updateEnvFile(key: string, value: string) {
    const envPath = join(process.cwd(), '.env');
    const fs = require('fs');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }

    fs.writeFileSync(envPath, envContent);
  }
}
