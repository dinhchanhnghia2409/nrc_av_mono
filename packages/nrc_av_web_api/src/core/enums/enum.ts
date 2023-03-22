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
  TIME_OUT = 5000,
  ROOM_PREFIX = 'nissan/',
  EVENT_RUN_ROS_MASTER = 'nissan/ros/master',
  EVENT_RUN_ROS_NODE = 'nissan/ros/node',
  EVENT_REGISTRATION_RESPONSE = 'registrationResponse',
  EVENT_VEHICLE_ACTIVATION = 'vehicleActivation',
  GET_LIST_ROS_NODE = 'nissan/ros/nodes',
  GET_STATUS_ROS_NODES = 'nissan/ros/nodes-status',
  EVENT_RUN_INTERFACE = 'nissan/interface/run',
  EVENT_GET_LAUNCH_FILE_STATUS = 'nissan/ros/launch-file-status'
}
