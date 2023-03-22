export interface IErrorResponse {
  status: 'error';
  message: string;
}

export interface ISuccessResponse {
  status: 'success';
  data?: any;
}

export type IResponse = IErrorResponse | ISuccessResponse;
