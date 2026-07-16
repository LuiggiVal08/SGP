export interface ProjectTag {
  id: string;
  name: string;
  category: string;
}

export interface IProjectTagRepository {
  assign(projectId: string, tagId: string): Promise<void>;
  remove(projectId: string, tagId: string): Promise<void>;
  findByProject(
    projectId: string,
  ): Promise<{ id: string; name: string; category: string }[]>;
}
