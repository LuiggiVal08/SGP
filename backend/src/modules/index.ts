import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { PnfModule } from './pnf/pnf.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';
import { SecurityQuestionsModule } from './security-questions/security-questions.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { StudentsModule } from './students/students.module';
import { ProfessorsModule } from './professors/professors.module';
import { LoopModule } from './loop/loop.module';
import { PeriodsModule } from './periods/periods.module';
import { TrajectoriesModule } from './trajectories/trajectories.module';
import { SubjectsModule } from './subjects/subjects.module';
import { CommunityPlacesModule } from './community-places/community-places.module';
import { CommunityTutorsModule } from './community-tutors/community-tutors.module';
import { TagsModule } from './tags/tags.module';
import { ProjectTagsModule } from './project-tags/project-tags.module';
// TODO: stubs disabled until sessions rebuild them — DI deps missing
// import { CompletionCertificatesModule } from './completion-certificates/completion-certificates.module';
// import { NotificationsModule } from './notifications/notifications.module';
import { DefensesModule } from './defenses/defenses.module';
import { DefenseJudgesModule } from './defense-judges/defense-judges.module';
import { DefenseEvaluationsModule } from './defense-evaluations/defense-evaluations.module';
// import { ProjectCorrectionsModule } from './project-corrections/project-corrections.module';

const modules = [
  UsersModule,
  RolesModule,
  InstitutionsModule,
  PnfModule,
  PeriodsModule,
  TrajectoriesModule,
  SubjectsModule,
  CommunityPlacesModule,
  CommunityTutorsModule,
  TagsModule,
  ProjectTagsModule,
  ProjectsModule,
  SecurityQuestionsModule,
  ActivityLogModule,
  AuthModule,
  StudentsModule,
  ProfessorsModule,
  LoopModule,
  DefensesModule,
  DefenseJudgesModule,
  DefenseEvaluationsModule,
];
export default modules;
