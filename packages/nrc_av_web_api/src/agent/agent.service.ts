import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AgentGateway } from './agent.gateway';
import { enc, AES, mode } from 'crypto-js';
import { Car, Cmd } from '../core';
import { DataSource } from 'typeorm';

@Injectable()
export class AgentService {
  constructor(
    private readonly agentGateway: AgentGateway,
    private readonly dataSource: DataSource,
  ) {}

  encryptData(data: string) {
    const iv = enc.Utf8.parse('1020304050607080');
    const key = enc.Base64.parse(
      'LefjQ2pEXmiy/nNZvEJ43i8hJuaAnzbA1Cbn1hOuAgA=',
    );
    const dataEncrypt = AES.encrypt(data, key, {
      iv: iv,
      mode: mode.CBC,
    }).toString();
    return dataEncrypt;
  }

  decryptData(data: string) {
    const iv = enc.Utf8.parse('1020304050607080');
    const key = enc.Base64.parse(
      'LefjQ2pEXmiy/nNZvEJ43i8hJuaAnzbA1Cbn1hOuAgA=',
    );
    const dataDecrypt = AES.decrypt(data, key, {
      iv: iv,
      mode: mode.CBC,
    }).toString(enc.Utf8);
    return dataDecrypt;
  }

  async getMessageBySocket() {
    const clientId = 'nissan1';
    try {
      return await this.agentGateway.emitToRoom('nissan/req', 'nissan', {
        clientId: this.encryptData(clientId),
        data: this.encryptData('ls'),
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendROSMasterCommand(carId: number) {
    const car = await this.dataSource.getRepository(Car).findOne({
      where: { id: carId },
    });
    if (!car) throw new HttpException('Car not found', HttpStatus.NOT_FOUND);
    const clientId = 'nissan1';
    const encryptClientId = this.encryptData(clientId);

    try {
      return await this.agentGateway.emitToRoom(
        'nissan/ros/master',
        `nissan/${car.certKey}`,
        {
          data: 'python ~/projects/nrc_ws/src/nrc_av/av/kelly_interface.py',
          clientId: encryptClientId,
        },
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendROSLaunchCommand(carId: number, rosNodeId: number) {
    const car = await this.dataSource.getRepository(Car).findOne({
      where: { id: carId },
    });
    if (!car) throw new HttpException('Car not found', HttpStatus.NOT_FOUND);

    const cmd = await this.dataSource.getRepository(Cmd).findOne({
      where: { id: rosNodeId },
    });
    const clientId = 'nissan1';
    const encryptClientId = this.encryptData(clientId);

    try {
      return await this.agentGateway.emitToRoom(
        'nissan/ros/node',
        `nissan/${car.certKey}`,
        {
          data: cmd.command,
          clientId: encryptClientId,
        },
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
