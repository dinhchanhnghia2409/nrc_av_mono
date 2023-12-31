import { IsArray, IsString } from 'class-validator';
import { AlgorithmStatusDTO } from './algorithmStatus.dto';
import { CommandsStatusDTO } from './commandsStatus.dto';
import { MachineStatusDTO } from './machineStatus.dto';
import { SensorStatusDTO } from './sensorStatus.dto';

export class InterfaceDetailStatusDTO {
  @IsString()
  interfaceName: string;

  @IsArray()
  machines: MachineStatusDTO[];

  @IsArray()
  algorithms: AlgorithmStatusDTO[];

  @IsArray()
  sensors: SensorStatusDTO[];

  @IsArray()
  statusCommands: CommandsStatusDTO[];

  @IsString()
  status: string;

  @IsString()
  statusRunAll: string;
}
