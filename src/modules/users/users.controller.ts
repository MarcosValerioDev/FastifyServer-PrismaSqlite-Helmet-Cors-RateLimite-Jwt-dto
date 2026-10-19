import type { FastifyReply, FastifyRequest } from 'fastify';
import type { IdParamDto } from '../../common/dto/id-param.dto';
import { UsersService } from './users.service';
import type { UpdateUserDto } from './dto/update-user.dto';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await this.usersService.findById(request.user.sub);
    return reply.send(user);
  };

  findAll = async (_request: FastifyRequest, reply: FastifyReply) => {
    const users = await this.usersService.findAll();
    return reply.send(users);
  };

  findById = async (request: FastifyRequest<{ Params: IdParamDto }>, reply: FastifyReply) => {
    const user = await this.usersService.findById(request.params.id);
    return reply.send(user);
  };

  update = async (
    request: FastifyRequest<{ Params: IdParamDto; Body: UpdateUserDto }>,
    reply: FastifyReply,
  ) => {
    const user = await this.usersService.update(request.params.id, request.user.sub, request.body);
    return reply.send(user);
  };

  delete = async (request: FastifyRequest<{ Params: IdParamDto }>, reply: FastifyReply) => {
    await this.usersService.delete(request.params.id, request.user.sub);
    return reply.status(204).send();
  };
}
