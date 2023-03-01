import { IsString } from 'class-validator';
import * as joi from 'joi';
import { carValidateSchema } from 'src/core';

export class RegisterAgentDTO {
  @IsString()
  name: string;

  @IsString()
  model: string;

  @IsString()
  macAddress: string;

  @IsString()
  defaultInterface: string;

  @IsString()
  licenseNumber: string;

  @IsString()
  certKey: string;
}

export const vRegisterAgentDTO = joi.object<RegisterAgentDTO>({
  name: carValidateSchema.name.required(),
  model: joi.string().required(),
  macAddress: carValidateSchema.macAddress.required(),
  defaultInterface: joi.string().required(),
  licenseNumber: joi.string().required(),
  certKey: joi.string().required(),
});
