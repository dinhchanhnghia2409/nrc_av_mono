import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Algorithm } from '../core';
import { AlgorithmDTO } from '../interface/dto/algorithm.dto';

@Injectable()
export class AlgorithmService {
  addAlgorithms(
    transactionalEntityManager: EntityManager,
    algDTOs: AlgorithmDTO[]
  ): Promise<Algorithm[]> {
    return transactionalEntityManager.save(
      Algorithm,
      algDTOs.map(
        (alg) => new Algorithm(alg.name, alg.errRate, alg.warnRate, alg.topicName, alg.topicType)
      )
    );
  }
}
