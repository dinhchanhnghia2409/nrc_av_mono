import { AlgorithmStatusDTO } from './algorithmStatus.res.dto';
import { MachineStatusDTO } from './machineStatus.res.dto';
import { SensorStatusDTO } from './sensorStatus.res.dto';

export class InterfaceInformationDTO {
  constructor(
    readonly vehicleId: number,
    readonly interfaceId: number,
    readonly machines: MachineStatusDTO[],
    readonly algorithms: AlgorithmStatusDTO[],
    readonly sensors: SensorStatusDTO[]
  ) {}
}
