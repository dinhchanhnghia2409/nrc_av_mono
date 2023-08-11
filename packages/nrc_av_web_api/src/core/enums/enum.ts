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

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum SocketEventEnum {
  REGISTRATION_REQUEST = 'nissan/vehicle/registration-request',
  VEHICLE_REGISTRATION = 'nissan/vehicle/registration',
  REGISTRATION_RESPONSE = 'nissan/vehicle/registration-response',
  VEHICLE_STATUS = 'nissan/vehicle/status',
  GET_INTERFACE_DETAIL_STATUS = 'nissan/vehicle/interface/detail/status',

  RUN_ROS_MASTER = 'nissan/ros/master',
  RUN_ROS_NODE = 'nissan/ros/node',
  GET_ROS_NODES = 'nissan/ros/nodes',
  GET_STATUS_ROS_NODES = 'nissan/ros/nodes-status',

  RUN_INTERFACE = 'nissan/interface/run',
  GET_INTERFACE_STATUS = 'nissan/interface/status',
  STOP_INTERFACE = 'nissan/interface/stop',
  RUN_INTERFACE_COMMAND = 'nissan/interface/exec/command',
  STOP_INTERFACE_COMMAND = 'nissan/interface/stop/command'
}

export enum EventEmitterNameSpace {
  VEHICLE_STATUS = 'vehicle.status',
  VEHICLE_INTERFACE_DETAIL_STATUS = 'vehicle.interface.detail.status'
}

export enum Alias {
  INTERFACE = 'interface',
  ALGORITHMS = 'algorithms',
  MACHINES = 'machines',
  SENSORS = 'sensors',
  COMMANDS = 'commands',
  MULTI_DESTINATIONS = 'multiDestinations',
  INTERFACE_DESTINATIONS = 'interfaceDestinations',
  DESTINATIONS = 'destinations',
  DESTINATION = 'destination'
}
