export class ROSNodeResponseDTO {
  constructor(
    private readonly id: number,
    private readonly name: string,
    private readonly packageName: string
  ) {}
}
