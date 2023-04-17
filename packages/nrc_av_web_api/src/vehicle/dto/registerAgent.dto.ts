import { IsString } from 'class-validator';

export class RegisterAgentDTO {
  @IsString()
  name: string;

  @IsString()
  model: string;

  @IsString()
  macAddress: string;

  @IsString()
  certKey: string;
}
