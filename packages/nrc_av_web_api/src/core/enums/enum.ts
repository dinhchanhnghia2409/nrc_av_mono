export enum CarStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  OFFLINE = 'OFFLINE',
  REGISTERED = 'REGISTERED'
}

export enum OSType {
  WINDOWS = 'WINDOWS',
  LINUX = 'LINUX',
  MACOS = 'MACOS'
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
  EVENT_CAR_ACTIVATION = 'carActivation',
  RUN_ROS_MASTER_COMMAND = 'python ~/projects/nrc_ws/src/nrc_av/av/kelly_interface.py'
}
