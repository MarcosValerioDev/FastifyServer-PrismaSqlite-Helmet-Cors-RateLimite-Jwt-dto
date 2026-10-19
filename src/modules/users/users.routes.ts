import type { FastifyInstance } from 'fastify';
import { IdParamDto } from '../../common/dto/id-param.dto';
import { validateDto } from '../../common/validation/validate-dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { deleteSchema, findAllSchema, findByIdSchema, meSchema, updateSchema } from './users.schemas';

export async function usersRoutes(app: FastifyInstance) {
  const controller = new UsersController(new UsersService(new UsersRepository(app.prisma)));

  // Todas as rotas de /users exigem JWT
  app.addHook('onRequest', app.authenticate);

  app.get('/me', { schema: meSchema }, controller.me);
  app.get('/', { schema: findAllSchema }, controller.findAll);
  app.get(
    '/:id',
    { schema: findByIdSchema(), preValidation: [validateDto(IdParamDto, 'params')] },
    controller.findById,
  );
  app.patch(
    '/:id',
    {
      schema: updateSchema(),
      preValidation: [validateDto(IdParamDto, 'params'), validateDto(UpdateUserDto)],
    },
    controller.update,
  );
  app.delete(
    '/:id',
    { schema: deleteSchema(), preValidation: [validateDto(IdParamDto, 'params')] },
    controller.delete,
  );
}
