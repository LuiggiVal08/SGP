import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { CareersModule } from './careers/careers.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';

const modules = [
  UsersModule,
  RolesModule,
  InstitutionsModule,
  CareersModule,
  ProjectsModule,
  AuthModule,
];
export default modules;
