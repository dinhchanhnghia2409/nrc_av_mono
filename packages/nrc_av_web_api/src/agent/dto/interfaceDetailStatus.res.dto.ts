import { IsArray, IsString } from 'class-validator';
import { AlgorithmStatusDTO } from './algorithmStatus.res.dto';
import { MachineStatusDTO } from './machineStatus.res.dto';
import { SensorStatusDTO } from './sensorStatus.res.dto';

export class InterfaceDetailStatusDTO {
  @IsString()
  interfaceName: string;

  @IsArray()
  machines: MachineStatusDTO[];

  @IsArray()
  algorithms: AlgorithmStatusDTO[];

  @IsArray()
  sensors: SensorStatusDTO[];
}
