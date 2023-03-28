export enum VehicleStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  OFFLINE = 'OFFLINE'
}

export enum AgentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum SocketEnum {
  ROOM_PREFIX = 'nissan/'
}

export enum SocketEventEnum {
  REGISTRATION_REQUEST = 'nissan/vehicle/registration-request',
  VEHICLE_REGISTRATION = 'nissan/vehicle/registration',
  REGISTRATION_RESPONSE = 'nissan/vehicle/registration-response',
  VEHICLE_ACTIVATION = 'nissan/vehicle/activation',
  VEHICLE_STATUS = 'nissan/vehicle/status',

  RUN_ROS_MASTER = 'nissan/ros/master',
  RUN_ROS_NODE = 'nissan/ros/node',
  GET_ROS_NODES = 'nissan/ros/nodes',
  GET_STATUS_ROS_NODES = 'nissan/ros/nodes-status',

  RUN_INTERFACE = 'nissan/interface/run',
  GET_INTERFACE_STATUS = 'nissan/interface/status',
  STOP_INTERFACE = 'nissan/interface/stop'
}

export enum EventEmitterNameSpace {
  VEHICLE_STATUS = 'vehicle.status'
}
