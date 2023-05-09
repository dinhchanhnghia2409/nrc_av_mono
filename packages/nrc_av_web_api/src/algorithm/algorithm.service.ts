import { Injectable } from '@nestjs/common';
import { Algorithm } from '../core';
import { AlgorithmDTO } from '../interface/dto/algorithm.dto';

@Injectable()
export class AlgorithmService {
  updateAlgorithms(currentAlgs: Algorithm[], newAlgs: AlgorithmDTO[]): Algorithm[] {
    const updatedAlgs: Algorithm[] = [];
    newAlgs.forEach((newAlg) => {
      const currentAlg = currentAlgs.find((currentAlg) => currentAlg.id === newAlg.id);
      if (currentAlg) {
        currentAlg.name = newAlg.name;
        currentAlg.errRate = newAlg.errRate;
        currentAlg.warnRate = newAlg.warnRate;
        currentAlg.topicName = newAlg.topicName;
        currentAlg.topicType = newAlg.topicType;
        updatedAlgs.push(currentAlg);
        currentAlgs.splice(currentAlgs.indexOf(currentAlg), 1);
      } else {
        updatedAlgs.push(
          new Algorithm(
            newAlg.name,
            newAlg.errRate,
            newAlg.warnRate,
            newAlg.topicName,
            newAlg.topicType
          )
        );
      }
    });
    currentAlgs.forEach((currentAlg) => {
      currentAlg.isDeleted = true;
    });
    return updatedAlgs.concat(currentAlgs);
  }
}
