import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ROSNode, NodeList, Vehicle, ISuccessResponse, SocketEventEnum } from '../core';
import { VehicleService } from '../vehicle/vehicle.service';
import { ROSNodeDTO } from './dto/rosNode.dto';
import { ROSNodesCreationDTO } from './dto/rosNodesCreation.dto';
import { ROSNodeStatusDTO } from './dto/rosNodeStatus.dto';

@Injectable()
export class ROSNodeService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly vehicleService: VehicleService
  ) {}

  async getVehicleROSNodes(vehicleId: number): Promise<ROSNodeDTO[]> {
    await this.vehicleService.getVehicle(vehicleId);
    const currentNodes: ROSNodeDTO[] = await this.getROSNodeByVehicleId(vehicleId);

    return currentNodes;
  }

  async getROSNodeByVehicleId(vehicleId: number): Promise<ROSNodeDTO[]> {
    return (
      await this.dataSource.getRepository(ROSNode).find({
        where: {
          nodeList: {
            vehicle_id: vehicleId,
            isDeleted: false
          }
        }
      })
    ).map((node) => new ROSNodeDTO(node.id, node.name, node.packageName));
  }

  async syncVehicleNodes(
    id: number
  ): Promise<{ currentNodes: ROSNodeDTO[]; latestNodes: ROSNode[] }> {
    const vehicle = await this.vehicleService.getVehicle(id);
    const currentNodes: ROSNodeDTO[] = await this.getROSNodeByVehicleId(id);
    const latestNodes: ROSNode[] = await this.getROSNodeFromAgent(vehicle);

    return {
      currentNodes,
      latestNodes
    };
  }

  async getROSNodeFromAgent(vehicle: Vehicle): Promise<ROSNode[]> {
    let resultFromAgent: ISuccessResponse;
    try {
      resultFromAgent = await this.vehicleService.getResultFromAgent(
        vehicle,
        SocketEventEnum.GET_ROS_NODES,
        {}
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return resultFromAgent.data;
  }

  async updateVehicleNodes(
    vehicleId: number,
    createNodesDTO: ROSNodesCreationDTO
  ): Promise<ROSNode[]> {
    const { rosNodes } = createNodesDTO;
    const vehicle = await this.vehicleService.getVehicle(vehicleId);

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

  async getROSNodeStatus(vehicleId: number): Promise<ROSNodeStatusDTO[]> {
    const vehicle = await this.vehicleService.getVehicle(vehicleId);
    return await this.getROSNodeStatusByVehicle(vehicle);
  }

  async getROSNodeStatusByVehicle(vehicle: Vehicle): Promise<ROSNodeStatusDTO[]> {
    let resultFromAgent: ISuccessResponse;
    try {
      const rosNodes = vehicle.nodeList
        .filter((nodeList) => !nodeList.isDeleted)
        .map((nodeList) => ({
          name: nodeList.rosNode.name,
          packageName: nodeList.rosNode.packageName
        }));

      // add ROSCore to check status
      rosNodes.push({
        name: 'rosout',
        packageName: undefined
      });

      resultFromAgent = await this.vehicleService.getResultFromAgent(
        vehicle,
        SocketEventEnum.GET_STATUS_ROS_NODES,
        rosNodes
      );
    } catch (err) {
      throw new HttpException(err, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return resultFromAgent.data;
  }
}
