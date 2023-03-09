import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ROSNode, NodeList, SocketEnum } from '../core';
import { VehicleService } from '../vehicle/vehicle.service';
import { VehicleGateway } from './../vehicle/vehicle.gateway';
import { ROSNodeResponseDTO } from './dto/rosNode.response.dto';
import { ROSNodesCreationDTO } from './dto/ROSNodesCreation.request.dto';

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

    const latestNodes = await this.getROSNodeFromAgent(vehicle.certKey);

    return {
      currentNodes,
      latestNodes
    };
  }

  async getROSNodeFromAgent(certKey: string): Promise<ROSNode[]> {
    const result = (await this.vehicleGateway.emitToRoom(
      SocketEnum.GET_LIST_ROS_NODE,
      `${SocketEnum.ROOM_PREFIX}${certKey}`,
      {}
    )) as [ROSNode[]];
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
}
