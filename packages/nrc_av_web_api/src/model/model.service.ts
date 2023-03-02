import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Interface } from '../core';

@Injectable()
export class ModelService {
  constructor(private readonly dataSource: DataSource) {}

  getModelInterface(id: number) {
    return this.dataSource.getRepository(Interface).find({
      where: {
        model: {
          id
        }
      }
    });
  }
}
