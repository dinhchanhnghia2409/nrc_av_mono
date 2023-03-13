import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ROSNode, NodeList, SocketEnum, Vehicle } from '../core';
import { VehicleService } from '../vehicle/vehicle.service';
import { VehicleGateway } from './../vehicle/vehicle.gateway';
import { ROSNodeResponseDTO } from './dto/rosNode.response.dto';
import { ROSNodesCreationDTO } from './dto/ROSNodesCreation.request.dto';
import { ROSNodeStatusResponseDTO } from './dto/rosNodeStatus.response.dto';

@Injectable()
export class ROSNodeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly vehicleGateway: VehicleGateway,
    private readonly vehicleService: VehicleService
  ) {}

  async getVehicleROSNodes(vehicleId: number): Promise<ROSNodeResponseDTO[]> {
    await this.vehicleService.getExistedVehicle(vehicleId);
    const currentNodes: ROSNodeResponseDTO[] = await this.getROSNodeByVehicleId(vehicleId);

    return currentNodes;
  }

  async getROSNodeByVehicleId(vehicleId: number): Promise<ROSNodeResponseDTO[]> {
    return (
      await this.dataSource.getRepository(ROSNode).find({
        where: {
          nodeList: {
            vehicle_id: vehicleId,
            isDeleted: false
          }
        }
      })
    ).map((node) => new ROSNodeResponseDTO(node.id, node.name, node.packageName));
  }

  async syncVehicleNodes(
    id: number
  ): Promise<{ currentNodes: ROSNodeResponseDTO[]; latestNodes: ROSNode[] }> {
    const vehicle = await this.vehicleService.getExistedVehicle(id);
    const currentNodes: ROSNodeResponseDTO[] = await this.getROSNodeByVehicleId(id);
    let latestNodes: ROSNode[] = [];

    try {
      latestNodes = await this.getROSNodeFromAgent(vehicle);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      currentNodes,
      latestNodes
    };
  }

  async getROSNodeFromAgent(vehicle: Vehicle): Promise<ROSNode[]> {
    const result = (await this.vehicleGateway.emitToRoom(
      SocketEnum.GET_LIST_ROS_NODE,
      `${SocketEnum.ROOM_PREFIX}${vehicle.certKey}`,
      {}
    )) as [ROSNode[]];
    await this.vehicleService.checkResponseFromVehicle(result, vehicle);
    return result.reduce((acc, cur) => [...acc, ...cur], []);
  }

  async syncROSNodes(vehicleId: number, createNodesDTO: ROSNodesCreationDTO): Promise<ROSNode[]> {
    const { rosNodes } = createNodesDTO;
    const vehicle = await this.vehicleService.getExistedVehicle(vehicleId);

    let existedROSNodes = await this.dataSource.getRepository(ROSNode).find({
      where: rosNodes.map((rosNode) => ({ name: rosNode.name, packageName: rosNode.packageName }))
    });
    const unSaveROSNodes = rosNodes.filter(
      (rosNode) =>
        !existedROSNodes.find(
          (existedROSNode) =>
            existedROSNode.name === rosNode.name &&
            existedROSNode.packageName === rosNode.packageName
        )
    );
    const deletedNodeList = vehicle.nodeList.filter((nodeList) => {
      const isDeleted = !rosNodes.find(
        (rosNode) =>
          rosNode.name === nodeList.rosNode.name &&
          rosNode.packageName === nodeList.rosNode.packageName
      );
      return isDeleted;
    });

    await this.dataSource.manager.transaction(async (transactionalEntityManager) => {
      if (unSaveROSNodes.length) {
        const newROSNodes = await transactionalEntityManager.save(ROSNode, unSaveROSNodes);
        existedROSNodes = existedROSNodes.concat(newROSNodes);
      }
      const rosNodeList = existedROSNodes.map((rosNode) => ({
        rosNode,
        vehicle,
        isDeleted: false
      }));
      await transactionalEntityManager.save(NodeList, rosNodeList);
      deletedNodeList.forEach((nodeList) => {
        nodeList.isDeleted = true;
      });
      await transactionalEntityManager.save(NodeList, deletedNodeList);
    });
    return rosNodes.length ? existedROSNodes : [];
  }

  async getROSNodeStatus(vehicleId: number): Promise<ROSNodeStatusResponseDTO[]> {
    const vehicle = await this.vehicleService.getExistedVehicle(vehicleId);
    return await this.getROSNodeStatusByVehicle(vehicle);
  }

  async getROSNodeStatusByVehicle(vehicle: Vehicle): Promise<ROSNodeStatusResponseDTO[]> {
    const result = (await this.vehicleGateway.emitToRoom(
      SocketEnum.GET_STATUS_ROS_NODES,
      `${SocketEnum.ROOM_PREFIX}${vehicle.certKey}`,
      vehicle.nodeList
        .filter((nodeList) => !nodeList.isDeleted)
        .map((nodeList) => ({
          name: nodeList.rosNode.name,
          packageName: nodeList.rosNode.packageName
        }))
    )) as [ROSNodeStatusResponseDTO[]];
    return result.reduce((acc, cur) => [...acc, ...cur], []);
  }
}
