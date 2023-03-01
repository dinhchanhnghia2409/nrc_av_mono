import { Injectable } from '@nestjs/common';
import { Interface } from '../core';
import { DataSource } from 'typeorm';

@Injectable()
export class ModelService {
  constructor(private readonly dataSource: DataSource) {}

  getModelInterface(id: number) {
    return this.dataSource.getRepository(Interface).find({
      where: {
        model: {
          id: id,
        },
      },
    });
  }
}
